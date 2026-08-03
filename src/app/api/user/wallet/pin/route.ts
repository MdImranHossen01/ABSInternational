import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { pin, oldPin } = await req.json();

    if (!pin || pin.length < 4) {
      return NextResponse.json({ message: 'PIN must be at least 4 digits.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById((session.user as any).id).select('+transactionPin');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.transactionPin && oldPin) {
      const isPinValid = await bcrypt.compare(oldPin, user.transactionPin);
      if (!isPinValid) {
        return NextResponse.json({ message: 'Incorrect old PIN.' }, { status: 400 });
      }
    } else if (user.transactionPin && !oldPin) {
      return NextResponse.json({ message: 'Old PIN is required to change it.' }, { status: 400 });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    user.transactionPin = hashedPin;
    await user.save();

    return NextResponse.json({ message: 'Transaction PIN set successfully!' });
  } catch (error: any) {
    console.error('Error changing PIN:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
