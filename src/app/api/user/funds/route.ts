import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { auth } from '@/auth';
import User from '@/models/User';
import MlmFundPool from '@/models/MlmFundPool';
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

    // Get live global fund pool
    let fundPool = await MlmFundPool.findOne().lean();
    if (!fundPool) {
      fundPool = {
        autoProfit: 0,
        globalProfit: 0,
        incentiveFund: 0,
        rankDevelopmentFund: 0,
        royaltyFund: 0,
        tourFund: 0,
        communityFund: 0,
        charityFund: 0,
        totalActivations: 0,
      } as any;
    }

    // Calculate user's breakdown of bonuses from WalletTransaction
    const transactions = await WalletTransaction.find({
      userId: user._id,
      type: 'earned',
    })
      .sort({ createdAt: -1 })
      .lean();

    let sponsorBonus = 0;
    let generationBonus = 0;
    let autoProfitBonus = 0;
    let rankBonus = 0;
    let globalProfitBonus = 0;

    for (const tx of transactions) {
      const desc = (tx.description || '').toLowerCase();
      if (desc.includes('sponsor')) {
        sponsorBonus += tx.amount || 0;
      } else if (desc.includes('generation')) {
        generationBonus += tx.amount || 0;
      } else if (desc.includes('auto profit') || desc.includes('matrix')) {
        autoProfitBonus += tx.amount || 0;
      } else if (desc.includes('rank') || desc.includes('reward') || desc.includes('promotion')) {
        rankBonus += tx.amount || 0;
      } else if (desc.includes('global profit')) {
        globalProfitBonus += tx.amount || 0;
      }
    }

    // Total income = sum of all earnings
    const totalIncome = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    // Total bonus in user wallet
    const totalBonus = user.bonusWallet || 0;

    return NextResponse.json({
      summary: {
        totalIncome,
        totalBonus,
        sponsorBonus,
        generationBonus,
        autoProfitBonus,
        rankBonus,
        globalProfitBonus,
      },
      globalFunds: {
        globalProfit: fundPool?.globalProfit || 0,
        incentiveFund: fundPool?.incentiveFund || 0,
        rankDevelopmentFund: fundPool?.rankDevelopmentFund || 0,
        royaltyFund: fundPool?.royaltyFund || 0,
        tourFund: fundPool?.tourFund || 0,
        communityFund: fundPool?.communityFund || 0,
        charityFund: fundPool?.charityFund || 0,
        autoProfit: fundPool?.autoProfit || 0,
        totalActivations: fundPool?.totalActivations || 0,
      },
      recentBonusHistory: transactions.slice(0, 15),
    });
  } catch (error: any) {
    console.error('Error fetching user funds:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
