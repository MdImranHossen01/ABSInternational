import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Brand from '@/models/Brand';
import { auth } from '@/auth';

// GET all brands
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const query = all ? {} : { isActive: true };
    const brands = await Brand.find(query).sort({ name: 1 });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new brand (Admin/Manager only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !(['admin', 'super_admin', 'manager'].includes((session.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug, image, isActive } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Brand name is required' }, { status: 400 });
    }

    await connectToDatabase();

    if (slug) {
      const existingBrand = await Brand.findOne({ slug });
      if (existingBrand) {
        return NextResponse.json({ message: 'Brand with this slug already exists' }, { status: 400 });
      }
    }

    const newBrand = await Brand.create({
      name,
      slug,
      image,
      isActive: isActive !== undefined ? isActive : true,
    });

    try {
      revalidateTag('brands', 'max');
      revalidatePath('/');
    } catch (e) {
      // Ignore cache revalidation errors
    }

    return NextResponse.json(newBrand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
