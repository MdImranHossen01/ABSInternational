import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/auth';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

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

    let user = await User.findOne(query);
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Active direct downlines
    const downlines = user.memberId ? await User.find({ sponsorId: user.memberId }).lean() : [];
    const activeDownlines = downlines.filter((d: any) => d.isSubscriptionActive);
    const activeCount = activeDownlines.length;

    // Define all Rank Details & Rewards according to company rules
    const ranksMaster = [
      {
        id: 'user',
        title: 'General Member',
        requirement: 'Create an account on ABS International',
        qualificationCount: 0,
        bonus: 0,
        reward: 'Portal Access & Product Purchasing',
        icon: 'User',
        color: 'gray',
      },
      {
        id: 'Premium Member',
        title: 'Premium Member',
        requirement: 'Activate 1,500 BDT Membership Package',
        qualificationCount: 1,
        bonus: 0,
        reward: 'Seba Health Benefits, E-Store Discounts & 10-Gen MLM Eligibility',
        icon: 'ShieldCheck',
        color: 'blue',
      },
      {
        id: 'Team Manager',
        title: 'Team Manager',
        requirement: '6 Active Direct Downlines (Premium Members)',
        qualificationCount: 6,
        bonus: 200,
        reward: '200 BDT Cash Bonus + Official Digital Seba Card',
        icon: 'Award',
        color: 'emerald',
      },
      {
        id: 'Royal Manager',
        title: 'Royal Manager',
        requirement: '6 Team Managers in Direct Network',
        qualificationCount: 6,
        bonus: 1000,
        reward: '1,000 BDT Cash Bonus + 5-Star Hotel Buffet Lunch',
        icon: 'Crown',
        color: 'indigo',
      },
      {
        id: 'Silver Manager',
        title: 'Silver Manager',
        requirement: '6 Royal Managers in Direct Network',
        qualificationCount: 6,
        bonus: 6000,
        reward: '6,000 BDT Cash Bonus + Leadership Buffet Lunch',
        icon: 'Sparkles',
        color: 'cyan',
      },
      {
        id: 'Gold Manager',
        title: 'Gold Manager',
        requirement: '6 Silver Managers in Direct Network',
        qualificationCount: 6,
        bonus: 10000,
        reward: 'Branded Smartphone + 10,000 BDT Incentive Fund',
        icon: 'Star',
        color: 'amber',
      },
      {
        id: 'Diamond Manager',
        title: 'Diamond Manager',
        requirement: '6 Gold Managers in Direct Network',
        qualificationCount: 6,
        bonus: 35000,
        reward: 'Motorbike + Luxury Cox’s Bazar Tour + 35,000 BDT Fund Share',
        icon: 'Gem',
        color: 'violet',
      },
      {
        id: 'Crown Manager',
        title: 'Crown Manager',
        requirement: '6 Diamond Managers in Direct Network',
        qualificationCount: 6,
        bonus: 120000,
        reward: 'Private Car + Cox’s Bazar VIP Tour + 120,000 BDT Royalty Fund',
        icon: 'Trophy',
        color: 'rose',
      },
      {
        id: 'Director',
        title: 'Company Director',
        requirement: '6 Crown Managers in Direct Network',
        qualificationCount: 6,
        bonus: 500000,
        reward: '1 Crore Flat / Director Lifetime Equity Share',
        icon: 'Landmark',
        color: 'yellow',
      },
    ];

    // Determine current user rank index
    const currentRankIdx = ranksMaster.findIndex((r) => r.id === (user.rank || 'user'));
    const nextRank = currentRankIdx < ranksMaster.length - 1 ? ranksMaster[currentRankIdx + 1] : null;

    // Progress calculation
    let progressPercentage = 0;
    let progressLabel = '';
    if (!user.isSubscriptionActive) {
      progressPercentage = 0;
      progressLabel = 'Activate account with ৳1,500 package to reach Premium Member';
    } else if (user.rank === 'Premium Member') {
      progressPercentage = Math.min(100, Math.round((activeCount / 6) * 100));
      progressLabel = `${activeCount} / 6 Active Direct Downlines achieved`;
    } else {
      progressPercentage = Math.min(100, Math.round((activeCount / 6) * 100));
      progressLabel = `${activeCount} / 6 Leaders qualified for next rank`;
    }

    // User's reward transactions
    const rewardTransactions = await WalletTransaction.find({
      userId: user._id,
      description: { $regex: /reward|promotion|rank/i },
    }).sort({ createdAt: -1 }).limit(20).lean();

    // Top Achievers (Hall of fame / Achievement photos)
    const topAchievers = [
      {
        name: 'Md. Imran Hossen',
        rank: 'Crown Manager',
        image: '/images/achievers/achiever1.jpg',
        city: 'Dhaka',
        achievementDate: '2026-03-15',
        reward: 'Private Car & Cox’s Bazar VIP Tour',
      },
      {
        name: 'Kamrul Hasan',
        rank: 'Diamond Manager',
        image: '/images/achievers/achiever2.jpg',
        city: 'Chittagong',
        achievementDate: '2026-02-28',
        reward: 'Motorbike & Cox’s Bazar Tour',
      },
      {
        name: 'Rokeya Begum',
        rank: 'Gold Manager',
        image: '/images/achievers/achiever3.jpg',
        city: 'Sylhet',
        achievementDate: '2026-01-20',
        reward: 'Smartphone & ৳10,000 Incentive',
      },
      {
        name: 'Ariful Islam',
        rank: 'Silver Manager',
        image: '/images/achievers/achiever4.jpg',
        city: 'Rajshahi',
        achievementDate: '2026-01-10',
        reward: 'Buffet Lunch & ৳6,000 Reward',
      },
    ];

    return NextResponse.json({
      currentRank: user.rank || 'user',
      isSubscriptionActive: user.isSubscriptionActive,
      activeDirectCount: activeCount,
      totalTeamCount: user.teamCount || 0,
      nextRank,
      progressPercentage,
      progressLabel,
      ranksMaster,
      rewardTransactions,
      topAchievers,
    });
  } catch (error: any) {
    console.error('Error fetching user rank details:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
