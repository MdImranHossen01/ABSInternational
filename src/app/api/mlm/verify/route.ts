import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'sponsor' | 'placement'
    const id = (searchParams.get('id') || '').trim();

    if (!id) {
      return NextResponse.json({ success: false, valid: false, message: 'ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find target user by Member ID, Username, or Phone
    const user = await User.findOne({
      $or: [
        { memberId: id.toUpperCase() },
        { username: id.toLowerCase() },
        { phone: id }
      ]
    }).select('name memberId username phone rank isSubscriptionActive');

    if (!user) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: `${type === 'placement' ? 'Placement' : 'Sponsor'} user not found.`
      }, { status: 404 });
    }

    if (type === 'placement') {
      // Find occupied positions under this member
      const downlinePlacements = await User.find({
        placementId: user.memberId
      }).select('placementPosition name username memberId');

      const occupiedPositions: number[] = downlinePlacements
        .map(u => u.placementPosition)
        .filter((pos): pos is number => typeof pos === 'number' && pos >= 1 && pos <= 6);

      const allHands = [1, 2, 3, 4, 5, 6];
      const availablePositions = allHands.filter(h => !occupiedPositions.includes(h));
      const isFull = occupiedPositions.length >= 6;

      return NextResponse.json({
        success: true,
        valid: true,
        memberId: user.memberId,
        username: user.username,
        name: user.name,
        occupiedPositions,
        availablePositions,
        isFull,
        totalOccupied: occupiedPositions.length
      });
    }

    // Default / Sponsor check
    return NextResponse.json({
      success: true,
      valid: true,
      memberId: user.memberId,
      username: user.username,
      name: user.name,
    });
  } catch (error: any) {
    console.error('Error verifying MLM member:', error);
    return NextResponse.json({
      success: false,
      valid: false,
      message: 'Failed to verify member.'
    }, { status: 500 });
  }
}
