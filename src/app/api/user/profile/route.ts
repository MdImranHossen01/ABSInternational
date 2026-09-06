import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';


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
          status: 'active',
        });
        const userObj = newUser.toObject();
        delete userObj.password;
        return NextResponse.json(userObj, { status: 200 });
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
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

    // Handle KYC NID changes
    if (nidNumber !== undefined) user.nidNumber = nidNumber;
    if (nidFrontImage !== undefined) user.nidFrontImage = nidFrontImage;
    if (nidBackImage !== undefined) user.nidBackImage = nidBackImage;
    
    // Automatically flag as Pending for admin review when NID details are submitted/changed
    if (nidNumber || nidFrontImage || nidBackImage) {
      if (user.nidStatus === 'Not Submitted' || user.nidStatus === 'Rejected') {
        user.nidStatus = 'Pending';
      }
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

