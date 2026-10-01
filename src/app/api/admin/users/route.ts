import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order'; // Import to ensure model is registered

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== 'admin' && userRole !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
    const search = searchParams.get('search') || '';

    const type = searchParams.get('type') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const roleFilter = searchParams.get('role') || 'all';
    const rankFilter = searchParams.get('rank') || 'all';
    const sortBy = searchParams.get('sortBy') || 'newest';

    await connectToDatabase();

    const matchQuery: any = {};

    if (type === 'admins') {
      matchQuery.role = { $in: ['admin', 'super_admin', 'manager'] };
    } else if (type === 'leaders') {
      matchQuery.sponsorId = 'ABS-COMPANY';
    } else if (type === 'active') {
      matchQuery.isSubscriptionActive = true;
      matchQuery.role = { $nin: ['admin', 'super_admin'] };
    } else if (type === 'free') {
      matchQuery.isSubscriptionActive = false;
      matchQuery.role = { $nin: ['admin', 'super_admin'] };
    } else if (type === 'ranks') {
      matchQuery.rank = { $nin: ['user', null, ''] };
    } else {
      // 'all'
      matchQuery.role = { $ne: 'super_admin' as const };
    }

    // Explicit Status Filter
    if (statusFilter === 'active') {
      matchQuery.isSubscriptionActive = true;
    } else if (statusFilter === 'free') {
      matchQuery.isSubscriptionActive = false;
    }

    // Explicit Role Filter
    if (roleFilter && roleFilter !== 'all') {
      matchQuery.role = roleFilter;
    }

    // Explicit Rank Filter
    if (rankFilter && rankFilter !== 'all') {
      if (rankFilter === 'General' || rankFilter === 'user') {
        matchQuery.$or = [
          { rank: 'user' },
          { rank: 'General' },
          { rank: null },
          { rank: '' },
          { rank: { $exists: false } }
        ];
      } else {
        matchQuery.rank = rankFilter;
      }
    }

    if (search) {
      const searchOr = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
        { sponsorId: { $regex: search, $options: 'i' } },
      ];
      if (matchQuery.$or) {
        matchQuery.$and = [{ $or: matchQuery.$or }, { $or: searchOr }];
        delete matchQuery.$or;
      } else {
        matchQuery.$or = searchOr;
      }
    }
    const totalCount = await User.countDocuments(matchQuery);

    // Determine sort
    let sortStage: any = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortStage = { createdAt: 1 };
    } else if (sortBy === 'name_asc') {
      sortStage = { name: 1 };
    }

    const isOrderSort = sortBy === 'orders_desc' || sortBy === 'spent_desc';

    // Pipeline
    const pipeline: any[] = [{ $match: matchQuery }];

    if (!isOrderSort) {
      pipeline.push({ $sort: sortStage });
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'userOrders'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sponsorId',
          foreignField: 'memberId',
          as: 'sponsorDoc'
        }
      },
      {
        $unwind: {
          path: '$sponsorDoc',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          image: 1,
          createdAt: 1,
          phone: 1,
          addresses: 1,
          lastActive: 1,
          memberId: 1,
          sponsorId: 1,
          sponsorName: {
            $cond: {
              if: { $in: ['$sponsorId', ['ABS-COMPANY', 'COMPANY']] },
              then: 'ABS Company',
              else: '$sponsorDoc.name'
            }
          },
          sponsorPhone: '$sponsorDoc.phone',
          rank: 1,
          isSubscriptionActive: 1,
          depositWallet: 1,
          bonusWallet: 1,
          withdrawalWallet: 1,
          personalSales: 1,
          teamSales: 1,
          teamCount: 1,
          totalOrders: { $size: '$userOrders' },
          totalSpent: { $sum: '$userOrders.totalAmount' },
          lastOrderDate: { $max: '$userOrders.createdAt' }
        }
      }
    );

    if (isOrderSort) {
      if (sortBy === 'orders_desc') {
        pipeline.push({ $sort: { totalOrders: -1, createdAt: -1 } });
      } else if (sortBy === 'spent_desc') {
        pipeline.push({ $sort: { totalSpent: -1, createdAt: -1 } });
      }
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
    }

    const users = await User.aggregate(pipeline);

    return NextResponse.json({
      users,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    
    // Both admin and super_admin can manually assign admins by email
    if (!session || (currentUserRole !== 'super_admin' && currentUserRole !== 'admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, image, phone, password } = await req.json();

    // Must have either email or phone
    if (!email && !phone) {
      return NextResponse.json({ message: 'Email or phone number is required' }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.[A-Za-z]{2,})+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    await connectToDatabase();

    const { normalizePhoneNumber } = await import('@/lib/utils');
    const cleanPhone = phone ? normalizePhoneNumber(phone) : undefined;

    const updateObj: any = { role: 'admin' };
    if (name) updateObj.name = name;
    if (image) updateObj.image = image;
    if (email) updateObj.email = email.toLowerCase();
    if (cleanPhone) updateObj.phone = cleanPhone;
    if (password) {
      const bcrypt = (await import('bcryptjs')).default;
      updateObj.password = await bcrypt.hash(password, 12);
    }

    const setOnInsertObj: any = {};
    if (!name) {
      setOnInsertObj.name = email ? email.split('@')[0] : (cleanPhone || 'Admin');
    }

    // Build query: find by email OR phone (whichever is provided)
    const query: any = { $or: [] };
    if (email) query.$or.push({ email: email.toLowerCase() });
    if (cleanPhone) query.$or.push({ phone: cleanPhone });

    const result = await User.findOneAndUpdate(
      query,
      { 
        $set: updateObj,
        $setOnInsert: setOnInsertObj
      },
      { upsert: true, new: true }
    );

    const identifier = email || phone;
    return NextResponse.json({ 
      message: `Successfully assigned Admin role to ${identifier}`,
      user: result
    });
  } catch (error) {
    console.error('Assign Admin Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    
    if (!session || (currentUserRole !== 'admin' && currentUserRole !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role, action, newSponsorId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the user to update
    const userToUpdate = await User.findOne({ _id: userId });

    if (!userToUpdate) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Handle Admin Manual Premium Activation
    if (action === 'make_premium' || action === 'activate_premium') {
      if (userToUpdate.isSubscriptionActive) {
        return NextResponse.json({ message: 'User is already a Premium Member.' }, { status: 400 });
      }

      // If admin provided a new sponsor ID, validate and assign it
      if (newSponsorId && newSponsorId.trim()) {
        const cleanSponsor = newSponsorId.trim();
        const sponsorUser = await User.findOne({
          $or: [
            { memberId: cleanSponsor.toUpperCase() },
            { phone: cleanSponsor },
            { username: cleanSponsor.toLowerCase() },
          ]
        });

        if (!sponsorUser) {
          return NextResponse.json(
            { message: `Sponsor "${cleanSponsor}" not found. Please provide a valid Member ID, phone number, or username.` },
            { status: 400 }
          );
        }

        if (sponsorUser._id.toString() === userToUpdate._id.toString()) {
          return NextResponse.json(
            { message: 'A user cannot be their own sponsor.' },
            { status: 400 }
          );
        }

        userToUpdate.sponsorId = sponsorUser.memberId;
        await userToUpdate.save();
      }

      const { executePremiumActivation } = await import('@/lib/mlm-activation');
      const result = await executePremiumActivation(userToUpdate, {
        isManualAdmin: true,
        adminName: session.user?.name || 'Admin',
        bypassBalanceDeduction: true,
      });

      const sponsorMsg = newSponsorId
        ? ` Sponsor set to ${userToUpdate.sponsorId}.`
        : userToUpdate.sponsorId
          ? ` Existing sponsor (${userToUpdate.sponsorId}) used.`
          : ' No sponsor — funds redirected to Global Pool.';

      return NextResponse.json({ 
        message: `${userToUpdate.name} has been upgraded to Premium Member! 1,500 BDT package funds distributed.${sponsorMsg}`,
        distribution: result.distribution 
      });
    }

    if (!role || !['user', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    // Prevent changing role of super_admin
    if (userToUpdate.role === 'super_admin') {
      return NextResponse.json({ message: 'Cannot change role of super_admin' }, { status: 403 });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    return NextResponse.json({ message: `User role updated to ${role} successfully` });
  } catch (error) {
    console.error('Update User Role Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserRole = (session?.user as any)?.role;
    
    if (!session || (currentUserRole !== 'admin' && currentUserRole !== 'super_admin')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the user to delete
    const userToDelete = await User.findOne({ _id: userId });

    if (!userToDelete) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prevent deleting super_admin
    if (userToDelete.role === 'super_admin') {
      return NextResponse.json({ message: 'Cannot delete a super_admin' }, { status: 403 });
    }

    // Check if user has orders
    const orderCount = await Order.countDocuments({ user: userId });
    if (orderCount > 0) {
      return NextResponse.json({ 
        message: `Cannot delete user: This user has ${orderCount} existing orders. Delete orders first or suspend the user instead.` 
      }, { status: 400 });
    }

    await User.deleteOne({ _id: userId });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
