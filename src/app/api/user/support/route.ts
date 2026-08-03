import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/auth';
import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Open', 'Processing', 'Closed'], default: 'Open' },
  replies: [{
    sender: { type: String, enum: ['user', 'admin'], default: 'user' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const tickets = await SupportTicket.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { subject, category, message } = await req.json();

    if (!subject || !category || !message) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const ticket = await SupportTicket.create({
      userId: (session.user as any).id,
      subject,
      category,
      message,
      status: 'Open'
    });

    return NextResponse.json({ message: 'Support ticket opened successfully!', ticket }, { status: 201 });
  } catch (error: any) {
    console.error('Error opening support ticket:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
