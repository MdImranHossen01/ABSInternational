import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/Notification';
import Order from '@/models/Order';
import WalletTransaction from '@/models/WalletTransaction';
import User from '@/models/User';
import Product from '@/models/Product';

async function verifyAdminAuth() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'admin' && role !== 'super_admin')) {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const type = searchParams.get('type');

    // 1. Calculate live queue action items
    const [
      pendingOrdersCount,
      pendingWithdrawalsCount,
      pendingDepositsCount,
      pendingKycCount,
      lowStockCount,
    ] = await Promise.all([
      Order.countDocuments({ status: 'Order Placed', deletedAt: null }),
      WalletTransaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
      WalletTransaction.countDocuments({ type: 'deposit', status: 'pending' }),
      User.countDocuments({ nidStatus: 'Pending' }),
      Product.countDocuments({ stock: { $lt: 5 } }),
    ]);

    const totalQueueActions =
      pendingOrdersCount +
      pendingWithdrawalsCount +
      pendingDepositsCount +
      pendingKycCount;

    // 2. Fetch logged admin notifications
    const filter: any = { forAdmin: true };
    if (type && type !== 'all') {
      filter.type = type;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ forAdmin: true, read: false }),
    ]);

    return NextResponse.json({
      queues: {
        pendingOrders: pendingOrdersCount,
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingDeposits: pendingDepositsCount,
        pendingKyc: pendingKycCount,
        lowStock: lowStockCount,
        totalQueueActions,
      },
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admin notifications', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;

    if (markAll) {
      await Notification.updateMany({ forAdmin: true, read: false }, { $set: { read: true } });
      return NextResponse.json({ message: 'All admin notifications marked as read' });
    }

    if (id) {
      await Notification.updateOne({ _id: id, forAdmin: true }, { $set: { read: true } });
      return NextResponse.json({ message: 'Admin notification marked as read' });
    }

    return NextResponse.json({ message: 'Missing notification id or markAll flag' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating admin notification:', error);
    return NextResponse.json(
      { message: 'Failed to update admin notification', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifyAdminAuth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Notification ID required' }, { status: 400 });
    }

    await Notification.deleteOne({ _id: id, forAdmin: true });
    return NextResponse.json({ message: 'Admin notification deleted' });
  } catch (error: any) {
    console.error('Error deleting admin notification:', error);
    return NextResponse.json(
      { message: 'Failed to delete notification', error: error.message },
      { status: 500 }
    );
  }
}
