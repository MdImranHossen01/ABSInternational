import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { createNotification } from '@/lib/notifications';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, sourceWallet, targetMemberId } = await req.json();

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 50 || !sourceWallet || !targetMemberId) {
      return NextResponse.json({ message: 'Minimum transfer amount is ৳50 and all fields are required.' }, { status: 400 });
    }

    if (sourceWallet !== 'depositWallet' && sourceWallet !== 'bonusWallet') {
      return NextResponse.json({ message: 'Invalid source wallet.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check sender
    const sender = await User.findById((session.user as any).id);
    if (!sender) {
      return NextResponse.json({ message: 'Sender not found.' }, { status: 404 });
    }

    if (sender.memberId === targetMemberId) {
      return NextResponse.json({ message: 'Cannot transfer funds to yourself.' }, { status: 400 });
    }

    const senderBalance = sourceWallet === 'depositWallet' ? sender.depositWallet : sender.bonusWallet;
    if (senderBalance < numAmount) {
      return NextResponse.json({ message: 'Insufficient funds in selected wallet.' }, { status: 400 });
    }

    // Check recipient
    const recipient = await User.findOne({ memberId: targetMemberId });
    if (!recipient) {
      return NextResponse.json({ message: 'Recipient Member ID not found.' }, { status: 404 });
    }

    // Execute atomic-like transfers
    if (sourceWallet === 'depositWallet') {
      sender.depositWallet -= numAmount;
    } else {
      sender.bonusWallet -= numAmount;
    }
    recipient.depositWallet += numAmount;

    await sender.save();
    await recipient.save();

    // Log transactions
    await WalletTransaction.create([
      {
        userId: sender._id,
        amount: numAmount,
        type: 'transfer_out',
        status: 'completed',
        description: `Transferred ৳${numAmount} from ${sourceWallet === 'depositWallet' ? 'Deposit' : 'Bonus'} Wallet to member ${targetMemberId}`,
      },
      {
        userId: recipient._id,
        amount: numAmount,
        type: 'transfer_in',
        status: 'completed',
        description: `Received ৳${numAmount} from member ${sender.memberId} (${sender.name})`,
      }
    ]);

    // Send notifications
    await Promise.all([
      createNotification({
        userId: sender._id,
        title: 'Fund Transferred',
        message: `You transferred ৳${numAmount.toLocaleString()} to ${recipient.name} (${targetMemberId}).`,
        type: 'wallet',
        link: '/dashboard/wallet',
      }),
      createNotification({
        userId: recipient._id,
        title: 'Fund Received',
        message: `You received ৳${numAmount.toLocaleString()} from ${sender.name} (${sender.memberId}) into your Deposit Wallet.`,
        type: 'wallet',
        link: '/dashboard/wallet',
      }),
    ]);

    return NextResponse.json({
      message: `Successfully transferred ৳${numAmount} to ${recipient.name}!`,
      depositWallet: sender.depositWallet,
      bonusWallet: sender.bonusWallet
    });
  } catch (error: any) {
    console.error('Error in transfer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
