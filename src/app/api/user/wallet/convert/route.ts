/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Invalid amount.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (user.bonusWallet < amount) {
      return NextResponse.json(
        { message: `Insufficient Bonus Wallet balance. Available: ৳${user.bonusWallet}` },
        { status: 400 }
      );
    }

    // Move funds: Bonus → Withdrawal
    user.bonusWallet -= amount;
    user.withdrawalWallet += amount;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      amount,
      type: 'transfer_in',
      status: 'completed',
      description: `Converted ৳${amount} from Bonus Wallet to Withdrawal Wallet`,
    });

    return NextResponse.json({
      message: `Successfully converted ৳${amount} to Withdrawal Wallet!`,
      bonusWallet: user.bonusWallet,
      withdrawalWallet: user.withdrawalWallet,
    });
  } catch (error: any) {
    console.error('Convert error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
