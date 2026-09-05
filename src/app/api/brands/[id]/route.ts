import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Brand from '@/models/Brand';
import { auth } from '@/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !(['admin', 'super_admin', 'manager'].includes((session.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, slug, image, isActive } = await req.json();

    await connectToDatabase();

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }

    if (slug && slug !== brand.slug) {
      const existing = await Brand.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ message: 'Brand with this slug already exists' }, { status: 400 });
      }
    }

    if (name !== undefined) brand.name = name;
    if (slug !== undefined) brand.slug = slug;
    if (image !== undefined) brand.image = image;
    if (isActive !== undefined) brand.isActive = isActive;

    await brand.save();

    try {
      revalidateTag('brands', 'max');
      revalidatePath('/');
    } catch (e) {
      // Ignore cache revalidation errors
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !(['admin', 'super_admin', 'manager'].includes((session.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }

    try {
      revalidateTag('brands', 'max');
      revalidatePath('/');
    } catch (e) {
      // Ignore cache revalidation errors
    }

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
