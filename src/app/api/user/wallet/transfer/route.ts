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

    const { amount, sourceWallet, targetMemberId, pin } = await req.json();

    if (!amount || amount <= 0 || !sourceWallet || !targetMemberId || !pin) {
      return NextResponse.json({ message: 'Missing transfer parameters.' }, { status: 400 });
    }

    if (sourceWallet !== 'depositWallet' && sourceWallet !== 'bonusWallet') {
      return NextResponse.json({ message: 'Invalid source wallet.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check sender
    const sender = await User.findById((session.user as any).id).select('+transactionPin');
    if (!sender) {
      return NextResponse.json({ message: 'Sender not found.' }, { status: 404 });
    }

    if (sender.memberId === targetMemberId) {
      return NextResponse.json({ message: 'Cannot transfer funds to yourself.' }, { status: 400 });
    }

    if (!sender.transactionPin) {
      return NextResponse.json({ message: 'Please set a secure transaction PIN first.' }, { status: 400 });
    }

    const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
    if (!isPinValid) {
      return NextResponse.json({ message: 'Invalid transaction PIN.' }, { status: 400 });
    }

    const senderBalance = sourceWallet === 'depositWallet' ? sender.depositWallet : sender.bonusWallet;
    if (senderBalance < amount) {
      return NextResponse.json({ message: 'Insufficient funds in selected wallet.' }, { status: 400 });
    }

    // Check recipient
    const recipient = await User.findOne({ memberId: targetMemberId });
    if (!recipient) {
      return NextResponse.json({ message: 'Recipient Member ID not found.' }, { status: 404 });
    }

    // Execute atomic-like transfers
    if (sourceWallet === 'depositWallet') {
      sender.depositWallet -= amount;
    } else {
      sender.bonusWallet -= amount;
    }
    recipient.depositWallet += amount;

    await sender.save();
    await recipient.save();

    // Log transactions
    await WalletTransaction.create([
      {
        userId: sender._id,
        amount,
        type: 'transfer_out',
        status: 'completed',
        description: `Transferred ৳${amount} from ${sourceWallet === 'depositWallet' ? 'Deposit' : 'Bonus'} Wallet to member ${targetMemberId}`,
      },
      {
        userId: recipient._id,
        amount,
        type: 'transfer_in',
        status: 'completed',
        description: `Received ৳${amount} from member ${sender.memberId} (${sender.name})`,
      }
    ]);

    return NextResponse.json({
      message: `Successfully transferred ৳${amount} to ${recipient.name}!`,
      depositWallet: sender.depositWallet,
      bonusWallet: sender.bonusWallet
    });
  } catch (error: any) {
    console.error('Error in transfer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
