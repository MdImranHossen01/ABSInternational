import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { createAdminNotification } from '@/lib/notifications';


export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let query: any = {};
    if (session.user.id) {
      query._id = session.user.id;
    } else if (session.user.email) {
      query.email = session.user.email.toLowerCase();
    }

    let user = await User.findOne(query).select('-password').lean();

    // If not found by ID, try finding by email
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() }).select('-password').lean();
    }

    if (!user) {
      // If user is authenticated via OAuth / session but not in DB yet, create profile
      if (session.user.email) {
        const newUser = await User.create({
          name: session.user.name || 'User',
          email: session.user.email.toLowerCase(),
          image: session.user.image || '',
          role: session.user.email === 'imranshuvo101@gmail.com' ? 'super_admin' : 'user',
        });
        const userObj = newUser.toObject();
        delete userObj.password;
        return NextResponse.json({ ...userObj, directCount: 0 }, { status: 200 });
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Count active direct downlines (level 1 only) for rank progress
    // Also auto-assign memberId if missing (e.g. admin-created premium users)
    let memberIdForCount = (user as any).memberId;

    if (!memberIdForCount && (user as any).isSubscriptionActive) {
      // Generate a unique memberId for this premium user
      const userDoc = await User.findOne(session.user.id ? { _id: session.user.id } : { email: session.user.email?.toLowerCase() });
      if (userDoc && !userDoc.memberId) {
        let isUnique = false;
        while (!isUnique) {
          const rand = Math.floor(100000 + Math.random() * 900000);
          const candidate = `ABS-${rand}`;
          const duplicate = await User.findOne({ memberId: candidate });
          if (!duplicate) {
            userDoc.memberId = candidate;
            await userDoc.save();
            memberIdForCount = candidate;
            isUnique = true;
          }
        }
      }
    }

    const directCount = memberIdForCount
      ? await User.countDocuments({ sponsorId: memberIdForCount, isSubscriptionActive: true })
      : 0;

    return NextResponse.json({ ...user, memberId: memberIdForCount || (user as any).memberId, directCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || (!session.user.id && !session.user.email)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { 
      name, 
      image, 
      phone, 
      address,
      email,
      password,
      nidNumber,
      nidFrontImage,
      nidBackImage,
      kycFullName,
      kycDateOfBirth,
      kycFatherName,
      kycMotherName,
      kycPresentAddress,
      kycPermanentAddress,
      kycOwnerPhoto,
      isKycSubmit,
      bkashNo,
      nagadNo,
      rocketNo,
      bankName,
      bankBranch,
      bankAccountNo,
      bankRoutingNo
    } = data;

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    await connectToDatabase();
    let query: any = {};
    if (session.user.id) {
      query._id = session.user.id;
    } else if (session.user.email) {
      query.email = session.user.email.toLowerCase();
    }

    let user = await User.findOne(query);
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() });
    }
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.name = name;
    if (image !== undefined) user.image = image;
    if (phone !== undefined) user.phone = phone;

    // Handle KYC fields
    if (kycFullName !== undefined) user.kycFullName = kycFullName;
    if (kycDateOfBirth !== undefined) user.kycDateOfBirth = kycDateOfBirth;
    if (kycFatherName !== undefined) user.kycFatherName = kycFatherName;
    if (kycMotherName !== undefined) user.kycMotherName = kycMotherName;
    if (kycPresentAddress !== undefined) user.kycPresentAddress = kycPresentAddress;
    if (kycPermanentAddress !== undefined) user.kycPermanentAddress = kycPermanentAddress;
    if (kycOwnerPhoto !== undefined) user.kycOwnerPhoto = kycOwnerPhoto;
    if (nidNumber !== undefined) user.nidNumber = nidNumber;
    if (nidFrontImage !== undefined) user.nidFrontImage = nidFrontImage;
    if (nidBackImage !== undefined) user.nidBackImage = nidBackImage;

    // Strict validation if user is explicitly submitting KYC
    if (isKycSubmit) {
      const missingFields: string[] = [];
      if (!user.phone && !phone) missingFields.push('Owner Mobile Number');
      if (!user.kycFullName && !name) missingFields.push('Full Name');
      if (!user.nidNumber || user.nidNumber.trim().length < 10) missingFields.push('Valid NID Number (min 10 digits)');
      if (!user.kycDateOfBirth) missingFields.push('Date of Birth');
      if (!user.kycFatherName) missingFields.push("Father's Name");
      if (!user.kycMotherName) missingFields.push("Mother's Name");
      if (!user.kycPresentAddress) missingFields.push('Present Address');
      if (!user.kycPermanentAddress) missingFields.push('Permanent Address');
      if (!user.nidFrontImage) missingFields.push('NID Front Photo');
      if (!user.nidBackImage) missingFields.push('NID Back Photo');
      if (!user.kycOwnerPhoto) missingFields.push('Owner Photo');

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            message: `Please fill in all mandatory KYC fields: ${missingFields.join(', ')}`,
            missingFields,
          },
          { status: 400 }
        );
      }

      // Mark as Pending
      user.nidStatus = 'Pending';
      user.nidRejectionReason = undefined;

      await createAdminNotification({
        title: 'New KYC Verification Submitted',
        message: `Member ${user.name} (${user.memberId}) submitted complete National ID (KYC) documents for verification.`,
        type: 'kyc',
        link: '/admin/kyc',
      });
    } else if (
      user.nidNumber &&
      user.nidFrontImage &&
      user.nidBackImage &&
      user.kycOwnerPhoto &&
      (user.nidStatus === 'Not Submitted' || user.nidStatus === 'Rejected')
    ) {
      user.nidStatus = 'Pending';
      await createAdminNotification({
        title: 'New KYC Verification Submitted',
        message: `Member ${user.name} (${user.memberId}) submitted NID verification documents for review.`,
        type: 'kyc',
        link: '/admin/kyc',
      });
    }

    // Handle Payment Credentials
    if (bkashNo !== undefined) user.bkashNo = bkashNo;
    if (nagadNo !== undefined) user.nagadNo = nagadNo;
    if (rocketNo !== undefined) user.rocketNo = rocketNo;
    if (bankName !== undefined) user.bankName = bankName;
    if (bankBranch !== undefined) user.bankBranch = bankBranch;
    if (bankAccountNo !== undefined) user.bankAccountNo = bankAccountNo;
    if (bankRoutingNo !== undefined) user.bankRoutingNo = bankRoutingNo;

    if (email && typeof email === 'string' && email.toLowerCase() !== (user.email || '').toLowerCase()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json({ message: 'Email is already in use by another account' }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    if (address) {
      const addrObj = {
        street: address.street || '',
        division: address.division || address.state || '',
        city: address.city || '',
        state: address.state || address.division || '',
        zipCode: address.zipCode || '',
        country: address.country || 'Bangladesh',
        isDefault: true,
      };

      if (user.addresses && user.addresses.length > 0) {
        user.addresses[0].street = addrObj.street;
        user.addresses[0].division = addrObj.division;
        user.addresses[0].city = addrObj.city;
        user.addresses[0].state = addrObj.state;
        user.addresses[0].zipCode = addrObj.zipCode;
        user.addresses[0].country = addrObj.country;
      } else {
        user.addresses = [addrObj];
      }
    }

    if (data.password && typeof data.password === 'string' && data.password.trim().length >= 6) {
      user.password = data.password.trim();
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ message: 'Profile updated successfully', user: userObj }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

