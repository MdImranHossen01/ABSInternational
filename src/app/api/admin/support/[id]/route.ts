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

// GET single ticket
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'super_admin', 'manager'].includes(role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const ticket = await SupportTicket.findById(id).populate('userId', 'name email memberId phone');
    if (!ticket) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — update status or add admin reply
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'super_admin', 'manager'].includes(role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const { status, replyMessage } = await req.json();

    const ticket = await SupportTicket.findById(id);
    if (!ticket) return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });

    if (status) ticket.status = status;

    if (replyMessage) {
      ticket.replies.push({
        sender: 'admin',
        message: replyMessage,
        createdAt: new Date()
      });
      // auto set to Processing if still Open
      if (ticket.status === 'Open') ticket.status = 'Processing';
    }

    await ticket.save();
    return NextResponse.json({ message: 'Ticket updated successfully', ticket });
  } catch (error: any) {
    console.error('PATCH support ticket error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
