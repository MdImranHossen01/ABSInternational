import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

// Simple in-memory schema modeling for doctors/ambulance bookings
// We can store diagnostic/ambulance requests as collection in MongoDB or mock them beautifully.
import mongoose from 'mongoose';

const SebaBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['doctor', 'diagnostic', 'ambulance'], required: true },
  details: { type: String },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' },
  voucherCode: { type: String },
  bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

const SebaBooking = mongoose.models.SebaBooking || mongoose.model('SebaBooking', SebaBookingSchema);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const bookings = await SebaBooking.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error loading Seba bookings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { type, details } = await req.json();

    if (!type || !['doctor', 'diagnostic', 'ambulance'].includes(type)) {
      return NextResponse.json({ message: 'Invalid booking type.' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.isSubscriptionActive) {
      return NextResponse.json({ message: 'Seba benefits require an active Premium Member subscription.' }, { status: 400 });
    }

    if (type === 'doctor') {
      // 1 free consult per month limit
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthBooking = await SebaBooking.findOne({
        userId: user._id,
        type: 'doctor',
        createdAt: { $gte: startOfMonth }
      });

      if (thisMonthBooking) {
        return NextResponse.json({ message: 'You have already used your free MBBS Doctor Consultation for this month.' }, { status: 400 });
      }
    }

    const voucherCode = `ABS-SEBA-${type.toUpperCase().slice(0, 3)}-${Math.floor(100000 + Math.random() * 900000)}`;

    const booking = await SebaBooking.create({
      userId: user._id,
      type,
      details: details || `Requesting Seba Benefit for ${type}`,
      status: 'Pending',
      voucherCode
    });

    return NextResponse.json({
      message: `${type.toUpperCase()} Seba Voucher generated successfully!`,
      booking
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating Seba booking:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
