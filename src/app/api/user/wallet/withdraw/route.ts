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

    const { amount, paymentMethod, accountNumber, pin } = await req.json();

    if (!amount || amount <= 0 || !paymentMethod || !accountNumber || !pin) {
      return NextResponse.json({ message: 'Missing required withdrawal details.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById((session.user as any).id).select('+transactionPin');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.transactionPin) {
      return NextResponse.json({ message: 'Please set a secure transaction PIN first.' }, { status: 400 });
    }

    const isPinValid = await bcrypt.compare(pin, user.transactionPin);
    if (!isPinValid) {
      return NextResponse.json({ message: 'Invalid transaction PIN.' }, { status: 400 });
    }

    if (user.withdrawalWallet < amount) {
      return NextResponse.json({ message: 'Insufficient balance in Withdrawal Wallet.' }, { status: 400 });
    }

    // Deduct immediately to prevent double spending
    user.withdrawalWallet -= amount;
    await user.save();

    const withdrawTx = await WalletTransaction.create({
      userId: user._id,
      amount,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal request to ${paymentMethod.toUpperCase()} (${accountNumber})`,
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully! Pending approval.',
      transaction: withdrawTx,
      withdrawalWallet: user.withdrawalWallet
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting withdrawal:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
