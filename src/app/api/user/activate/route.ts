import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { auth } from '@/auth';

const GEN_PERCENTAGES = [0.4, 0.2, 0.1, 0.06, 0.06, 0.05, 0.05, 0.03, 0.03, 0.02];
const GEN_POOL_TOTAL = 105; // 7% of 1500 BDT

async function checkRankPromotions(user: any) {
  let currentUser = user;
  
  while (currentUser) {
    // Fetch direct active downlines
    const downlines = await User.find({ sponsorId: currentUser.memberId });
    const activeDownlines = downlines.filter(d => d.isSubscriptionActive);
    
    let newRank = currentUser.rank;

    if (currentUser.rank === 'user' && currentUser.isSubscriptionActive) {
      newRank = 'Premium Member';
    }

    if (newRank === 'Premium Member') {
      const premiumCount = activeDownlines.filter(d => d.rank === 'Premium Member' || d.rank !== 'user').length;
      if (premiumCount >= 6) {
        newRank = 'Team Manager';
        // Reward: 200 BDT + Seba Card
        currentUser.bonusWallet += 200;
        currentUser.isSebaCardGenerated = true;
        currentUser.sebaCardNo = `ABS-SEBA-${Math.floor(100000 + Math.random() * 900000)}`;
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 200,
          type: 'earned',
          status: 'completed',
          description: 'Team Manager Promotion Reward'
        });
      }
    }

    if (newRank === 'Team Manager') {
      const managerCount = activeDownlines.filter(d => d.rank === 'Team Manager' || ['Royal Manager', 'Silver Manager', 'Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)).length;
      if (managerCount >= 6) {
        newRank = 'Royal Manager';
        // Reward: 1000 BDT
        currentUser.bonusWallet += 1000;
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 1000,
          type: 'earned',
          status: 'completed',
          description: 'Royal Manager Promotion Reward'
        });
      }
    }

    if (newRank === 'Royal Manager') {
      const count = activeDownlines.filter(d => d.rank === 'Royal Manager' || ['Silver Manager', 'Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)).length;
      if (count >= 6) {
        newRank = 'Silver Manager';
        currentUser.bonusWallet += 6000;
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 6000,
          type: 'earned',
          status: 'completed',
          description: 'Silver Manager Promotion Reward'
        });
      }
    }

    if (newRank === 'Silver Manager') {
      const count = activeDownlines.filter(d => d.rank === 'Silver Manager' || ['Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)).length;
      if (count >= 6) {
        newRank = 'Gold Manager';
        currentUser.bonusWallet += 10000;
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 10000,
          type: 'earned',
          status: 'completed',
          description: 'Gold Manager Promotion Reward (Smartphone + ৳10,000)'
        });
      }
    }

    if (newRank === 'Gold Manager') {
      const count = activeDownlines.filter(d => d.rank === 'Gold Manager' || ['Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)).length;
      if (count >= 6) {
        newRank = 'Diamond Manager';
        currentUser.bonusWallet += 35000; // 15000 incentive + 20000 royalty fund
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 35000,
          type: 'earned',
          status: 'completed',
          description: 'Diamond Manager Promotion Reward (Motorbike + Cox\'s Bazar Tour + ৳35,000)'
        });
      }
    }

    if (newRank === 'Diamond Manager') {
      const count = activeDownlines.filter(d => d.rank === 'Diamond Manager' || ['Crown Manager', 'Director'].includes(d.rank)).length;
      if (count >= 6) {
        newRank = 'Crown Manager';
        currentUser.bonusWallet += 120000; // 20000 incentive + 100000 royalty
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 120000,
          type: 'earned',
          status: 'completed',
          description: 'Crown Manager Promotion Reward (Private Car + Cox\'s Bazar Tour + ৳120,000)'
        });
      }
    }

    if (newRank === 'Crown Manager') {
      const count = activeDownlines.filter(d => d.rank === 'Crown Manager' || d.rank === 'Director').length;
      if (count >= 6) {
        newRank = 'Director';
        currentUser.bonusWallet += 200000; // 50000 incentive + 150000 royalty
        await WalletTransaction.create({
          userId: currentUser._id,
          amount: 200000,
          type: 'earned',
          status: 'completed',
          description: 'Director Promotion Reward (Flat + Umrah Hajj + ৳200,000 + 2% Share)'
        });
      }
    }

    if (currentUser.rank !== newRank) {
      currentUser.rank = newRank;
      await currentUser.save();
    }

    // Go up one level to check sponsor
    if (currentUser.sponsorId) {
      currentUser = await User.findOne({ memberId: currentUser.sponsorId });
    } else {
      break;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (user.isSubscriptionActive) {
      return NextResponse.json({ message: 'Your membership is already active.' }, { status: 400 });
    }

    if (user.depositWallet < 1500) {
      return NextResponse.json({ message: 'Insufficient balance in Deposit Wallet. Minimum 1,500 BDT required.' }, { status: 400 });
    }

    // Deduct 1500 BDT
    user.depositWallet -= 1500;
    user.isSubscriptionActive = true;
    user.rank = 'Premium Member';
    
    // Auto-generate Seba Card No
    user.isSebaCardGenerated = true;
    user.sebaCardNo = `ABS-SEBA-${Math.floor(100000 + Math.random() * 900000)}`;

    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      amount: 1500,
      type: 'spent',
      status: 'completed',
      description: 'ABS Joining Package Purchase (1,500 BDT)',
    });

    // 1. Sponsor Bonus (15% = 225 BDT)
    if (user.sponsorId) {
      const sponsor = await User.findOne({ memberId: user.sponsorId });
      if (sponsor) {
        sponsor.bonusWallet += 225;
        sponsor.personalSales += 1500;
        await sponsor.save();

        await WalletTransaction.create({
          userId: sponsor._id,
          amount: 225,
          type: 'earned',
          status: 'completed',
          description: `Sponsor Bonus (15%) from ${user.name} (${user.memberId})`,
        });

        // 2. Generation Bonus (7% = 105 BDT total spread up to 10 generations)
        let currentParent = sponsor;
        for (let i = 0; i < 10; i++) {
          // Increment team sales
          currentParent.teamSales += 1500;
          await currentParent.save();

          const payout = GEN_POOL_TOTAL * GEN_PERCENTAGES[i];

          // Pay out generation bonus
          currentParent.bonusWallet += payout;
          await currentParent.save();

          await WalletTransaction.create({
            userId: currentParent._id,
            amount: payout,
            type: 'earned',
            status: 'completed',
            description: `Generation ${i + 1} Bonus from downline ${user.name} (${user.memberId})`,
          });

          // Move to next generation sponsor
          if (currentParent.sponsorId) {
            const nextParent = await User.findOne({ memberId: currentParent.sponsorId });
            if (nextParent) {
              currentParent = nextParent;
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    // Trigger Rank Promotions checklist
    await checkRankPromotions(user);

    return NextResponse.json({
      message: 'Account activated successfully as Premium Member! Welcome to ABS International.',
      user: {
        isSubscriptionActive: user.isSubscriptionActive,
        rank: user.rank,
        depositWallet: user.depositWallet,
        sebaCardNo: user.sebaCardNo
      }
    });
  } catch (error: any) {
    console.error('Error during activation:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
