import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !session.user || !(['admin', 'super_admin', 'manager'].includes(userRole))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const products = await Product.find({
      $or: [
        { stock: { $lt: 5 } },
        { 'variants.stock': { $lt: 5 } }
      ]
    }).populate('brand', 'name').lean();

    const lowStockItems: any[] = [];

    for (const product of products as any[]) {
      const hasVariants = product.variants && product.variants.length > 0;

      if (!hasVariants && product.stock < 5) {
        lowStockItems.push({
          id: `${product._id}-central`,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          brand: product.brand?.name || null,
          color: null,
          size: null,
          sku: product.sku || 'N/A',
          location: 'Central Warehouse',
          stock: product.stock || 0,
        });
      }

      if (hasVariants && Array.isArray(product.variants)) {
        for (const variant of product.variants) {
          if (variant.stock < 5) {
            lowStockItems.push({
              id: `${product._id}-variant-${variant._id}`,
              productId: product._id,
              slug: product.slug,
              name: product.name,
              brand: product.brand?.name || null,
              color: variant.color || null,
              size: variant.size || null,
              sku: variant.sku || product.sku || 'N/A',
              location: 'Central Warehouse',
              stock: variant.stock || 0,
            });
          }
        }
      }
    }

    // Sort by lowest stock first
    lowStockItems.sort((a, b) => a.stock - b.stock);

    return NextResponse.json({ items: lowStockItems }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching low stock:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
