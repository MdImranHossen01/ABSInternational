import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Please log in first.' }, { status: 401 });
    }

    const currentRole = (session.user as any)?.role;
    const isSuperAdminEmail = session.user.email === 'imranshuvo101@gmail.com';
    const isAuthorizedAdmin = currentRole === 'admin' || currentRole === 'super_admin' || isSuperAdminEmail;

    if (!isAuthorizedAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required to impersonate users.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'Cannot impersonate your own account.' }, { status: 400 });
    }

    await connectToDatabase();
    const targetUser = await User.findById(targetUserId).select('role name email memberId status');

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    // Protect super admins from being impersonated by regular admins
    if (targetUser.role === 'super_admin' && !isSuperAdminEmail) {
      return NextResponse.json({ error: 'Cannot impersonate a Super Admin account.' }, { status: 403 });
    }

    // 1. Create short-lived token for NextAuth Credentials sign-in (valid for 60 seconds)
    const tokenPayload = {
      adminId: session.user.id,
      targetUserId: targetUser._id.toString(),
      exp: Date.now() + 60 * 1000,
    };
    const impersonationToken = encrypt(JSON.stringify(tokenPayload));

    // 2. Set secure HTTP-only cookie tracking who impersonated whom (valid for 24h)
    const cookiePayload = {
      adminId: session.user.id,
      adminEmail: session.user.email,
      targetUserId: targetUser._id.toString(),
      timestamp: Date.now(),
    };
    const encryptedCookie = encrypt(JSON.stringify(cookiePayload));

    const cookieStore = await cookies();
    cookieStore.set('abs_impersonator', encryptedCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      token: impersonationToken,
      targetUser: {
        id: targetUser._id.toString(),
        name: targetUser.name,
        memberId: targetUser.memberId,
      },
    });
  } catch (error: any) {
    console.error('Impersonation API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
