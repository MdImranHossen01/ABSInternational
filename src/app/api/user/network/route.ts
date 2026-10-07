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

    await connectToDatabase();

    let query: any = {};
    if (session.user.id) {
      query._id = session.user.id;
    } else if (session.user.email) {
      query.email = session.user.email.toLowerCase();
    }

    let loggedInUser = await User.findOne(query);
    if (!loggedInUser && session.user.email) {
      loggedInUser = await User.findOne({ email: session.user.email.toLowerCase() });
    }

    if (!loggedInUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!loggedInUser.memberId) {
      return NextResponse.json({
        directTeam: [],
        generations: Array.from({ length: 10 }, (_, i) => ({ level: i + 1, members: [], totalEarned: 0 }))
      });
    }

    // Fetch all earned transactions for logged in user to map exact bonuses from each downline member
    const userEarnings = await WalletTransaction.find({
      userId: loggedInUser._id,
      type: 'earned',
    }).select('amount description createdAt').lean();

    const earningsByMemberId: Record<string, number> = {};
    for (const tx of userEarnings) {
      if (tx.description && tx.amount) {
        // Match memberId like ABS-123456 or ABS-COMPANY
        const match = tx.description.match(/ABS-[A-Z0-9]+/i);
        if (match) {
          const mid = match[0].toUpperCase();
          earningsByMemberId[mid] = (earningsByMemberId[mid] || 0) + Number(tx.amount);
        }
      }
    }

    const searchParams = req.nextUrl.searchParams;
    const filterStatus = searchParams.get('status'); // 'active' | 'inactive' | 'all'

    // Fetch direct referrals (Generation 1)
    let directQuery: any = { sponsorId: loggedInUser.memberId };
    if (filterStatus === 'active') {
      directQuery.isSubscriptionActive = true;
    } else if (filterStatus === 'inactive') {
      directQuery.isSubscriptionActive = false;
    }

    const directTeamRaw = await User.find(directQuery)
      .select('name email phone memberId rank isSubscriptionActive createdAt')
      .sort({ createdAt: -1 });

    const directTeam = directTeamRaw.map(m => {
      const mid = (m.memberId || '').toUpperCase();
      const recorded = earningsByMemberId[mid] || 0;
      const fallback = m.isSubscriptionActive ? 267 : 0; // 225 Sponsor + 42 Gen 1
      const earnedAmount = recorded > 0 ? recorded : fallback;
      return {
        name: m.name,
        email: m.email,
        phone: m.phone,
        memberId: m.memberId,
        rank: m.rank,
        isSubscriptionActive: m.isSubscriptionActive,
        createdAt: m.createdAt,
        earnedAmount: Math.round(earnedAmount * 100) / 100,
      };
    });

    // Standard Generation Rates [42, 21, 10.5, 6.3, 6.3, 5.25, 5.25, 3.15, 3.15, 2.1]
    const genRates = [42, 21, 10.5, 6.3, 6.3, 5.25, 5.25, 3.15, 3.15, 2.1];

    // Fetch 10 generations count and structured tree
    const generations: any[] = [];
    let currentLevelMemberIds: string[] = [loggedInUser.memberId].filter((id): id is string => Boolean(id && id.trim() !== ''));

    for (let level = 1; level <= 10; level++) {
      if (currentLevelMemberIds.length === 0) {
        generations.push({ level, members: [], totalEarned: 0, activeCount: 0 });
        continue;
      }

      let levelQuery: any = { sponsorId: { $in: currentLevelMemberIds } };
      if (filterStatus === 'active') {
        levelQuery.isSubscriptionActive = true;
      } else if (filterStatus === 'inactive') {
        levelQuery.isSubscriptionActive = false;
      }

      const levelMembers = await User.find(levelQuery)
        .select('name email phone memberId sponsorId rank isSubscriptionActive createdAt');

      const mappedMembers = levelMembers.map(m => {
        const mid = (m.memberId || '').toUpperCase();
        const recorded = earningsByMemberId[mid] || 0;
        let fallback = 0;
        if (m.isSubscriptionActive) {
          const genBonus = genRates[level - 1] || 0;
          const sponsorBonus = (m.sponsorId?.trim().toUpperCase() === loggedInUser.memberId?.trim().toUpperCase()) ? 225 : 0;
          fallback = sponsorBonus + genBonus;
        }
        const earnedAmount = recorded > 0 ? recorded : fallback;

        return {
          name: m.name,
          email: m.email,
          phone: m.phone,
          memberId: m.memberId,
          sponsorId: m.sponsorId,
          rank: m.rank,
          isSubscriptionActive: m.isSubscriptionActive,
          createdAt: m.createdAt,
          earnedAmount: Math.round(earnedAmount * 100) / 100,
        };
      });

      const totalEarned = mappedMembers.reduce((sum, m) => sum + (m.earnedAmount || 0), 0);
      const activeCount = mappedMembers.filter(m => m.isSubscriptionActive).length;

      generations.push({
        level,
        members: mappedMembers,
        totalEarned: Math.round(totalEarned * 100) / 100,
        activeCount,
      });

      currentLevelMemberIds = levelMembers
        .map(m => m.memberId)
        .filter((id): id is string => Boolean(id && id.trim() !== ''));
    }

    return NextResponse.json({
      directTeam,
      generations
    });
  } catch (error: any) {
    console.error('Error fetching network details:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
