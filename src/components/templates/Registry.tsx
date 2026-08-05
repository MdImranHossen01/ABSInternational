import NavbarV1 from './navbars/NavbarV1';

export const NavbarSelector = ({ style }: { style: string }) => {
  return <NavbarV1 />;
};

// --- PRODUCT CARDS ---
import ProductCardV1 from './product-cards/ProductCardV1';

export const ProductCardSelector = ({ style, product, isFlashSale, priority, layout }: { style: string, product: any, isFlashSale?: boolean, priority?: boolean, layout?: string }) => {
  return <ProductCardV1 product={product} isFlashSale={isFlashSale} />;
};

// --- CATEGORIES ---
import CategoryV1 from './categories/CategoryV1';

export const CategorySelector = ({ style, categories }: { style: string, categories: any[] }) => {
  return <CategoryV1 categories={categories} />;
};
