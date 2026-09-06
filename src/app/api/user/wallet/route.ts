import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import User from '@/models/User';
import { auth } from '@/auth';

const AUTO_PROFIT_TIERS = [240, 720, 2160, 7776, 46656, 233280, 1399680, 5038848, 30233088, 120932352];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    let userQuery: any = {};
    if (session.user.id) {
      userQuery._id = session.user.id;
    } else if (session.user.email) {
      userQuery.email = session.user.email.toLowerCase();
    }

    let user = await User.findOne(userQuery).select(
      'depositWallet bonusWallet withdrawalWallet walletBalance autoProfitPool autoProfitTier'
    );
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email.toLowerCase() }).select(
        'depositWallet bonusWallet withdrawalWallet walletBalance autoProfitPool autoProfitTier'
      );
    }

    const userId = user?._id || (session.user as any).id;

    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const currentTier   = user?.autoProfitTier ?? 0;
    const pool          = user?.autoProfitPool ?? 0;
    const nextTierAmt   = currentTier < AUTO_PROFIT_TIERS.length ? AUTO_PROFIT_TIERS[currentTier] : null;
    const tierProgress  = nextTierAmt ? Math.min((pool / nextTierAmt) * 100, 100) : 100;

    return NextResponse.json({
      balances: {
        depositWallet:   user?.depositWallet   || 0,
        bonusWallet:     user?.bonusWallet     || 0,
        withdrawalWallet: user?.withdrawalWallet || 0,
        walletBalance:   user?.walletBalance   || 0,
      },
      autoProfit: {
        pool,
        completedTier: currentTier,
        nextTierAmount: nextTierAmt,
        tierProgress,
        allTiers: AUTO_PROFIT_TIERS,
        isComplete: currentTier >= AUTO_PROFIT_TIERS.length,
      },
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


