'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Filter,
  Search,
  X,
  ChevronDown,
  Sparkles,
  PackageSearch
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';

interface ShopCategory {
  _id: string;
  slug: string;
  name: string;
  parentCategory?: string | any;
  isActive: boolean;
}

interface ShopProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  createdAt: string;
  isPublished: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  ratings?: number;
  numReviews?: number;
  views?: number;
  totalSales?: number;
  images: string[];
  stock: number;
  categories?: any[];
  brand?: any;
}

interface ShopClientProps {
  initialProducts: ShopProduct[];
  initialCategories: ShopCategory[];
  searchParams?: any;
  cardStyle?: string;
}

export default function ShopClient({
  initialProducts,
  initialCategories,
  cardStyle
}: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products] = useState<ShopProduct[]>(initialProducts);
  const [categories] = useState<ShopCategory[]>(initialCategories);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const initialCategory = searchParams.get('category');
    if (!initialCategory) return [];
    const cat = initialCategories.find(c => c.slug === initialCategory || c._id === initialCategory);
    return [cat ? cat.slug : initialCategory];
  });

  const getParentId = useCallback((cat: any) => {
    if (!cat.parentCategory) return null;
    if (typeof cat.parentCategory === 'object') return cat.parentCategory._id;
    return cat.parentCategory;
  }, []);

  const getAncestorsAndSelf = useCallback((slugOrId: string, categoriesList: ShopCategory[]): string[] => {
    const toExpand: string[] = [];
    const cat = categoriesList.find(c => c.slug === slugOrId || c._id === slugOrId);
    if (cat) {
      toExpand.push(cat._id);
      const visited = new Set<string>([cat._id]);
      let parentId = getParentId(cat);
      while (parentId && !visited.has(parentId)) {
        visited.add(parentId);
        toExpand.push(parentId);
        const parentCat = categoriesList.find(c => c._id === parentId);
        parentId = parentCat ? getParentId(parentCat) : null;
      }
    }
    return toExpand;
  }, [getParentId]);

  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => {
    const initialCategory = searchParams.get('category');
    if (!initialCategory) return [];
    const toExpand: string[] = [];
    const cat = initialCategories.find(c => c.slug === initialCategory || c._id === initialCategory);
    if (cat) {
      toExpand.push(cat._id);
      const visited = new Set<string>([cat._id]);
      let parent = cat.parentCategory;
      let parentId = parent ? (typeof parent === 'object' ? parent._id : parent) : null;
      while (parentId && !visited.has(parentId)) {
        visited.add(parentId);
        toExpand.push(parentId);
        const parentCat = initialCategories.find(c => c._id === parentId);
        const p = parentCat?.parentCategory;
        parentId = p ? (typeof p === 'object' ? p._id : p) : null;
      }
    }
    return toExpand;
  });

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<string>(() => {
    const filter = searchParams.get('filter');
    if (filter === 'new' || filter === 'sale' || filter === 'featured' || filter === 'trending') return filter;
    const sort = searchParams.get('sort');
    if (sort === 'price-asc' || sort === 'price-desc') return sort;
    return 'all';
  });
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [showOnlyNew, setShowOnlyNew] = useState(searchParams.get('filter') === 'new');
  const [showOnlySale, setShowOnlySale] = useState(searchParams.get('filter') === 'sale');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(searchParams.get('filter') === 'featured');
  const [showOnlyTrending, setShowOnlyTrending] = useState(searchParams.get('filter') === 'trending');

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 20;

  const mainCategories = useMemo(() => {
    return categories.filter(c => !getParentId(c));
  }, [categories, getParentId]);

  const getSubcategories = useCallback((parentId: string) => {
    return categories.filter(c => getParentId(c) === parentId);
  }, [categories, getParentId]);

  // Track previous search params to sync state
  const [prevSearchParamsStr, setPrevSearchParamsStr] = useState(searchParams.toString());
  if (searchParams.toString() !== prevSearchParamsStr) {
    setPrevSearchParamsStr(searchParams.toString());
    const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
    const urlFilter = searchParams.get('filter');
    const urlSort = searchParams.get('sort');
    const expectedSort = (urlFilter && ['new', 'sale', 'featured', 'trending'].includes(urlFilter))
      ? urlFilter
      : (urlSort && ['price-asc', 'price-desc'].includes(urlSort))
        ? urlSort
        : 'all';
    if (expectedSort !== sortBy && (urlFilter || urlSort)) {
      setSortBy(expectedSort);
    }
    const urlCategory = searchParams.get('category');
    const resolvedCategorySlug = urlCategory
      ? (categories.find(c => c.slug === urlCategory || c._id === urlCategory)?.slug || urlCategory)
      : null;
    const newSelected = resolvedCategorySlug ? [resolvedCategorySlug] : [];
    if (JSON.stringify(newSelected) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(newSelected);
      if (resolvedCategorySlug) {
        const toExpand = getAncestorsAndSelf(resolvedCategorySlug, categories);
        if (toExpand.length > 0) {
          setExpandedCategories(prev => Array.from(new Set([...prev, ...toExpand])));
        }
      }
    }
    const urlPage = Number(searchParams.get('page')) || 1;
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
  }

  // Reset page when filters change
  const currentFiltersStr = JSON.stringify({
    selectedCategories,
    minPrice,
    maxPrice,
    sortBy,
    searchTerm,
    showOnlyNew,
    showOnlySale,
    showOnlyFeatured,
    showOnlyTrending
  });
  const [prevFiltersStr, setPrevFiltersStr] = useState(currentFiltersStr);
  if (currentFiltersStr !== prevFiltersStr) {
    setPrevFiltersStr(currentFiltersStr);
    setCurrentPage(1);
  }

  // Recursive descendant matching
  const expandedMatchingSlugs = useMemo(() => {
    if (selectedCategories.length === 0) return new Set<string>();

    const result = new Set<string>();

    const addWithChildren = (cat: ShopCategory) => {
      result.add(cat.slug);
      result.add(cat._id);
      const children = categories.filter(c => getParentId(c) === cat._id);
      children.forEach(addWithChildren);
    };

    selectedCategories.forEach(slugOrId => {
      result.add(slugOrId);
      const matched = categories.find(c => c.slug === slugOrId || c._id === slugOrId);
      if (matched) {
        addWithChildren(matched);
      }
    });

    return result;
  }, [selectedCategories, categories, getParentId]);

  const getTrendingScore = (p: ShopProduct) => {
    return ((p.ratings || 0) * 10) + ((p.numReviews || 0) * 5) + ((p.totalSales || 0) * 2) + (p.views || 0);
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 ||
        (p.categories ?? []).some((c) => expandedMatchingSlugs.has(c.slug || '') || expandedMatchingSlugs.has(c._id || ''));
      const price = p.salePrice ?? p.price;
      const min = minPrice !== '' ? Number(minPrice) : 0;
      const max = maxPrice !== '' ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      const isNew = p.isNewArrival === true;
      const isSale = p.isFlashSale === true || (p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price);
      const isFeatured = p.isFeatured === true;
      const isTrending = getTrendingScore(p) >= 20;

      const matchesNewArrival = (!showOnlyNew && sortBy !== 'new') || isNew;
      const matchesSale = (!showOnlySale && sortBy !== 'sale') || isSale;
      const matchesFeatured = (!showOnlyFeatured && sortBy !== 'featured') || isFeatured;
      const matchesTrending = (!showOnlyTrending && sortBy !== 'trending') || isTrending;

      return matchesSearch && matchesCategory && matchesPrice && matchesNewArrival && matchesSale && matchesFeatured && matchesTrending;
    })
    .sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'trending' || showOnlyTrending) {
        return getTrendingScore(b) - getTrendingScore(a);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (products.length > 0) {
    const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }

  // Sync URL when page changes
  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || 1;
    if (urlPage !== currentPage) {
      const params = new URLSearchParams(searchParams.toString());
      if (currentPage > 1) {
        params.set('page', currentPage.toString());
      } else {
        params.delete('page');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [currentPage, searchParams, pathname, router]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCategory = (catOrSlug: ShopCategory | string) => {
    const catObj = typeof catOrSlug === 'string'
      ? categories.find(c => c.slug === catOrSlug || c._id === catOrSlug)
      : catOrSlug;
    const normalizedSlug = catObj ? catObj.slug : (typeof catOrSlug === 'string' ? catOrSlug : catOrSlug.slug);

    const isSelected = selectedCategories.includes(normalizedSlug) ||
      (catObj ? (selectedCategories.includes(catObj._id) || selectedCategories.includes(catObj.slug)) : false);

    if (isSelected) {
      setSelectedCategories(prev => prev.filter(s =>
        s !== normalizedSlug && (!catObj || (s !== catObj._id && s !== catObj.slug))
      ));
    } else {
      setSelectedCategories(prev => [...prev, normalizedSlug]);
      if (catObj) {
        const toExpand = getAncestorsAndSelf(catObj.slug, categories);
        if (toExpand.length > 0) {
          setExpandedCategories(prev => Array.from(new Set([...prev, ...toExpand])));
        }
      }
    }
  };

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setSortBy('all');
    setShowOnlyNew(false);
    setShowOnlySale(false);
    setShowOnlyFeatured(false);
    setShowOnlyTrending(false);
  };

  const renderSidebar = () => (
    <div className="space-y-6">
      {/* Categories Nested Tree */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Categories</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 text-sm">
          {mainCategories.map((mainCat) => {
            const subs = getSubcategories(mainCat._id);
            const hasSubs = subs.length > 0;
            const isMainSelected = selectedCategories.includes(mainCat.slug) || selectedCategories.includes(mainCat._id);
            const isMainExpanded = expandedCategories.includes(mainCat._id);

            return (
              <div key={mainCat._id} className="space-y-1">
                <div className="flex items-center justify-between hover:bg-muted/50 p-1.5 rounded-lg transition-colors">
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <Checkbox
                      id={mainCat._id}
                      checked={isMainSelected}
                      onCheckedChange={() => toggleCategory(mainCat)}
                    />
                    <Label
                      htmlFor={mainCat._id}
                      className="text-sm font-semibold leading-none cursor-pointer hover:text-primary transition-colors truncate"
                    >
                      {mainCat.name}
                    </Label>
                  </div>
                  {hasSubs && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(mainCat._id, e)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-transform"
                      aria-label={`Toggle ${mainCat.name} subcategories`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isMainExpanded ? 'rotate-180 text-primary' : 'rotate-0'
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Level 2 Subcategories */}
                {hasSubs && isMainExpanded && (
                  <div className="ml-4 pl-2.5 border-l-2 border-primary/20 space-y-1 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {subs.map((subCat) => {
                      const children = getSubcategories(subCat._id);
                      const hasChildren = children.length > 0;
                      const isSubSelected = selectedCategories.includes(subCat.slug) || selectedCategories.includes(subCat._id);
                      const isSubExpanded = expandedCategories.includes(subCat._id);

                      return (
                        <div key={subCat._id} className="space-y-1">
                          <div className="flex items-center justify-between hover:bg-muted/40 p-1 rounded-md transition-colors">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <Checkbox
                                id={subCat._id}
                                checked={isSubSelected}
                                onCheckedChange={() => toggleCategory(subCat)}
                              />
                              <Label
                                htmlFor={subCat._id}
                                className="text-xs font-medium leading-none cursor-pointer hover:text-primary transition-colors truncate"
                              >
                                {subCat.name}
                              </Label>
                            </div>
                            {hasChildren && (
                              <button
                                type="button"
                                onClick={(e) => toggleExpand(subCat._id, e)}
                                className="p-0.5 text-muted-foreground hover:text-foreground"
                                aria-label={`Toggle ${subCat.name} child categories`}
                              >
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                    isSubExpanded ? 'rotate-180 text-primary' : 'rotate-0'
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Level 3 Child Categories */}
                          {hasChildren && isSubExpanded && (
                            <div className="ml-3.5 pl-2 border-l border-primary/30 space-y-0.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              {children.map((childCat) => {
                                const isChildSelected = selectedCategories.includes(childCat.slug) || selectedCategories.includes(childCat._id);

                                return (
                                  <div key={childCat._id} className="flex items-center space-x-2 p-1 hover:bg-muted/30 rounded">
                                    <Checkbox
                                      id={childCat._id}
                                      checked={isChildSelected}
                                      onCheckedChange={() => toggleCategory(childCat)}
                                    />
                                    <Label
                                      htmlFor={childCat._id}
                                      className="text-[11px] text-muted-foreground leading-none cursor-pointer hover:text-primary transition-colors truncate"
                                    >
                                      {childCat.name}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Status Filters */}
      <div className="border-t pt-5">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-foreground">Filter by Status</h3>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="filter-sale"
              checked={showOnlySale || sortBy === 'sale'}
              onCheckedChange={(checked) => {
                setShowOnlySale(!!checked);
                if (checked) setSortBy('sale');
                else if (sortBy === 'sale') setSortBy('all');
              }}
            />
            <Label htmlFor="filter-sale" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
              <span>Flash Sale Offers</span>
            </Label>
          </div>

          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="filter-new"
              checked={showOnlyNew || sortBy === 'new'}
              onCheckedChange={(checked) => {
                setShowOnlyNew(!!checked);
                if (checked) setSortBy('new');
                else if (sortBy === 'new') setSortBy('all');
              }}
            />
            <Label htmlFor="filter-new" className="text-xs font-medium cursor-pointer">
              New Arrivals
            </Label>
          </div>

          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="filter-featured"
              checked={showOnlyFeatured || sortBy === 'featured'}
              onCheckedChange={(checked) => {
                setShowOnlyFeatured(!!checked);
                if (checked) setSortBy('featured');
                else if (sortBy === 'featured') setSortBy('all');
              }}
            />
            <Label htmlFor="filter-featured" className="text-xs font-medium cursor-pointer">
              Featured Collections
            </Label>
          </div>

          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="filter-trending"
              checked={showOnlyTrending || sortBy === 'trending'}
              onCheckedChange={(checked) => {
                setShowOnlyTrending(!!checked);
                if (checked) setSortBy('trending');
                else if (sortBy === 'trending') setSortBy('all');
              }}
            />
            <Label htmlFor="filter-trending" className="text-xs font-medium cursor-pointer">
              Trending Products
            </Label>
          </div>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="border-t pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Price (BDT)</h3>
          {(minPrice !== '' || maxPrice !== '') && (
            <button
              onClick={() => {
                setMinPrice('');
                setMaxPrice('');
              }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">৳</span>
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="pl-6 text-xs h-9"
            />
          </div>
          <span className="text-muted-foreground text-xs font-bold">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">৳</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="pl-6 text-xs h-9"
            />
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full text-xs font-semibold" onClick={clearFilters}>
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-0 py-8 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block sticky top-24 self-start h-fit max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          {renderSidebar()}
        </aside>

        {/* Main Products Content */}
        <div className="flex-1 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-5">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden flex items-center gap-1.5 h-10 px-4">
                    <Filter className="h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-6 overflow-y-auto">
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle className="text-lg font-bold">Filter Products</SheetTitle>
                  </SheetHeader>
                  {renderSidebar()}
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={(val) => { if (val) setSortBy(val); }}>
                <SelectTrigger className="w-full sm:w-[200px] h-10">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="new">New Arrivals</SelectItem>
                  <SelectItem value="trending">Trending Products</SelectItem>
                  <SelectItem value="sale">Flash Sale</SelectItem>
                  <SelectItem value="featured">Featured Products</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filteredProducts.length === 0
                ? 'No products found'
                : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredProducts.length)} of ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
            </p>
          </div>

          {/* Active Filter Badges */}
          {(selectedCategories.length > 0 || searchTerm || minPrice !== '' || maxPrice !== '' || sortBy !== 'all' || showOnlyNew || showOnlySale || showOnlyFeatured || showOnlyTrending) && (
            <div className="flex flex-wrap gap-2 items-center pt-1">
              <span className="text-xs font-bold uppercase text-muted-foreground mr-1">Active Filters:</span>
              {selectedCategories.map(cat => {
                const categoryName = categories.find(c => c.slug === cat || c._id === cat)?.name || cat;
                return (
                  <Badge key={cat} variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                    <span>{categoryName}</span>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                      aria-label={`Remove ${categoryName} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              {searchTerm && (
                <Badge variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                  <span>Search: {searchTerm}</span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(minPrice !== '' || maxPrice !== '') && (
                <Badge variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                  <span>Price: ৳{minPrice || '0'} - ৳{maxPrice || '∞'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                    aria-label="Clear price filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(showOnlyNew || sortBy === 'new') && (
                <Badge variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                  <span>New Arrivals</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOnlyNew(false);
                      if (sortBy === 'new') setSortBy('all');
                    }}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                    aria-label="Remove new filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(showOnlySale || sortBy === 'sale') && (
                <Badge variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                  <span>Flash Sale</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOnlySale(false);
                      if (sortBy === 'sale') setSortBy('all');
                    }}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                    aria-label="Remove sale filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(showOnlyFeatured || sortBy === 'featured') && (
                <Badge variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                  <span>Featured</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOnlyFeatured(false);
                      if (sortBy === 'featured') setSortBy('all');
                    }}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                    aria-label="Remove featured filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(showOnlyTrending || sortBy === 'trending') && (
                <Badge variant="secondary" className="gap-1 rounded-full pl-3 pr-1 py-1 flex items-center text-xs">
                  <span>Trending</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOnlyTrending(false);
                      if (sortBy === 'trending') setSortBy('all');
                    }}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                    aria-label="Remove trending filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-primary font-bold hover:underline ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Pure Product Grid (No Grid/List View Clutter) */}
          {paginatedProducts.length === 0 ? (
            <div className="p-16 border rounded-2xl bg-card/50 text-center space-y-4">
              <PackageSearch className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">No matching products found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Try changing your category filters, price range, or clearing your search keywords.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product as any}
                  style={cardStyle}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-8 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
