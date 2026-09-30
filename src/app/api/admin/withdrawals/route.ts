import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Get all pending withdrawal transactions
    const withdrawals = await WalletTransaction.find({ type: 'withdrawal' })
      .populate('userId', 'name email memberId phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(withdrawals);
  } catch (error: any) {
    console.error('Error loading withdrawals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId, status } = await req.json();

    if (!transactionId || !['completed', 'failed'].includes(status)) {
      return NextResponse.json({ message: 'Invalid payload.' }, { status: 400 });
    }

    await connectToDatabase();
    const tx = await WalletTransaction.findById(transactionId);
    if (!tx || tx.type !== 'withdrawal') {
      return NextResponse.json({ message: 'Withdrawal transaction not found.' }, { status: 404 });
    }

    if (tx.status !== 'pending') {
      return NextResponse.json({ message: 'Transaction already processed.' }, { status: 400 });
    }

    tx.status = status;
    await tx.save();

    // If rejected, refund the amount back to user's withdrawalWallet
    if (status === 'failed') {
      const user = await User.findById(tx.userId);
      if (user) {
        user.withdrawalWallet += tx.amount;
        await user.save();
        
        // Log refund transaction
        await WalletTransaction.create({
          userId: user._id,
          amount: tx.amount,
          type: 'refund',
          status: 'completed',
          description: `Refund for rejected withdrawal request #${tx._id.toString().slice(-8).toUpperCase()}`,
        });

        await createNotification({
          userId: user._id,
          title: 'Withdrawal Request Rejected',
          message: `Your withdrawal request of ৳${tx.amount.toLocaleString()} was rejected and the amount has been refunded back to your Withdrawal Wallet.`,
          type: 'wallet',
          link: '/dashboard/wallet',
        });
      }
    } else if (status === 'completed') {
      await createNotification({
        userId: tx.userId,
        title: 'Withdrawal Payout Approved',
        message: `Your withdrawal payout of ৳${tx.amount.toLocaleString()} has been processed and approved successfully.`,
        type: 'wallet',
        link: '/dashboard/wallet',
      });
    }

    return NextResponse.json({ message: `Withdrawal request ${status === 'completed' ? 'approved' : 'rejected'} successfully.` });
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
