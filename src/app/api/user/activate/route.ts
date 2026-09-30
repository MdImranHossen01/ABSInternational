/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';
import { executePremiumActivation, PACKAGE_PRICE } from '@/lib/mlm-activation';

// ─── POST /api/user/activate ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const inputSponsorId = body?.sponsorId?.trim();
    if (inputSponsorId && !user.sponsorId) {
      if (inputSponsorId === user.memberId) {
        return NextResponse.json({ message: 'You cannot enter your own Member ID as Sponsor ID.' }, { status: 400 });
      }
      const validSponsor = await User.findOne({ memberId: inputSponsorId });
      if (!validSponsor) {
        return NextResponse.json({ message: `Sponsor ID "${inputSponsorId}" not found.` }, { status: 400 });
      }
      user.sponsorId = inputSponsorId;
      // Increment teamCount for upline chain up to 10 levels
      let currentSponsorId: string | undefined = inputSponsorId;
      for (let i = 0; i < 10 && currentSponsorId; i++) {
        const parent: any = await User.findOneAndUpdate(
          { memberId: currentSponsorId },
          { $inc: { teamCount: 1 } },
          { new: true }
        );
        currentSponsorId = parent?.sponsorId;
      }
    }

    if (user.isSubscriptionActive) {
      return NextResponse.json({ message: 'Your membership is already active.' }, { status: 400 });
    }

    // ── Strict KYC Approval Requirement ─────────────────────────────────────
    if (user.nidStatus !== 'Approved') {
      return NextResponse.json(
        {
          message:
            user.nidStatus === 'Pending'
              ? 'Your National ID (KYC) verification is currently under review by admin. You can activate Premium Membership once it is approved.'
              : 'KYC Verification Required. Please complete and get your National ID (KYC) verification approved before activating Premium Membership.',
          nidStatus: user.nidStatus,
          requiresKyc: true,
        },
        { status: 403 }
      );
    }

    if (user.depositWallet < PACKAGE_PRICE) {
      return NextResponse.json(
        { message: `Insufficient balance. Minimum ${PACKAGE_PRICE} BDT required in Deposit Wallet.` },
        { status: 400 }
      );
    }

    // Run identical centralized MLM distribution logic
    const result = await executePremiumActivation(user, {
      bypassBalanceDeduction: false,
      isManualAdmin: false,
    });

    return NextResponse.json({
      message: 'Account activated successfully as Premium Member! Welcome to ABS International.',
      distribution: result.distribution,
      user: result.user
    });
  } catch (error: any) {
    console.error('Activation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
