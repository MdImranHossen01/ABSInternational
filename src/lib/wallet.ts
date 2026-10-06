/* eslint-disable @typescript-eslint/no-explicit-any */
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { createNotification } from '@/lib/notifications';

export const AUTO_CONVERT_MINIMUM = 500;

/**
 * Checks if the user's bonusWallet balance is >= 500 BDT.
 * If yes, automatically moves the entire bonus balance to withdrawalWallet
 * and records a completed WalletTransaction and user notification.
 */
export async function checkAndAutoConvertBonus(
  userOrId: any
): Promise<{ converted: boolean; amount: number; user: any }> {
  try {
    if (!userOrId) return { converted: false, amount: 0, user: null };

    let user = userOrId;
    const isMongooseDoc = typeof user?.save === 'function';

    if (!isMongooseDoc) {
      const userId = user?._id || user;
      if (!userId) return { converted: false, amount: 0, user };
      user = await User.findById(userId);
      if (!user) return { converted: false, amount: 0, user: null };
    }

    const currentBonus = Number(user.bonusWallet) || 0;
    const amountToConvert = Math.floor(currentBonus / AUTO_CONVERT_MINIMUM) * AUTO_CONVERT_MINIMUM;

    if (amountToConvert >= AUTO_CONVERT_MINIMUM) {
      user.bonusWallet = Math.round((currentBonus - amountToConvert) * 100) / 100;
      user.withdrawalWallet = (Number(user.withdrawalWallet) || 0) + amountToConvert;
      await user.save();

      await WalletTransaction.create({
        userId: user._id,
        amount: amountToConvert,
        type: 'transfer_in',
        status: 'completed',
        description: `Auto-converted ৳${amountToConvert.toLocaleString()} (in multiples of ৳500) from Bonus Wallet to Withdrawal Wallet`,
      });

      await createNotification({
        userId: user._id,
        title: 'Bonus Auto-Converted! 💰',
        message: `৳${amountToConvert.toLocaleString()} has been automatically moved from your Bonus Wallet to Withdrawal Wallet. You can now withdraw it directly!`,
        type: 'wallet',
        link: '/dashboard/withdraw',
      }).catch((e) => console.error('Notification error in auto-convert:', e));

      return { converted: true, amount: amountToConvert, user };
    }

    return { converted: false, amount: 0, user };
  } catch (error) {
    console.error('Error in checkAndAutoConvertBonus:', error);
    return { converted: false, amount: 0, user: userOrId };
  }
}
