/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/auth';
import { generateUniqueSlug } from '@/lib/slugify-server';
import { CACHE_TAGS } from '@/lib/data-fetching';

// GET a single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug: slug };

    const product = await Product.findOne(query)
      .populate('categories')
      .populate('brand', 'name image slug');

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update a product (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session || !session.user || !(['admin', 'super_admin', 'manager'].includes((session.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Whitelist allowed fields to prevent mass-assignment
    const allowedFields = [
      'name', 'slug', 'description', 'price', 'salePrice', 'purchasePrice', 'discountRate',
      'sku', 'stock', 'categories', 'brand', 'batches', 'tags', 'images',
      'attributes', 'variants', 'isFeatured', 'isNewArrival', 'isPublished', 'deliveryCharge'
    ];
    const safeUpdate: any = {};

    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        let value = body[key];

        // Numeric coercion for main fields
        if (['price', 'salePrice', 'purchasePrice', 'stock', 'discountRate'].includes(key)) {
          if (value === '' || value === undefined || value === null) {
            value = (key === 'salePrice' || key === 'discountRate' || key === 'purchasePrice') ? undefined : 0;
          } else {
            const parsed = key === 'stock' ? parseInt(value, 10) : parseFloat(value);
            value = Number.isFinite(parsed) ? parsed : (key === 'salePrice' || key === 'discountRate' || key === 'purchasePrice' ? undefined : 0);
          }
        }

        // Handle brand
        if (key === 'brand') {
          value = value && value !== '' ? value : null;
        }

        // Deep coercion for variants
        if (key === 'variants' && Array.isArray(value)) {
          value = value.map((v: any) => ({
            _id: v._id || v.id,
            color: v.color,
            size: v.size,
            sku: v.sku,
            image: v.image,
            images: Array.isArray(v.images) ? v.images : (v.image ? [v.image] : []),
            price: Number.isFinite(parseFloat(v.price)) ? parseFloat(v.price) : 0,
            purchasePrice: Number.isFinite(parseFloat(v.purchasePrice)) ? parseFloat(v.purchasePrice) : undefined,
            salePrice: Number.isFinite(parseFloat(v.salePrice)) ? parseFloat(v.salePrice) : undefined,
            stock: Number.isFinite(parseInt(v.stock, 10)) ? parseInt(v.stock, 10) : 0,
            discountRate: Number.isFinite(parseFloat(v.discountRate)) ? parseFloat(v.discountRate) : undefined,
            batches: Array.isArray(v.batches) ? v.batches : [],
          }));
        }

        safeUpdate[key] = value;
      }
    });

    if (Object.keys(safeUpdate).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug: slug };

    const existingProduct = await Product.findOne(query);

    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    if (safeUpdate.slug && safeUpdate.slug !== existingProduct.slug) {
      safeUpdate.slug = await generateUniqueSlug(Product, safeUpdate.slug, existingProduct._id.toString());
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      existingProduct._id,
      { $set: safeUpdate },
      { new: true, runValidators: true }
    ).populate('categories').populate('brand', 'name image slug');

    try {
      revalidateTag(CACHE_TAGS.products, 'max');
      if (existingProduct.slug) {
        revalidatePath(`/product/${existingProduct.slug}`);
      }
      if (updatedProduct && updatedProduct.slug !== existingProduct.slug) {
        revalidatePath(`/product/${updatedProduct.slug}`);
      }
      revalidatePath('/shop');
      revalidatePath('/');
    } catch (e) {
      // Ignore cache revalidation errors
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return NextResponse.json({
        message: `Product with this ${field} already exists.`
      }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a product (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session || !session.user || !(['admin', 'super_admin', 'manager'].includes((session.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { _id: slug }
      : { slug: slug };

    const deletedProduct = await Product.findOneAndDelete(query);

    if (!deletedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    try {
      revalidateTag(CACHE_TAGS.products, 'max');
      if (deletedProduct.slug) {
        revalidatePath(`/product/${deletedProduct.slug}`);
      }
      revalidatePath('/shop');
      revalidatePath('/');
    } catch (e) {
      // Ignore cache revalidation errors
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
