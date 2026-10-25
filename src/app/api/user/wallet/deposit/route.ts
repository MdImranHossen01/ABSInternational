import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import { createNotification, createAdminNotification } from '@/lib/notifications';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, paymentMethod, senderNumber, transactionId, note } = await req.json();

    if (!amount || amount <= 0 || !paymentMethod || !senderNumber) {
      return NextResponse.json({ message: 'Missing required deposit details. Please provide amount, payment method, and sender phone number.' }, { status: 400 });
    }

    const cleanSender = String(senderNumber).trim();
    const cleanTrxId = transactionId ? String(transactionId).trim().toUpperCase() : '';
    const cleanNote = note ? String(note).trim() : '';

    if (cleanTrxId) {
      // Check if user submitted a phone number as transactionId
      const isPhoneNumber = 
        /^01[3-9]\d{8}$/.test(cleanTrxId) || 
        /^(?:\+?8801|8801)[3-9]\d{8}$/.test(cleanTrxId) || 
        cleanTrxId === cleanSender;

      if (isPhoneNumber || cleanTrxId.length < 4) {
        return NextResponse.json({ 
          message: 'Invalid Transaction ID. Please enter a valid transaction ID received via SMS (e.g., BL9A7K8PQ2), not a phone number.' 
        }, { status: 400 });
      }
    }

    await connectToDatabase();

    const descParts = [
      `Deposit request via ${paymentMethod.toUpperCase()}`,
      `Sender: ${cleanSender}`,
    ];
    if (cleanTrxId) descParts.push(`TxID: ${cleanTrxId}`);
    if (cleanNote) descParts.push(`Note: ${cleanNote}`);

    const depositTx = await WalletTransaction.create({
      userId: (session.user as any).id,
      amount,
      type: 'deposit',
      status: 'pending',
      description: `${descParts[0]} (${descParts.slice(1).join(', ')})`,
    });

    await Promise.all([
      createAdminNotification({
        title: 'New Deposit Request',
        message: `Deposit request of ৳${amount.toLocaleString()} submitted via ${paymentMethod.toUpperCase()} (Sender: ${cleanSender}${cleanTrxId ? `, TxID: ${cleanTrxId}` : ''}${cleanNote ? `, Note: ${cleanNote}` : ''}).`,
        type: 'deposit',
        link: '/admin/deposits',
      }),
      createNotification({
        userId: (session.user as any).id,
        title: 'Deposit Request Submitted',
        message: `Your deposit request of ৳${amount.toLocaleString()} via ${paymentMethod.toUpperCase()} has been submitted and is pending verification.`,
        type: 'wallet',
        link: '/dashboard/wallet',
      }),
    ]);

    return NextResponse.json({
      message: 'Deposit request submitted successfully! Pending admin approval.',
      transaction: depositTx
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting deposit:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
