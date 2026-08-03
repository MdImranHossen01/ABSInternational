import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';


export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, address, division, district, thana, sponsorId } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: 'Please provide all required fields.' },
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

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email.' },
        { status: 409 }
      );
    }

    // Verify Sponsor ID if provided
    if (sponsorId) {
      const sponsor = await User.findOne({ memberId: sponsorId });
      if (!sponsor) {
        return NextResponse.json(
          { message: 'Sponsor ID not found in the system.' },
          { status: 400 }
        );
      }
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
      name,
      email: normalizedEmail,
      password,
      phone,
      memberId,
      sponsorId: sponsorId || undefined,
      depositWallet: 0,
      bonusWallet: 0,
      withdrawalWallet: 0,
      addresses: [{
        street: address,
        division: division,
        state: district,
        city: thana,
        country: 'Bangladesh',
        isDefault: true
      }],
      role: 'user',
    });

    // Increment teamCount for all parents up to 10 levels if sponsorId is present
    if (sponsorId) {
      let currentSponsorId = sponsorId;
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

    return NextResponse.json(
      { message: 'User registered successfully!', userId: user._id, memberId: user.memberId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { message: 'Failed to register user.' },
      { status: 500 }
    );
  }
}

