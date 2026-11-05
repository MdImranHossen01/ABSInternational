import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/auth';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import MlmFundPool from '@/models/MlmFundPool';
import { checkAndAutoConvertBonus } from '@/lib/wallet';

/**
 * GET /api/admin/mlm-funds
 * Returns current fund pool balances
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Always count real active members (excluding company root node & super_admin)
    const realActiveMembersCount = await User.countDocuments({
      isSubscriptionActive: true,
      memberId: { $ne: 'ABS-COMPANY' },
      role: { $ne: 'super_admin' },
    });

    const fundPool = await MlmFundPool.findOne();
    if (!fundPool) {
      return NextResponse.json({
        autoProfit: realActiveMembersCount * 52.5,
        globalProfit: realActiveMembersCount * 30,
        incentiveFund: realActiveMembersCount * 30,
        rankDevelopmentFund: realActiveMembersCount * 37.5,
        royaltyFund: realActiveMembersCount * 30,
        tourFund: realActiveMembersCount * 75,
        communityFund: realActiveMembersCount * 225,
        charityFund: realActiveMembersCount * 15,
        totalActivations: realActiveMembersCount,
      });
    }

    // Sync fundPool if totalActivations included ABS-COMPANY or out-of-sync test records
    if (fundPool.totalActivations !== realActiveMembersCount) {
      fundPool.totalActivations = realActiveMembersCount;
      fundPool.autoProfit = realActiveMembersCount * 52.5;
      fundPool.incentiveFund = realActiveMembersCount * 30;
      fundPool.rankDevelopmentFund = realActiveMembersCount * 37.5;
      fundPool.royaltyFund = realActiveMembersCount * 30;
      fundPool.tourFund = realActiveMembersCount * 75;
      fundPool.communityFund = realActiveMembersCount * 225;
      fundPool.charityFund = realActiveMembersCount * 15;
      // Keep globalProfit aligned with 2% (৳30/act) unless a manual distribution reduced it below that
      if (fundPool.globalProfit > realActiveMembersCount * 30) {
        fundPool.globalProfit = realActiveMembersCount * 30;
      }
      fundPool.lastUpdated = new Date();
      await fundPool.save();
    }

    return NextResponse.json(fundPool);
  } catch (error: any) {
    console.error('GET mlm-funds error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/mlm-funds
 * Distribute Global Profit equally to all active members.
 * Body: { action: 'distribute_global_profit' }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || !['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { action } = await req.json();

    if (action === 'distribute_global_profit') {
      const fundPool = await MlmFundPool.findOne();
      if (!fundPool || fundPool.globalProfit <= 0) {
        return NextResponse.json({ message: 'No Global Profit available to distribute.' }, { status: 400 });
      }

      // Find all real active members (excluding ABS-COMPANY & super_admin)
      const activeMembers = await User.find({
        isSubscriptionActive: true,
        role: { $ne: 'super_admin' },
        memberId: { $ne: 'ABS-COMPANY' },
      });
      if (activeMembers.length === 0) {
        return NextResponse.json({ message: 'No active members found.' }, { status: 400 });
      }

      const totalPool  = fundPool.globalProfit;
      const perMember  = Math.floor((totalPool / activeMembers.length) * 100) / 100; // round down to 2 dp

      if (perMember <= 0) {
        return NextResponse.json({ message: 'Pool amount too small to distribute.' }, { status: 400 });
      }

      // Bulk distribute
      const transactions = [];
      for (const member of activeMembers) {
        member.bonusWallet += perMember;
        await member.save();
        await checkAndAutoConvertBonus(member);
        transactions.push({
          userId: member._id,
          amount: perMember,
          type: 'earned',
          status: 'completed',
          description: `Global Profit Share (Pool: ${totalPool} BDT ÷ ${activeMembers.length} members)`,
        });
      }
      await WalletTransaction.insertMany(transactions);

      // Retain any unallocated rounding remainder in the global profit pool
      const totalDistributed = perMember * activeMembers.length;
      fundPool.globalProfit  = Math.max(0, Math.round((totalPool - totalDistributed) * 100) / 100);
      fundPool.lastUpdated   = new Date();
      await fundPool.save();

      return NextResponse.json({
        message: `Global Profit distributed successfully!`,
        totalPool,
        activeMembers: activeMembers.length,
        perMemberAmount: perMember,
      });
    }

    return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    console.error('POST mlm-funds error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
