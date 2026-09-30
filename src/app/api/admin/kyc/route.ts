import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // Find users with nidStatus not 'Not Submitted'
    const users = await User.find({ nidStatus: { $ne: 'Not Submitted' } })
      .select('name email phone memberId nidNumber nidFrontImage nidBackImage nidStatus kycFullName kycDateOfBirth kycFatherName kycMotherName kycPresentAddress kycPermanentAddress kycOwnerPhoto nidRejectionReason updatedAt createdAt')
      .sort({ updatedAt: -1 });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching KYC queue:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, status } = await req.json();

    if (!userId || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid payload.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    user.nidStatus = status;
    await user.save();

    await createNotification({
      userId: user._id,
      title: status === 'Approved' ? 'KYC Verification Approved' : 'KYC Verification Rejected',
      message: status === 'Approved'
        ? 'Congratulations! Your national identity (NID) KYC verification has been reviewed and approved.'
        : 'Your national identity (NID) KYC application was rejected. Please review your submitted documents and re-upload valid photos.',
      type: 'seba',
      link: '/dashboard/profile',
    });

    return NextResponse.json({ message: `KYC application ${status.toLowerCase()} successfully.` });
  } catch (error: any) {
    console.error('Error updating KYC:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
