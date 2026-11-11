import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Brand from '@/models/Brand';
import { auth } from '@/auth';
import { deleteFromR2 } from '@/lib/r2';
import { purgeCloudflareCache } from '@/lib/cloudflareCache';

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

    const oldImage = brand.image;

    if (name !== undefined) brand.name = name;
    if (slug !== undefined) brand.slug = slug;
    if (image !== undefined) brand.image = image;
    if (isActive !== undefined) brand.isActive = isActive;

    await brand.save();

    // Clean up old brand image from R2 if image was changed
    if (oldImage && image && oldImage !== image) {
      deleteFromR2(oldImage).catch((err) =>
        console.error('Failed to delete old brand image from R2:', err)
      );
    }

    try {
      revalidateTag('brands', 'max');
      revalidatePath('/');
      purgeCloudflareCache().catch((err) =>
        console.error('Failed to purge Cloudflare cache on brand update:', err)
      );
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

    if (deleted.image) {
      deleteFromR2(deleted.image).catch((err) =>
        console.error('Failed to delete brand image from R2:', err)
      );
    }

    try {
      revalidateTag('brands', 'max');
      revalidatePath('/');
      purgeCloudflareCache().catch((err) =>
        console.error('Failed to purge Cloudflare cache on brand delete:', err)
      );
    } catch (e) {
      // Ignore cache revalidation errors
    }

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
