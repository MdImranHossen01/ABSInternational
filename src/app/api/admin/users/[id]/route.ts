import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== 'admin' && userRole !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the user by ObjectId or memberId
    let targetUser: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      targetUser = await User.findById(id).lean();
    }
    if (!targetUser) {
      targetUser = await User.findOne({ memberId: id }).lean();
    }
    if (!targetUser) {
      targetUser = await User.findOne({ email: id }).lean();
    }

    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 1. Fetch Sponsor Details
    let sponsorInfo: any = null;
    if (targetUser.sponsorId) {
      if (targetUser.sponsorId === 'ABS-COMPANY' || targetUser.sponsorId === 'COMPANY') {
        sponsorInfo = {
          name: 'ABS Company (Root Sponsor)',
          memberId: 'ABS-COMPANY',
          isCompany: true,
          email: 'info@absinternationalltd.com',
          phone: '+880 1931-111911',
          rank: 'Company Director',
          isSubscriptionActive: true,
        };
      } else {
        const foundSponsor = await User.findOne({ memberId: targetUser.sponsorId })
          .select('_id name email phone memberId rank isSubscriptionActive role image createdAt')
          .lean();
        if (foundSponsor) {
          sponsorInfo = foundSponsor;
        } else {
          sponsorInfo = {
            memberId: targetUser.sponsorId,
            name: 'Unknown Sponsor',
          };
        }
      }
    }

    // 2. Fetch Direct Downline Members with Purchase Amount & Orders
    let downlines: any[] = [];
    if (targetUser.memberId) {
      downlines = await User.aggregate([
        { $match: { sponsorId: targetUser.memberId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'user',
            as: 'userOrders',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            role: 1,
            image: 1,
            memberId: 1,
            sponsorId: 1,
            rank: 1,
            isSubscriptionActive: 1,
            depositWallet: 1,
            bonusWallet: 1,
            personalSales: 1,
            teamSales: 1,
            teamCount: 1,
            createdAt: 1,
            totalOrders: { $size: '$userOrders' },
            totalSpent: { $sum: '$userOrders.totalAmount' },
          },
        },
      ]);
    }

    // 3. Fetch User Orders / Purchase History
    const orders = await Order.find({ user: targetUser._id })
      .sort({ createdAt: -1 })
      .lean();

    const totalOrdersCount = orders.length;
    const totalPurchaseAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
    const confirmedOrdersCount = orders.filter(o => o.status === 'Confirmed' || o.status === 'Delivered').length;

    // Direct downlines stats
    const totalDownlinesCount = downlines.length;
    const activeDownlinesCount = downlines.filter(d => d.isSubscriptionActive).length;
    const freeDownlinesCount = totalDownlinesCount - activeDownlinesCount;
    const totalDownlineSales = downlines.reduce((sum, d) => sum + (d.totalSpent || 0), 0);

    return NextResponse.json({
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role,
        image: targetUser.image,
        memberId: targetUser.memberId,
        sponsorId: targetUser.sponsorId,
        rank: targetUser.rank || 'user',
        isSubscriptionActive: !!targetUser.isSubscriptionActive,
        depositWallet: targetUser.depositWallet || 0,
        bonusWallet: targetUser.bonusWallet || 0,
        withdrawalWallet: targetUser.withdrawalWallet || 0,
        walletBalance: targetUser.walletBalance || 0,
        personalSales: targetUser.personalSales || 0,
        teamSales: targetUser.teamSales || 0,
        teamCount: targetUser.teamCount || totalDownlinesCount,
        addresses: targetUser.addresses || [],
        createdAt: targetUser.createdAt,
        lastActive: targetUser.lastActive,
      },
      sponsor: sponsorInfo,
      downlines,
      orders: orders.map((o: any) => ({
        _id: o._id,
        shortId: o.shortId || o._id.toString().slice(-8),
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        itemsCount: o.items?.length || 0,
        items: (o.items || []).map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
          image: it.image,
        })),
        createdAt: o.createdAt,
      })),
      stats: {
        totalPurchaseAmount,
        totalOrdersCount,
        deliveredOrdersCount,
        confirmedOrdersCount,
        totalDownlinesCount,
        activeDownlinesCount,
        freeDownlinesCount,
        totalDownlineSales,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin user detail:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error?.message },
      { status: 500 }
    );
  }
}
