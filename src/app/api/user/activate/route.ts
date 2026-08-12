import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import MlmFundPool from '@/models/MlmFundPool';
import { auth } from '@/auth';

// ─── Distribution Constants (out of 1500 BDT) ────────────────────────────────
const PACKAGE_PRICE     = 1500;
const SPONSOR_BONUS     = 225;   // 15%
const GEN_POOL_TOTAL    = 105;   // 7%
const AUTO_PROFIT       = 52;    // 3.5%  → Auto-Profit matrix pool
const GLOBAL_PROFIT     = 30;    // 2%    → Equally shared to all active members (cron/admin triggers)
const INCENTIVE_FUND    = 30;    // 2%    → Rank reward pool
const RANK_DEV_FUND     = 30;    // 2%    → Rank promotion bonus pool
const ROYALTY_FUND      = 30;    // 2%    → Diamond / Crown / Director royalties
const CHARITY_FUND      = 15;    // 1%    → Orphans & underprivileged

// Generation bonus split (100% of GEN_POOL_TOTAL)
const GEN_PERCENTAGES = [0.40, 0.20, 0.10, 0.06, 0.06, 0.05, 0.05, 0.03, 0.03, 0.02];

// Auto Profit Matrix tier payouts (BDT)
const AUTO_PROFIT_TIERS = [240, 720, 2160, 7776, 46656, 233280, 1399680, 5038848, 30233088, 120932352];

// ─── Auto Profit Matrix Tier Check ───────────────────────────────────────────
async function checkAutoProfitTier(member: any, joinerName: string, joinerId: string) {
  // Already completed all tiers
  if (member.autoProfitTier >= AUTO_PROFIT_TIERS.length) return;

  // Add 52 BDT contribution to member's personal auto-profit pool
  member.autoProfitPool = (member.autoProfitPool || 0) + AUTO_PROFIT;

  const tierPayouts: { tier: number; amount: number }[] = [];

  // Check if pool has crossed one or more tier thresholds
  while (member.autoProfitTier < AUTO_PROFIT_TIERS.length) {
    const nextTierAmount = AUTO_PROFIT_TIERS[member.autoProfitTier];
    if (member.autoProfitPool >= nextTierAmount) {
      // Deduct the tier payout from pool
      member.autoProfitPool -= nextTierAmount;
      member.autoProfitTier += 1;
      member.bonusWallet    += nextTierAmount;

      tierPayouts.push({ tier: member.autoProfitTier, amount: nextTierAmount });

      await WalletTransaction.create({
        userId: member._id,
        amount: nextTierAmount,
        type: 'earned',
        status: 'completed',
        description: `Auto Profit Matrix Tier ${member.autoProfitTier} Payout (Pool contribution from ${joinerName} — ${joinerId})`,
      });
    } else {
      break;
    }
  }

  await member.save();
  return tierPayouts;
}

// ─── Rank Promotion Engine ────────────────────────────────────────────────────
async function checkRankPromotions(user: any) {
  let currentUser = user;
  const visited = new Set<string>();
  let depth = 0;

  while (currentUser && depth < 10) {
    if (!currentUser.memberId || visited.has(currentUser.memberId)) {
      break;
    }
    visited.add(currentUser.memberId);
    depth++;

    const downlines     = await User.find({ sponsorId: currentUser.memberId });
    const activeDown    = downlines.filter((d: any) => d.isSubscriptionActive);
    let newRank         = currentUser.rank;

    if (currentUser.rank === 'user' && currentUser.isSubscriptionActive) {
      newRank = 'Premium Member';
    }

    // Premium Member → Team Manager (6 active downlines)
    if (currentUser.rank === 'Premium Member') {
      const cnt = activeDown.filter((d: any) => d.rank !== 'user').length;
      if (cnt >= 6) {
        newRank = 'Team Manager';
        currentUser.bonusWallet     += 200;
        currentUser.isSebaCardGenerated = true;
        if (!currentUser.sebaCardNo) {
          currentUser.sebaCardNo = `ABS-SEBA-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        await WalletTransaction.create({
          userId: currentUser._id, amount: 200, type: 'earned', status: 'completed',
          description: 'Team Manager Promotion Reward (200 BDT + Seba Card)'
        });
      }
    } else if (currentUser.rank === 'Team Manager') {
      // Team Manager → Royal Manager (6 Team Managers)
      const cnt = activeDown.filter((d: any) =>
        ['Team Manager','Royal Manager','Silver Manager','Gold Manager','Diamond Manager','Crown Manager','Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Royal Manager';
        currentUser.bonusWallet += 1000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 1000, type: 'earned', status: 'completed',
          description: 'Royal Manager Promotion Reward (1,000 BDT + Buffet Lunch)'
        });
      }
    } else if (currentUser.rank === 'Royal Manager') {
      // Royal Manager → Silver Manager (6 Royal Managers)
      const cnt = activeDown.filter((d: any) =>
        ['Royal Manager','Silver Manager','Gold Manager','Diamond Manager','Crown Manager','Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Silver Manager';
        currentUser.bonusWallet += 6000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 6000, type: 'earned', status: 'completed',
          description: 'Silver Manager Promotion Reward (6,000 BDT + Buffet Lunch)'
        });
      }
    } else if (currentUser.rank === 'Silver Manager') {
      // Silver Manager → Gold Manager (6 Silver Managers)
      const cnt = activeDown.filter((d: any) =>
        ['Silver Manager','Gold Manager','Diamond Manager','Crown Manager','Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Gold Manager';
        currentUser.bonusWallet += 10000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 10000, type: 'earned', status: 'completed',
          description: 'Gold Manager Promotion Reward (Smartphone + 10,000 BDT Incentive)'
        });
      }
    } else if (currentUser.rank === 'Gold Manager') {
      // Gold Manager → Diamond Manager (6 Gold Managers)
      const cnt = activeDown.filter((d: any) =>
        ['Gold Manager','Diamond Manager','Crown Manager','Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Diamond Manager';
        // 15,000 incentive + 20,000 royalty fund
        currentUser.bonusWallet += 35000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 35000, type: 'earned', status: 'completed',
          description: "Diamond Manager Promotion Reward (Motorbike + Cox's Bazar Tour + 35,000 BDT)"
        });
      }
    } else if (currentUser.rank === 'Diamond Manager') {
      // Diamond Manager → Crown Manager (6 Diamond Managers)
      const cnt = activeDown.filter((d: any) =>
        ['Diamond Manager','Crown Manager','Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Crown Manager';
        // 20,000 incentive + 100,000 royalty
        currentUser.bonusWallet += 120000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 120000, type: 'earned', status: 'completed',
          description: "Crown Manager Promotion Reward (Private Car + Cox's Bazar Tour + 120,000 BDT)"
        });
      }
    } else if (currentUser.rank === 'Crown Manager') {
      // Crown Manager → Director (6 Crown Managers)
      const cnt = activeDown.filter((d: any) =>
        ['Crown Manager','Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Director';
        // 50,000 incentive + 150,000 royalty
        currentUser.bonusWallet += 200000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 200000, type: 'earned', status: 'completed',
          description: 'Director Promotion Reward (Flat + Umrah Hajj + 200,000 BDT + 2% Company Share)'
        });
      }
    }

    if (currentUser.rank !== newRank) {
      currentUser.rank = newRank;
      await currentUser.save();
    }

    if (currentUser.sponsorId) {
      currentUser = await User.findOne({ memberId: currentUser.sponsorId });
    } else {
      break;
    }
  }
}

// ─── POST /api/user/activate ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const inputSponsorId = body?.sponsorId?.trim();
    if (inputSponsorId) {
      if (inputSponsorId === user.memberId) {
        return NextResponse.json({ message: 'You cannot enter your own Member ID as Sponsor ID.' }, { status: 400 });
      }
      const validSponsor = await User.findOne({ memberId: inputSponsorId });
      if (!validSponsor) {
        return NextResponse.json({ message: `Sponsor ID "${inputSponsorId}" not found.` }, { status: 400 });
      }
      user.sponsorId = inputSponsorId;
      // Increment teamCount for upline chain up to 10 levels
      let currentSponsorId: string | undefined = inputSponsorId;
      for (let i = 0; i < 10 && currentSponsorId; i++) {
        const parent: any = await User.findOneAndUpdate(
          { memberId: currentSponsorId },
          { $inc: { teamCount: 1 } },
          { new: true }
        );
        currentSponsorId = parent?.sponsorId;
      }
    }

    if (user.isSubscriptionActive) {
      return NextResponse.json({ message: 'Your membership is already active.' }, { status: 400 });
    }

    if (user.depositWallet < PACKAGE_PRICE) {
      return NextResponse.json(
        { message: `Insufficient balance. Minimum ${PACKAGE_PRICE} BDT required in Deposit Wallet.` },
        { status: 400 }
      );
    }

    // ── Step 1: Deduct package price & activate ───────────────────────────────
    user.depositWallet      -= PACKAGE_PRICE;
    user.isSubscriptionActive = true;
    user.rank               = 'Premium Member';
    user.isSebaCardGenerated  = true;
    user.sebaCardNo           = `ABS-SEBA-${Math.floor(100000 + Math.random() * 900000)}`;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      amount: PACKAGE_PRICE,
      type: 'spent',
      status: 'completed',
      description: 'ABS Joining Package Purchase (1,500 BDT)',
    });

    // ── Step 2: Sponsor Bonus (15% = 225 BDT) ────────────────────────────────
    let unallocatedBonus = 0; // tracks unallocated bonuses when no sponsor

    if (user.sponsorId) {
      const sponsor = await User.findOne({ memberId: user.sponsorId });
      if (sponsor) {
        sponsor.bonusWallet   += SPONSOR_BONUS;
        sponsor.personalSales += PACKAGE_PRICE;
        await sponsor.save();

        await WalletTransaction.create({
          userId: sponsor._id,
          amount: SPONSOR_BONUS,
          type: 'earned',
          status: 'completed',
          description: `Sponsor Bonus (15%) from ${user.name} (${user.memberId})`,
        });

        // ── Step 2b: Auto Profit Matrix — 52 BDT to sponsor's personal pool ──
        await checkAutoProfitTier(sponsor, user.name, user.memberId);

        // ── Step 3: Generation Bonus (7% = 105 BDT across 10 generations) ──
        let currentParent = sponsor;
        for (let i = 0; i < 10; i++) {
          currentParent.teamSales += PACKAGE_PRICE;
          const payout = Math.round(GEN_POOL_TOTAL * GEN_PERCENTAGES[i] * 100) / 100;
          currentParent.bonusWallet += payout;
          await currentParent.save();

          await WalletTransaction.create({
            userId: currentParent._id,
            amount: payout,
            type: 'earned',
            status: 'completed',
            description: `Generation ${i + 1} Bonus from ${user.name} (${user.memberId})`,
          });

          if (!currentParent.sponsorId) break;
          const nextParent = await User.findOne({ memberId: currentParent.sponsorId });
          if (!nextParent) break;
          currentParent = nextParent;
        }
      } else {
        // Sponsor ID set but not found in DB — redirect to global profit pool
        unallocatedBonus = SPONSOR_BONUS + GEN_POOL_TOTAL + AUTO_PROFIT; // 225 + 105 + 52 = 382 BDT
      }
    } else {
      // No sponsor ID — redirect unallocated sponsor+generation+auto-profit to Global Profit Pool
      unallocatedBonus = SPONSOR_BONUS + GEN_POOL_TOTAL + AUTO_PROFIT; // 225 + 105 + 52 = 382 BDT
    }

    // ── Step 4: Fund Pool Contributions ──────────────────────────────────────
    // Get or create the single fund pool document
    let fundPool = await MlmFundPool.findOne();
    if (!fundPool) {
      fundPool = await MlmFundPool.create({
        autoProfit: 0, globalProfit: 0, incentiveFund: 0,
        rankDevelopmentFund: 0, royaltyFund: 0, charityFund: 0,
        totalActivations: 0,
      });
    }

    fundPool.autoProfit         += AUTO_PROFIT;    // 3.5% = 52 BDT → matrix pool
    fundPool.globalProfit       += GLOBAL_PROFIT + unallocatedBonus; // 2% = 30 BDT + any unallocated bonuses (382 BDT if no sponsor)
    fundPool.incentiveFund      += INCENTIVE_FUND; // 2%   = 30 BDT → rank reward pool
    fundPool.rankDevelopmentFund += RANK_DEV_FUND; // 2%   = 30 BDT → rank promotion bonus pool
    fundPool.royaltyFund        += ROYALTY_FUND;   // 2%   = 30 BDT → Diamond/Crown/Director royalties
    fundPool.charityFund        += CHARITY_FUND;   // 1%   = 15 BDT → charity
    fundPool.totalActivations   += 1;
    fundPool.lastUpdated         = new Date();
    await fundPool.save();

    // ── Step 5: Rank Promotion Check ─────────────────────────────────────────
    await checkRankPromotions(user);

    const hasValidSponsor = user.sponsorId && unallocatedBonus === 0;

    return NextResponse.json({
      message: 'Account activated successfully as Premium Member! Welcome to ABS International.',
      distribution: {
        sponsorBonus: hasValidSponsor
          ? `${SPONSOR_BONUS} BDT credited to your sponsor`
          : '0 BDT (No sponsor found — redirected to Global Profit Pool)',
        generationBonus: hasValidSponsor
          ? `${GEN_POOL_TOTAL} BDT distributed across upline generations`
          : '0 BDT (No sponsor found — redirected to Global Profit Pool)',
        autoProfit: hasValidSponsor
          ? `${AUTO_PROFIT} BDT added to Auto-Profit Matrix Pool`
          : '0 BDT (No sponsor found — redirected to Global Profit Pool)',
        globalProfit: hasValidSponsor
          ? `${GLOBAL_PROFIT} BDT added to Global Profit Pool`
          : `${GLOBAL_PROFIT + unallocatedBonus} BDT added to Global Profit Pool (includes unallocated sponsor/generation bonuses)`,
        incentiveFund: `${INCENTIVE_FUND} BDT added to Incentive Fund (rank rewards)`,
        rankDevelopmentFund: `${RANK_DEV_FUND} BDT added to Rank Development Fund`,
        royaltyFund: `${ROYALTY_FUND} BDT added to Royalty Fund (Diamond/Crown/Director)`,
        charityFund: `${CHARITY_FUND} BDT added to Charity Fund`,
      },
      user: {
        isSubscriptionActive: user.isSubscriptionActive,
        rank: user.rank,
        depositWallet: user.depositWallet,
        sebaCardNo: user.sebaCardNo,
      }
    });
  } catch (error: any) {
    console.error('Activation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
