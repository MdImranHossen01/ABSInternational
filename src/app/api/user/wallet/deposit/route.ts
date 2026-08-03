import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, paymentMethod, senderNumber, transactionId } = await req.json();

    if (!amount || amount <= 0 || !paymentMethod || !senderNumber || !transactionId) {
      return NextResponse.json({ message: 'Missing required deposit details.' }, { status: 400 });
    }

    await connectToDatabase();

    const depositTx = await WalletTransaction.create({
      userId: (session.user as any).id,
      amount,
      type: 'deposit',
      status: 'pending',
      description: `Deposit request via ${paymentMethod.toUpperCase()} (Sender: ${senderNumber}, TxID: ${transactionId})`,
    });

    return NextResponse.json({
      message: 'Deposit request submitted successfully! Pending admin approval.',
      transaction: depositTx
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting deposit:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
