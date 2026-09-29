import { Metadata } from 'next';
import PlanClient from './PlanClient';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';

export const metadata: Metadata = {
  title: 'Official Member & Business Plan | ABS International',
  description: 'Explore the ABS International Business Plan: 1,500 BDT Membership Package, 10-Generation MLM Commission, 3-Wallet Profile System, 10-Tier Auto Profit Club, and 9-Stage Leadership Rank Rewards.',
};

async function getSettings() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne().lean();
    if (!settings) {
      return {
        brandName: 'ABS International',
      };
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error fetching settings for plan page:', error);
    return null;
  }
}

export default async function PlanPage() {
  const settings = await getSettings();
  const brandName = settings?.brandName || 'ABS International';

  return <PlanClient brandName={brandName} />;
}
