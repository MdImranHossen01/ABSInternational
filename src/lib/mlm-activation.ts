/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import MlmFundPool from '@/models/MlmFundPool';
import { createNotification } from '@/lib/notifications';

// ─── Distribution Constants (out of 1500 BDT — 55% Allocation) ────────────────
export const PACKAGE_PRICE = 1500;
export const SPONSOR_BONUS = 225;   // 1. Refer Bonus (15%)
export const GEN_POOL_TOTAL = 105;  // 2. Generation Bonus (7%)
export const AUTO_PROFIT = 52.5;    // 3. Auto Club (3.5%)
export const INCENTIVE_FUND = 30;   // 4. Incentive Fund (2%)
export const RANK_DEV_FUND = 37.5;  // 5. Rank Development Fund (2.5%)
export const GLOBAL_PROFIT = 30;    // 6. Global Fund (2%)
export const ROYALTY_FUND = 30;     // 7. Royalty Fund (2%)
export const TOUR_FUND = 75;        // 8. Tour Fund (5%)
export const COMMUNITY_FUND = 225;  // 9. Community Fund (15%)
export const CHARITY_FUND = 15;     // 10. Charity Fund (1%)
// Total Allocation: 55% (825 BDT). Company Net Revenue: 45% (675 BDT)

// Generation bonus split (100% of GEN_POOL_TOTAL)
export const GEN_PERCENTAGES = [0.40, 0.20, 0.10, 0.06, 0.06, 0.05, 0.05, 0.03, 0.03, 0.02];

// Auto Profit Matrix tier payouts (BDT)
export const AUTO_PROFIT_TIERS = [240, 720, 2160, 7776, 46656, 233280, 1399680, 5038848, 30233088, 120932352];

// ─── Auto Profit Matrix Tier Check ───────────────────────────────────────────
export async function checkAutoProfitTier(member: any, joinerName: string, joinerId: string) {
  if (member.autoProfitTier >= AUTO_PROFIT_TIERS.length) return;

  member.autoProfitPool = (member.autoProfitPool || 0) + AUTO_PROFIT;

  while (member.autoProfitTier < AUTO_PROFIT_TIERS.length) {
    const nextTierAmount = AUTO_PROFIT_TIERS[member.autoProfitTier];
    if (member.autoProfitPool >= nextTierAmount) {
      member.autoProfitPool -= nextTierAmount;
      member.autoProfitTier += 1;
      member.bonusWallet += nextTierAmount;

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
}

// ─── Rank Promotion Engine ────────────────────────────────────────────────────
export async function checkRankPromotions(user: any) {
  let currentUser = user;
  const visited = new Set<string>();
  let depth = 0;

  while (currentUser && depth < 10) {
    if (!currentUser.memberId || visited.has(currentUser.memberId)) {
      break;
    }
    visited.add(currentUser.memberId);
    depth++;

    const downlines = await User.find({ sponsorId: currentUser.memberId });
    const activeDown = downlines.filter((d: any) => d.isSubscriptionActive);
    let newRank = currentUser.rank;

    if (currentUser.rank === 'user' && currentUser.isSubscriptionActive) {
      newRank = 'Premium Member';
    }

    if (currentUser.rank === 'Premium Member') {
      const cnt = activeDown.filter((d: any) => d.rank !== 'user').length;
      if (cnt >= 6) {
        newRank = 'Team Manager';
        currentUser.bonusWallet += 200;
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
      const cnt = activeDown.filter((d: any) =>
        ['Team Manager', 'Royal Manager', 'Silver Manager', 'Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)
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
      const cnt = activeDown.filter((d: any) =>
        ['Royal Manager', 'Silver Manager', 'Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)
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
      const cnt = activeDown.filter((d: any) =>
        ['Silver Manager', 'Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)
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
      const cnt = activeDown.filter((d: any) =>
        ['Gold Manager', 'Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Diamond Manager';
        currentUser.bonusWallet += 35000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 35000, type: 'earned', status: 'completed',
          description: "Diamond Manager Promotion Reward (Motorbike + Cox's Bazar Tour + 35,000 BDT)"
        });
      }
    } else if (currentUser.rank === 'Diamond Manager') {
      const cnt = activeDown.filter((d: any) =>
        ['Diamond Manager', 'Crown Manager', 'Director'].includes(d.rank)
      ).length;
      if (cnt >= 6) {
        newRank = 'Crown Manager';
        currentUser.bonusWallet += 120000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 120000, type: 'earned', status: 'completed',
          description: "Crown Manager Promotion Reward (Private Car + Cox's Bazar Tour + 120,000 BDT)"
        });
      }
    } else if (currentUser.rank === 'Crown Manager') {
      const cnt = activeDown.filter((d: any) => d.rank === 'Director').length;
      if (cnt >= 6) {
        newRank = 'Director';
        currentUser.bonusWallet += 600000;
        await WalletTransaction.create({
          userId: currentUser._id, amount: 60000, type: 'earned', status: 'completed',
          description: 'Director Promotion Reward (Luxury Flat/Apartment + 600,000 BDT)'
        });
      }
    }

    if (newRank !== currentUser.rank) {
      currentUser.rank = newRank;
      await currentUser.save();

      await createNotification({
        userId: currentUser._id,
        title: 'Rank Promotion!',
        message: `Congratulations! You have been promoted to ${newRank}.`,
        type: 'rank',
        link: '/dashboard/ranks',
      });
    } else {
      await currentUser.save();
    }

    if (currentUser.sponsorId) {
      currentUser = await User.findOne({ memberId: currentUser.sponsorId });
    } else {
      break;
    }
  }
}

// ─── Centralized Premium Activation & MLM Fund Disbursement ──────────────────
export interface ActivationOptions {
  isManualAdmin?: boolean;
  adminName?: string;
  bypassBalanceDeduction?: boolean;
}

export async function executePremiumActivation(user: any, options: ActivationOptions = {}) {
  // 0. Auto-assign memberId if missing (e.g. admin-created users)
  if (!user.memberId) {
    let isUnique = false;
    while (!isUnique) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      const candidate = `ABS-${rand}`;
      const duplicate = await User.findOne({ memberId: candidate });
      if (!duplicate) {
        user.memberId = candidate;
        isUnique = true;
      }
    }
  }

  // 1. Mark subscription active & rank
  user.isSubscriptionActive = true;
  user.rank = 'Premium Member';
  user.isSebaCardGenerated = true;
  if (!user.sebaCardNo) {
    user.sebaCardNo = `ABS-SEBA-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // If user activated themselves via deposit wallet, deduct balance
  if (!options.bypassBalanceDeduction && !options.isManualAdmin) {
    user.depositWallet -= PACKAGE_PRICE;
  }
  await user.save();

  // Record package activation transaction
  await WalletTransaction.create({
    userId: user._id,
    amount: PACKAGE_PRICE,
    type: 'spent',
    status: 'completed',
    description: options.isManualAdmin
      ? `ABS Joining Package Activation (1,500 BDT) by Admin (${options.adminName || 'Admin'})`
      : 'ABS Joining Package Purchase (1,500 BDT)',
  });

  // 2. Sponsor Bonus (15% = 225 BDT)
  let unallocatedBonus = 0;

  if (user.sponsorId) {
    const sponsor = await User.findOne({ memberId: user.sponsorId });
    if (sponsor) {
      sponsor.bonusWallet += SPONSOR_BONUS;
      sponsor.personalSales += PACKAGE_PRICE;
      sponsor.teamCount = (sponsor.teamCount || 0) + 1; // direct downline count
      await sponsor.save();

      await WalletTransaction.create({
        userId: sponsor._id,
        amount: SPONSOR_BONUS,
        type: 'earned',
        status: 'completed',
        description: `Sponsor Bonus (15%) from ${user.name} (${user.memberId})`,
      });

      await createNotification({
        userId: sponsor._id,
        title: 'Sponsor Bonus Earned',
        message: `You earned ৳${SPONSOR_BONUS} sponsor bonus from ${user.name} (${user.memberId}) activating their Premium Membership!`,
        type: 'bonus',
        link: '/dashboard/wallet',
      });

      // 2b: Auto Profit Matrix contribution
      await checkAutoProfitTier(sponsor, user.name, user.memberId);

      // 3. Generation Bonus (7% = 105 BDT across 10 generations)
      // Also increment teamCount for all upline ancestors (up to 10 levels)
      let currentParent = sponsor;
      for (let i = 0; i < 10; i++) {
        currentParent.teamSales += PACKAGE_PRICE;
        const payout = Math.round(GEN_POOL_TOTAL * GEN_PERCENTAGES[i] * 100) / 100;
        currentParent.bonusWallet += payout;
        // teamCount already incremented for sponsor (i=0); increment upline ancestors
        if (i > 0) {
          currentParent.teamCount = (currentParent.teamCount || 0) + 1;
        }
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
      unallocatedBonus = SPONSOR_BONUS + GEN_POOL_TOTAL + AUTO_PROFIT;
    }
  } else {
    unallocatedBonus = SPONSOR_BONUS + GEN_POOL_TOTAL + AUTO_PROFIT;
  }

  // 4. Fund Pool Contributions
  let fundPool = await MlmFundPool.findOne();
  if (!fundPool) {
    fundPool = await MlmFundPool.create({
      autoProfit: 0, globalProfit: 0, incentiveFund: 0,
      rankDevelopmentFund: 0, royaltyFund: 0, tourFund: 0,
      communityFund: 0, charityFund: 0,
      totalActivations: 0,
    });
  }

  fundPool.autoProfit += AUTO_PROFIT;
  fundPool.globalProfit += GLOBAL_PROFIT + unallocatedBonus;
  fundPool.incentiveFund += INCENTIVE_FUND;
  fundPool.rankDevelopmentFund += RANK_DEV_FUND;
  fundPool.royaltyFund += ROYALTY_FUND;
  fundPool.tourFund = (fundPool.tourFund || 0) + TOUR_FUND;
  fundPool.communityFund = (fundPool.communityFund || 0) + COMMUNITY_FUND;
  fundPool.charityFund += CHARITY_FUND;
  fundPool.totalActivations += 1;
  fundPool.lastUpdated = new Date();
  await fundPool.save();

  // 5. Rank Promotion Check
  await checkRankPromotions(user);

  // 6. User Notification
  await createNotification({
    userId: user._id,
    title: 'Premium Membership Activated!',
    message: `Congratulations ${user.name}! Your account is now active as Premium Member. Your Digital Seba Health Card (${user.sebaCardNo}) is ready.`,
    type: 'rank',
    link: '/dashboard/seba-card',
  });

  const hasValidSponsor = user.sponsorId && unallocatedBonus === 0;

  return {
    distribution: {
      sponsorBonus: hasValidSponsor
        ? `${SPONSOR_BONUS} BDT credited to sponsor`
        : '0 BDT (No sponsor found — redirected to Global Profit Pool)',
      generationBonus: hasValidSponsor
        ? `${GEN_POOL_TOTAL} BDT distributed across upline generations`
        : '0 BDT (No sponsor found — redirected to Global Profit Pool)',
      autoProfit: hasValidSponsor
        ? `${AUTO_PROFIT} BDT added to Auto-Profit Matrix Pool`
        : '0 BDT (No sponsor found — redirected to Global Profit Pool)',
      globalProfit: hasValidSponsor
        ? `${GLOBAL_PROFIT} BDT added to Global Profit Pool`
        : `${GLOBAL_PROFIT + unallocatedBonus} BDT added to Global Profit Pool`,
      incentiveFund: `${INCENTIVE_FUND} BDT added to Incentive Fund`,
      rankDevelopmentFund: `${RANK_DEV_FUND} BDT added to Rank Development Fund`,
      royaltyFund: `${ROYALTY_FUND} BDT added to Royalty Fund`,
      tourFund: `${TOUR_FUND} BDT added to Tour Fund`,
      communityFund: `${COMMUNITY_FUND} BDT added to Community Fund`,
      charityFund: `${CHARITY_FUND} BDT added to Charity Fund`,
    },
    user: {
      isSubscriptionActive: user.isSubscriptionActive,
      rank: user.rank,
      depositWallet: user.depositWallet,
      sebaCardNo: user.sebaCardNo,
    }
  };
}
