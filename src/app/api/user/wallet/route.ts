import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const [user, transactions] = await Promise.all([
      User.findById((session.user as any).id).select('depositWallet bonusWallet withdrawalWallet walletBalance'),
      WalletTransaction.find({ userId: (session.user as any).id })
        .sort({ createdAt: -1 })
        .limit(50)
    ]);

    return NextResponse.json({
      balances: {
        depositWallet: user?.depositWallet || 0,
        bonusWallet: user?.bonusWallet || 0,
        withdrawalWallet: user?.withdrawalWallet || 0,
        walletBalance: user?.walletBalance || 0
      },
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

