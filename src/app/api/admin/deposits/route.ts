import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Get all pending deposit transactions
    const deposits = await WalletTransaction.find({ type: 'deposit' })
      .populate('userId', 'name email memberId phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(deposits);
  } catch (error: any) {
    console.error('Error loading deposits:', error);
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
    if (!tx || tx.type !== 'deposit') {
      return NextResponse.json({ message: 'Deposit transaction not found.' }, { status: 404 });
    }

    if (tx.status !== 'pending') {
      return NextResponse.json({ message: 'Transaction already processed.' }, { status: 400 });
    }

    tx.status = status;
    await tx.save();

    // If approved, add to user's depositWallet
    if (status === 'completed') {
      const user = await User.findById(tx.userId);
      if (user) {
        user.depositWallet += tx.amount;
        await user.save();
      }
    }

    return NextResponse.json({ message: `Deposit request ${status === 'completed' ? 'approved' : 'rejected'} successfully.` });
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
