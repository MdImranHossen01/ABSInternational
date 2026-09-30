import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { auth } from '@/auth';
import mongoose from 'mongoose';

async function getAuthenticatedUserId(session: any) {
  if (!session || !session.user) return null;
  
  if (session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
    return session.user.id;
  }

  if (session.user.email) {
    const user = await User.findOne({ email: session.user.email.toLowerCase() }).select('_id');
    if (user) return user._id.toString();
  }

  return (session.user as any).id || null;
}

// GET /api/user/notifications - list notifications for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = await getAuthenticatedUserId(session);

    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const unreadOnly = searchParams.get('unread') === 'true';

    const filter: any = { userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/user/notifications - mark as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = await getAuthenticatedUserId(session);

    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;

    if (markAll) {
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (id) {
      await Notification.updateOne({ _id: id, userId }, { $set: { read: true } });
      return NextResponse.json({ message: 'Notification marked as read' });
    }

    return NextResponse.json({ message: 'Missing notification id or markAll flag' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { message: 'Failed to update notification', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/user/notifications?id=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const userId = await getAuthenticatedUserId(session);

    if (!userId) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Notification ID required' }, { status: 400 });
    }

    await Notification.deleteOne({ _id: id, userId });
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { message: 'Failed to delete notification', error: error.message },
      { status: 500 }
    );
  }
}
