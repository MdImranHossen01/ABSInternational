import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { exists: false, hasPassword: false, message: 'Identifier is required' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();
    if (!trimmed) {
      return NextResponse.json({ exists: false, hasPassword: false });
    }

    await connectToDatabase();

    const user = await User.findOne({
      $or: [
        { email: trimmed.toLowerCase() },
        { phone: trimmed },
      ],
    }).select('+password name email phone');

    if (!user) {
      return NextResponse.json({ exists: false, hasPassword: false });
    }

    return NextResponse.json({
      exists: true,
      hasPassword: Boolean(user.password && user.password.length > 0),
      name: user.name,
    });
  } catch (error) {
    console.error('Error in check-user route:', error);
    return NextResponse.json(
      { exists: false, hasPassword: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
