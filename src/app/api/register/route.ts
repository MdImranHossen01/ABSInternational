import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { sendWelcomeRegistrationEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      nidNumber,
      sponsorId,
      placementId,
      placementPosition,
      password,
      // fallback legacy fields
      name: legacyName,
      address,
      division,
      district,
      thana,
    } = body;

    const fullName = (firstName || lastName)
      ? `${firstName || ''} ${lastName || ''}`.trim()
      : (legacyName || username || 'Member');

    if (!email || !password || !phone) {
      return NextResponse.json(
        { message: 'Please provide email, phone, and password.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user already exists with this email address.' },
        { status: 409 }
      );
    }

    // Check username uniqueness if provided
    let cleanUsername: string | undefined = undefined;
    if (typeof username === 'string' && username.trim()) {
      const formatted = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(formatted)) {
        return NextResponse.json(
          { message: 'Username must be 3-30 alphanumeric characters or underscore.' },
          { status: 400 }
        );
      }
      const existingUsername = await User.findOne({ username: formatted });
      if (existingUsername) {
        return NextResponse.json(
          { message: 'Username is already taken. Please choose a different username.' },
          { status: 409 }
        );
      }
      cleanUsername = formatted;
    }

    // Verify Sponsor ID / Username if provided
    let verifiedSponsorMemberId: string | undefined = undefined;
    let verifiedSponsorName: string | undefined = undefined;
    if (sponsorId && sponsorId.trim()) {
      const cleanSponsorInput = sponsorId.trim();
      const sponsor = await User.findOne({
        $or: [
          { memberId: cleanSponsorInput.toUpperCase() },
          { username: cleanSponsorInput.toLowerCase() },
          { phone: cleanSponsorInput },
        ]
      });

      if (!sponsor) {
        return NextResponse.json(
          { message: 'Sponsor ID or Username not found in the system.' },
          { status: 400 }
        );
      }
      verifiedSponsorMemberId = sponsor.memberId;
      verifiedSponsorName = sponsor.name || sponsor.username || sponsor.memberId;
    }

    // Verify Placement ID and Hand Position (Max 6 hands: 1 to 6)
    let verifiedPlacementMemberId: string | undefined = undefined;
    let verifiedPlacementName: string | undefined = undefined;
    let verifiedPlacementPosition: number | undefined = undefined;

    if (placementId && placementId.trim()) {
      const cleanPlacementInput = placementId.trim();
      const placementUser = await User.findOne({
        $or: [
          { memberId: cleanPlacementInput.toUpperCase() },
          { username: cleanPlacementInput.toLowerCase() },
          { phone: cleanPlacementInput },
        ]
      });

      if (!placementUser) {
        return NextResponse.json(
          { message: 'Placement ID or Username not found in the system.' },
          { status: 400 }
        );
      }

      verifiedPlacementMemberId = placementUser.memberId;
      verifiedPlacementName = placementUser.name || placementUser.username || placementUser.memberId;

      if (!placementPosition) {
        return NextResponse.json(
          { message: 'Please select a placement hand position (Hand 1 to Hand 6).' },
          { status: 400 }
        );
      }

      const posNum = Number(placementPosition);
      if (isNaN(posNum) || posNum < 1 || posNum > 6) {
        return NextResponse.json(
          { message: 'Placement hand position must be between 1 and 6.' },
          { status: 400 }
        );
      }

      // Check if position is already occupied under this placement user
      const existingOccupant = await User.findOne({
        placementId: verifiedPlacementMemberId,
        placementPosition: posNum,
      });

      if (existingOccupant) {
        return NextResponse.json(
          { message: `Hand ${posNum} is already occupied under member ${verifiedPlacementMemberId}. Please select another hand position.` },
          { status: 400 }
        );
      }

      // Check if user already reached maximum 6 direct downlines
      const totalPlacements = await User.countDocuments({
        placementId: verifiedPlacementMemberId,
      });

      if (totalPlacements >= 6) {
        return NextResponse.json(
          { message: `Placement member ${verifiedPlacementMemberId} already has all 6 direct positions filled.` },
          { status: 400 }
        );
      }

      verifiedPlacementPosition = posNum;
    }

    // Generate unique member ID
    let memberId = '';
    let isUnique = false;
    while (!isUnique) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      memberId = `ABS-${rand}`;
      const duplicate = await User.findOne({ memberId });
      if (!duplicate) {
        isUnique = true;
      }
    }

    const user = await User.create({
      name: fullName,
      firstName: firstName?.trim() || undefined,
      lastName: lastName?.trim() || undefined,
      username: cleanUsername,
      email: normalizedEmail,
      password,
      phone: phone.trim(),
      nidNumber: nidNumber?.trim() || undefined,
      memberId,
      sponsorId: verifiedSponsorMemberId,
      placementId: verifiedPlacementMemberId,
      placementPosition: verifiedPlacementPosition,
      depositWallet: 0,
      bonusWallet: 0,
      withdrawalWallet: 0,
      addresses: address ? [{
        street: address,
        division: division || '',
        state: district || '',
        city: thana || '',
        country: 'Bangladesh',
        isDefault: true
      }] : [],
      role: 'user',
    });

    // Increment teamCount for all parents up to 10 levels if sponsorId is present
    if (verifiedSponsorMemberId) {
      let currentSponsorId = verifiedSponsorMemberId;
      for (let i = 0; i < 10; i++) {
        const parent = await User.findOneAndUpdate(
          { memberId: currentSponsorId },
          { $inc: { teamCount: 1 } },
          { new: true }
        );
        if (parent && parent.sponsorId) {
          currentSponsorId = parent.sponsorId;
        } else {
          break;
        }
      }
    }

    // Build human-readable address & joining date for email
    const addressParts = [
      address?.trim(),
      thana?.trim(),
      district?.trim(),
      division?.trim(),
    ].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? `${addressParts.join(', ')}, Bangladesh` : undefined;

    const joiningDate = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' (BST)';

    // Send welcome email with credentials & reference code
    sendWelcomeRegistrationEmail({
      email: normalizedEmail,
      name: fullName,
      memberId: user.memberId,
      username: user.username,
      password,
      phone: phone.trim(),
      nidNumber: nidNumber?.trim() || undefined,
      address: fullAddress,
      sponsorId: verifiedSponsorMemberId,
      sponsorName: verifiedSponsorName,
      placementId: verifiedPlacementMemberId,
      placementName: verifiedPlacementName,
      placementPosition: verifiedPlacementPosition,
      joiningDate,
    }).catch(err => console.error('Background welcome email error:', err));

    return NextResponse.json(
      {
        message: 'User registered successfully!',
        userId: user._id,
        memberId: user.memberId,
        username: user.username,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'A user with this email or username already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Failed to register user. Please try again.' },
      { status: 500 }
    );
  }
}
