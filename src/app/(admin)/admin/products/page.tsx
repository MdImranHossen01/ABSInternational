'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash, Loader2, Search, DatabaseZap, Download, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { Pagination } from '@/components/ui/pagination';

interface AdminProduct {
  _id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand?: { _id?: string; name?: string; slug?: string } | null;
  batches?: { batchNumber: string; expiryDate?: Date; stock: number }[];
  isPublished: boolean;
  images?: string[];
  slug: string;
  views?: number;
  totalSales?: number;
  description?: string;
  categories?: any[];
  variants?: any[];
}

function ProductsContent() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const limit = 10;

  // Add Stock Modal State
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [addStockProduct, setAddStockProduct] = useState<AdminProduct | null>(null);
  const [addStockBatchNumber, setAddStockBatchNumber] = useState('');
  const [addStockExpiryDate, setAddStockExpiryDate] = useState('');
  const [addStockTopLevel, setAddStockTopLevel] = useState<number>(0);
  const [addStockVariants, setAddStockVariants] = useState<Array<{ variantId: string; color?: string; size?: string; stockToAdd: number }>>([]);
  const [addingStock, setAddingStock] = useState(false);

  const fetchProducts = async (signal?: AbortSignal, page = currentPage) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?page=${page}&limit=${limit}`, { signal });
      if (!response.ok) {
        toast.error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        return;
      }
      const data = await response.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This product will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00D1B2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 font-bold',
        cancelButton: 'rounded-lg px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Product deleted successfully');
          setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
          fetchProducts();
        } else {
          toast.error('Failed to delete product');
        }
      } catch {
        toast.error('Error deleting product');
      }
    }
  };

  const handleOpenAddStock = (product: AdminProduct) => {
    setAddStockProduct(product);
    setAddStockBatchNumber(product.batches?.[0]?.batchNumber || '');
    setAddStockExpiryDate(
      product.batches?.[0]?.expiryDate
        ? new Date(product.batches[0].expiryDate).toISOString().split('T')[0]
        : ''
    );
    setAddStockTopLevel(0);

    if (product.variants && product.variants.length > 0) {
      const vItems = product.variants.map((v: any) => ({
        variantId: v._id?.toString() || v.id?.toString(),
        color: v.color,
        size: v.size,
        stockToAdd: 0,
      }));
      setAddStockVariants(vItems);
    } else {
      setAddStockVariants([]);
    }

    setAddStockModalOpen(true);
  };

  const handleAddStockSubmit = async () => {
    if (!addStockProduct) return;

    setAddingStock(true);
    try {
      const response = await fetch('/api/products/add-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: addStockProduct._id,
          batchNumber: addStockBatchNumber,
          expiryDate: addStockExpiryDate || undefined,
          topLevelStock: addStockTopLevel,
          variantStocks: addStockVariants,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Stock added successfully');
        setAddStockModalOpen(false);
        setAddStockProduct(null);
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock');
    } finally {
      setAddingStock(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const searchLower = (search ?? '').toLowerCase();
    const nameLower = (p.name ?? '').toLowerCase();
    const skuLower = (p.sku ?? '').toLowerCase();
    const brandLower = (p.brand?.name ?? '').toLowerCase();
    return nameLower.includes(searchLower) || skuLower.includes(searchLower) || brandLower.includes(searchLower);
  });

  const toggleSelectAll = () => {
    const visibleIds = filteredProducts.map(p => p._id);
    const areAllSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

    if (areAllSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => [...prev, ...visibleIds.filter(id => !prev.includes(id))]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const cleanDescription = (htmlStr?: string) => {
    if (!htmlStr) return 'Product description';
    return htmlStr.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, ' ').trim() || 'Product description';
  };

  const getAbsoluteUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
      return urlPath;
    }
    return `${window.location.origin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
  };

  const exportToCSV = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one product to export.');
      return;
    }

    try {
      setExportLoading(true);
      const res = await fetch(`/api/products?ids=${selectedIds.join(',')}&limit=1000`);
      if (!res.ok) throw new Error('Failed to fetch selected products');
      const data = await res.json();
      const exportProducts: AdminProduct[] = data.products || [];

      const headers = [
        'id',
        'title',
        'description',
        'availability',
        'condition',
        'price',
        'link',
        'image_link',
        'brand'
      ];

      const rows: string[][] = [];

      exportProducts.forEach((p) => {
        const itemPrice = `${p.salePrice || p.price || 0} BDT`;
        const itemLink = getAbsoluteUrl(`/product/${p.slug}`);
        const itemImage = p.images && p.images.length > 0 ? getAbsoluteUrl(p.images[0]) : '';
        const itemAvailability = (p.stock && p.stock > 0) ? 'in stock' : 'out of stock';
        const brandName = p.brand?.name || 'ABS International';

        rows.push([
          p.sku || p._id,
          p.name,
          cleanDescription(p.description),
          itemAvailability,
          'new',
          itemPrice,
          itemLink,
          itemImage,
          brandName
        ]);
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row =>
          row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `catalog_products_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${rows.length} product(s) to CSV!`);
    } catch (err) {
      console.error(err);
      toast.error('Error generating product catalog export.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 px-0 py-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your central warehouse inventory and product catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU or brand..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden relative">
        {selectedIds.length > 0 && (
          <div className="sticky top-0 z-20 w-full bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-4 text-sm font-medium">
              <span>{selectedIds.length} products selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-white/10"
                onClick={() => setSelectedIds([])}
              >
                Deselect All
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-primary hover:bg-white/90"
                onClick={exportToCSV}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3 w-3" />
                )}
                Export Selected
              </Button>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.includes(p._id))}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[70px]">Image</TableHead>
                <TableHead>Name & Brand</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id} className={selectedIds.includes(product._id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(product._id)}
                        onCheckedChange={() => toggleSelect(product._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                        {product.images && product.images.length > 0 ? (
                          <Image 
                            src={product.images[0]} 
                            alt={product.name} 
                            width={48}
                            height={48}
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[240px]">
                      <div className="flex flex-col">
                        <Link 
                          href={`/product/${product.slug}`} 
                          target="_blank"
                          className="hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4 truncate font-semibold"
                        >
                          {product.name}
                        </Link>
                        {product.brand?.name && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Sparkles className="h-3 w-3 text-primary" />
                            {product.brand.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={product.salePrice ? 'text-xs line-through text-muted-foreground' : ''}>
                          ৳{product.price ? Math.round(product.price) : '0'}
                        </span>
                        {product.salePrice && (
                          <span className="font-semibold text-primary">
                            ৳{Math.round(product.salePrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={(product.stock ?? 0) <= 5 ? 'text-destructive font-bold' : 'font-semibold'}>
                        {product.stock ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-muted-foreground">{product.views ?? 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{product.totalSales ?? 0}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isPublished ? 'default' : 'secondary'}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddStock(product)}
                          className="h-8 px-2 text-xs text-primary border-primary/30 hover:bg-primary/10"
                          title="Add Stock / Batch"
                        >
                          <DatabaseZap className="h-3.5 w-3.5 mr-1" /> Add Stock
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No products found.</div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border bg-muted relative">
                    {product.images && product.images.length > 0 ? (
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill
                        className="object-cover" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link 
                        href={`/product/${product.slug}`} 
                        target="_blank"
                        className="font-bold text-sm text-slate-900 hover:text-primary transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <Badge variant={product.isPublished ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5 shrink-0">
                        {product.isPublished ? 'Live' : 'Draft'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span>SKU: {product.sku || 'N/A'}</span>
                      {product.brand?.name && (
                        <span className="text-primary font-sans font-semibold">• {product.brand.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">
                        ৳{product.salePrice ? Math.round(product.salePrice) : Math.round(product.price || 0)}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs line-through text-muted-foreground">
                          ৳{Math.round(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock</span>
                    <span className={(product.stock ?? 0) <= 5 ? 'text-destructive font-bold' : 'font-bold text-slate-700'}>
                      {product.stock ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales</span>
                    <span className="font-bold text-primary">{product.totalSales ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Views</span>
                    <span className="font-semibold text-slate-600">{product.views ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAddStock(product)}
                    className="h-8 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10 rounded-lg gap-1"
                  >
                    <DatabaseZap className="h-3.5 w-3.5" /> Stock
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2.5 text-xs rounded-lg gap-1"
                      onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="h-8 px-2.5 text-xs rounded-lg gap-1"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {!loading && pagination.totalPages > 1 && (
        <div className="py-4">
          <Pagination 
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchProducts(undefined, page);
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', page.toString());
              router.push(`?${params.toString()}`);
            }}
          />
        </div>
      )}

      {/* Add Stock Dialog Modal */}
      <Dialog open={addStockModalOpen} onOpenChange={setAddStockModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Stock</DialogTitle>
          </DialogHeader>
          {addStockProduct && (
            <div className="grid gap-4 py-3">
              <div className="flex flex-col gap-0.5 bg-muted/40 p-3 rounded-xl border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</span>
                <span className="text-sm font-bold text-foreground">{addStockProduct.name}</span>
                {addStockProduct.brand?.name && (
                  <span className="text-xs text-primary">Brand: {addStockProduct.brand.name}</span>
                )}
              </div>

              <div className="grid grid-cols-4 items-center gap-3">
                <label className="text-right text-xs font-semibold text-muted-foreground">
                  Batch Number
                </label>
                <Input
                  className="col-span-3 h-9"
                  placeholder="e.g. BATCH-002 (Optional)"
                  value={addStockBatchNumber}
                  onChange={(e) => setAddStockBatchNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-3">
                <label className="text-right text-xs font-semibold text-muted-foreground">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  className="col-span-3 h-9"
                  value={addStockExpiryDate}
                  onChange={(e) => setAddStockExpiryDate(e.target.value)}
                />
              </div>

              <div className="border-t border-border pt-3 mt-1">
                <h4 className="text-sm font-semibold mb-3">Add Stock Quantities</h4>
                {addStockVariants.length > 0 ? (
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {addStockVariants.map((variant, index) => (
                      <div key={variant.variantId || index} className="flex items-center justify-between gap-4 p-2.5 border rounded-xl bg-card">
                        <div className="text-xs font-medium">
                          {variant.color && <span className="font-semibold text-foreground">{variant.color}</span>}
                          {variant.color && variant.size && <span className="mx-1 text-muted-foreground">•</span>}
                          {variant.size && <span>Size: {variant.size}</span>}
                        </div>
                        <Input
                          type="number"
                          min="0"
                          className="w-24 text-right h-8"
                          value={variant.stockToAdd || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newVariants = [...addStockVariants];
                            newVariants[index].stockToAdd = Math.max(0, val);
                            setAddStockVariants(newVariants);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 p-3 border rounded-xl bg-card">
                    <span className="text-sm font-medium text-foreground">Main Product Stock</span>
                    <Input
                      type="number"
                      min="0"
                      className="w-28 text-right h-9 font-semibold"
                      value={addStockTopLevel || ''}
                      onChange={(e) => setAddStockTopLevel(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setAddStockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddStockSubmit}
              disabled={addingStock}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {addingStock ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DatabaseZap className="mr-2 h-4 w-4" />
              )}
              Save Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4 pt-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
