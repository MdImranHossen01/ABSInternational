'use client';

import { useState, useEffect } from 'react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, Loader2, Sparkles, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';

const brandSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  slug: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      image: '',
      isActive: true,
    },
  });

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands?all=true');
      if (!response.ok) {
        toast.error(`Failed to fetch brands: ${response.status} ${response.statusText}`);
        return;
      }
      const data = await response.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const onSubmit = async (values: BrandFormValues) => {
    setSubmitting(true);
    try {
      const url = editingBrand
        ? `/api/brands/${editingBrand._id}`
        : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(editingBrand ? 'Brand updated successfully' : 'Brand created successfully');
        setOpen(false);
        setEditingBrand(null);
        form.reset();
        fetchBrands();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save brand');
      }
    } catch (error) {
      toast.error('Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    form.reset({
      name: brand.name,
      slug: brand.slug || '',
      image: brand.image || '',
      isActive: brand.isActive,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this brand!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00D1B2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 font-bold',
        cancelButton: 'rounded-lg px-4 py-2 font-bold',
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/brands/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Brand deleted successfully');
          fetchBrands();
        } else {
          toast.error('Failed to delete brand');
        }
      } catch (error) {
        toast.error('Failed to delete brand');
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Brands Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product manufacturers, authentic brands, and supplier lines.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBrand(null);
            form.reset({
              name: '',
              slug: '',
              image: '',
              isActive: true,
            });
            setOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      {/* Brands Table */}
      <div className="rounded-2xl border bg-card/60 backdrop-blur shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Brand Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No brands found. Click &quot;Add Brand&quot; to create your first brand.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand._id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    {brand.image ? (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden border bg-background">
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                        {brand.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {brand.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {brand.slug}
                  </TableCell>
                  <TableCell>
                    {brand.isActive ? (
                      <Badge className="bg-emerald-600/15 text-emerald-600 hover:bg-emerald-600/20 border-emerald-600/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                        className="h-8 px-2.5"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(brand._id)}
                        className="h-8 px-2.5"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Dialog for Add / Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
            <DialogDescription>
              {editingBrand ? 'Update brand details and logo.' : 'Enter the brand name and upload logo.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ABS Herbal Care" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. abs-herbal-care" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Logo (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value ? (
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden border bg-background group">
                            <Image
                              src={field.value}
                              alt="Brand Logo"
                              fill
                              className="object-contain p-1"
                            />
                            <button
                              type="button"
                              onClick={() => field.onChange('')}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <ImageUpload
                            onUpload={(url: string) => field.onChange(url)}
                            compact
                            aspect="square"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingBrand ? 'Save Changes' : 'Create Brand'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
