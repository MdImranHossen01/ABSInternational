import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const loggedInUser = await User.findById((session.user as any).id);
    if (!loggedInUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
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

    const directTeam = await User.find(directQuery)
      .select('name email phone memberId rank isSubscriptionActive createdAt')
      .sort({ createdAt: -1 });

    // Fetch 10 generations count and structured tree
    // We will do a breadth-first search up to 10 levels
    const generations: any[] = [];
    let currentLevelMemberIds = [loggedInUser.memberId];

    for (let level = 1; level <= 10; level++) {
      if (currentLevelMemberIds.length === 0) {
        generations.push({ level, members: [] });
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

      generations.push({
        level,
        members: levelMembers.map(m => ({
          name: m.name,
          email: m.email,
          phone: m.phone,
          memberId: m.memberId,
          sponsorId: m.sponsorId,
          rank: m.rank,
          isSubscriptionActive: m.isSubscriptionActive,
          createdAt: m.createdAt
        }))
      });

      currentLevelMemberIds = levelMembers.map(m => m.memberId);
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
