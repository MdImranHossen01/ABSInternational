import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { encrypt, decrypt } from '@/lib/encryption';

export async function POST() {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const impersonatorCookie = cookieStore.get('abs_impersonator')?.value;

    let adminId: string | null = null;

    if (impersonatorCookie) {
      const decryptedCookie = decrypt(impersonatorCookie);
      if (decryptedCookie) {
        try {
          const parsed = JSON.parse(decryptedCookie);
          adminId = parsed.adminId;
        } catch {
          // malformed cookie
        }
      }
    }

    // Fallback: check session if cookie was cleared
    if (!adminId && (session?.user as any)?.impersonatorAdminId) {
      adminId = (session?.user as any)?.impersonatorAdminId;
    }

    if (!adminId) {
      return NextResponse.json({ error: 'No active impersonation session found.' }, { status: 400 });
    }

    await connectToDatabase();
    const adminUser = await User.findById(adminId).select('role name email memberId status');

    if (!adminUser) {
      return NextResponse.json({ error: 'Original admin account not found.' }, { status: 404 });
    }

    const isAuthorizedAdmin =
      adminUser.role === 'admin' ||
      adminUser.role === 'super_admin' ||
      adminUser.email === 'imranshuvo101@gmail.com';

    if (!isAuthorizedAdmin) {
      return NextResponse.json({ error: 'Access denied: Original account is no longer an admin.' }, { status: 403 });
    }

    // 1. Generate exit token (valid for 60 seconds)
    const exitPayload = {
      targetUserId: adminUser._id.toString(),
      isExit: true,
      exp: Date.now() + 60 * 1000,
    };
    const exitToken = encrypt(JSON.stringify(exitPayload));

    // 2. Clear impersonator cookie
    cookieStore.delete('abs_impersonator');

    return NextResponse.json({
      success: true,
      token: exitToken,
      admin: {
        id: adminUser._id.toString(),
        name: adminUser.name,
      },
    });
  } catch (error: any) {
    console.error('Exit Impersonation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
