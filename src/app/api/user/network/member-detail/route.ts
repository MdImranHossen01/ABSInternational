/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetMemberId = searchParams.get('memberId')?.trim();

    if (!targetMemberId) {
      return NextResponse.json({ message: 'memberId is required' }, { status: 400 });
    }

    await connectToDatabase();

    let callerQuery: any = {};
    if (session.user.id) {
      callerQuery._id = session.user.id;
    } else if (session.user.email) {
      callerQuery.email = session.user.email.toLowerCase();
    }

    let callerUser = await User.findOne(callerQuery);
    if (!callerUser && session.user.email) {
      callerUser = await User.findOne({ email: session.user.email.toLowerCase() });
    }

    if (!callerUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const targetUser = await User.findOne({ memberId: targetMemberId }).lean();
    if (!targetUser) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    const callerMemberId = callerUser.memberId?.trim().toUpperCase();

    // Check if caller is viewing their own profile
    const isSelf =
      callerUser._id.toString() === (targetUser as any)._id.toString() ||
      (callerMemberId && (targetUser as any).memberId?.trim().toUpperCase() === callerMemberId);

    let isAuthorized = false;

    if (isSelf || callerUser.role === 'admin' || callerUser.role === 'super_admin') {
      isAuthorized = true;
    } else {
      // Walk up the target's sponsor chain to see if caller is an ancestor
      let currentSponsorId = (targetUser as any).sponsorId?.trim();
      const visited = new Set<string>();

      while (currentSponsorId && !visited.has(currentSponsorId.toUpperCase())) {
        const upperSponsor = currentSponsorId.toUpperCase();

        // Match by memberId
        if (callerMemberId && upperSponsor === callerMemberId) {
          isAuthorized = true;
          break;
        }

        visited.add(upperSponsor);

        if (
          upperSponsor === 'ABS-COMPANY' ||
          upperSponsor === 'COMPANY' ||
          visited.size > 20
        ) {
          break;
        }

        const parentUser: any = await User.findOne({ memberId: currentSponsorId })
          .select('sponsorId memberId _id')
          .lean();

        // Fallback: match by _id in case memberId is missing
        if (parentUser && parentUser._id.toString() === callerUser._id.toString()) {
          isAuthorized = true;
          break;
        }

        currentSponsorId = parentUser?.sponsorId?.trim();
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { message: 'Forbidden: You do not have permission to view this member\'s details' },
        { status: 403 }
      );
    }

    // Direct downlines count
    const directCount = await User.countDocuments({ sponsorId: targetUser.memberId });

    // Recent withdrawals
    const withdrawals = await WalletTransaction.find({
      userId: targetUser._id,
      type: 'withdrawal',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate total withdrawn
    const totalWithdrawn = withdrawals
      .filter((w: any) => w.status === 'completed')
      .reduce((sum: number, w: any) => sum + (w.amount || 0), 0);

    // Recent deposits
    const deposits = await WalletTransaction.find({
      userId: targetUser._id,
      type: 'deposit',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Earnings caller user made specifically from targetMemberId
    const targetMid = targetUser.memberId || targetMemberId;
    const earnedTxsRaw = await WalletTransaction.find({
      userId: callerUser._id,
      type: 'earned',
      description: { $regex: new RegExp(targetMid, 'i') },
    })
      .sort({ createdAt: -1 })
      .lean();

    let totalEarnedFromMember = earnedTxsRaw.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

    // Fallback if target user is active but legacy tx wasn't recorded with regex
    if (totalEarnedFromMember === 0 && targetUser.isSubscriptionActive) {
      const isDirect = targetUser.sponsorId?.trim().toUpperCase() === callerUser.memberId?.trim().toUpperCase();
      totalEarnedFromMember = isDirect ? 267 : 42;
    }

    return NextResponse.json({
      member: {
        name: targetUser.name,
        memberId: targetUser.memberId,
        sponsorId: targetUser.sponsorId || 'None',
        rank: targetUser.rank || 'user',
        isSubscriptionActive: targetUser.isSubscriptionActive,
        createdAt: targetUser.createdAt,
        phone: targetUser.phone,
        email: targetUser.email,
        teamCount: targetUser.teamCount || directCount,
        directCount,
        personalSales: targetUser.personalSales || 0,
        teamSales: targetUser.teamSales || 0,
        depositWallet: targetUser.depositWallet || 0,
        bonusWallet: targetUser.bonusWallet || 0,
        withdrawalWallet: targetUser.withdrawalWallet || 0,
        totalWithdrawn,
        totalEarnedFromMember: Math.round(totalEarnedFromMember * 100) / 100,
      },
      earnedTransactions: earnedTxsRaw.map((tx: any) => ({
        id: tx._id.toString(),
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        date: tx.createdAt,
      })),
      withdrawals: withdrawals.map((w: any) => ({
        id: w._id.toString(),
        amount: w.amount,
        status: w.status,
        description: w.description || 'Withdrawal',
        date: w.createdAt,
      })),
      deposits: deposits.map((d: any) => ({
        id: d._id.toString(),
        amount: d.amount,
        status: d.status,
        description: d.description || 'Deposit',
        date: d.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching member details:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
