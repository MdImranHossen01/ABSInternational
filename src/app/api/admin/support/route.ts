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

// GET all tickets (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'super_admin', 'manager'].includes(role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;

    const tickets = await SupportTicket.find(filter)
      .populate('userId', 'name email memberId phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching support tickets (admin):', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
