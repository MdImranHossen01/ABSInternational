import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Category Schema & Model
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    image: { type: String },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Product Schema & Model
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    purchasePrice: { type: Number },
    discountRate: { type: Number },
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, required: true, default: 50 },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: String }],
    images: [{ type: String }],
    attributes: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    ratings: { type: Number, default: 4.8 },
    numReviews: { type: Number, default: 24 },
    views: { type: Number, default: 120 },
    totalSales: { type: Number, default: 35 },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const categoriesData = [
  { name: 'Beauty & Skincare', slug: 'beauty-skincare', image: '/assets/images/cagetory/beauty_product.d111272d.webp' },
  { name: 'Health & Herbal Wellness', slug: 'health-herbal-wellness', image: '/assets/images/cagetory/grocery.2792c849.webp' },
  { name: 'Men Fashion & Grooming', slug: 'men-fashion-grooming', image: '/assets/images/cagetory/mens_clothing.350a3497.webp' },
  { name: 'Smart Gadgets & Electronics', slug: 'smart-gadgets-electronics', image: '/assets/images/cagetory/gadget.2b0fcbdc.webp' },
  { name: 'Smart Mobile & Accessories', slug: 'smart-mobile-accessories', image: '/assets/images/cagetory/mobile.33aae6fe.webp' },
  { name: 'Watches & Luxury Timepieces', slug: 'watches-luxury-timepieces', image: '/assets/images/cagetory/watch.9755a6ec.webp' },
  { name: 'Bags & Leather Backpacks', slug: 'bags-leather-backpacks', image: '/assets/images/cagetory/handbag.b457671e.webp' },
  { name: 'Jewelry & Necklaces', slug: 'jewelry-necklaces', image: '/assets/images/cagetory/necklace.374b9804.webp' },
  { name: 'Premium Footwear & Shoes', slug: 'premium-footwear-shoes', image: '/assets/images/cagetory/shoes.de4e3d85.webp' },
  { name: 'Kids Shoes & Footwear', slug: 'kids-shoes-footwear', image: '/assets/images/cagetory/child-shoe.213d9bc4.webp' },
  { name: 'Premium Eyewear & Sunglasses', slug: 'premium-eyewear-sunglasses', image: '/assets/images/cagetory/sunglass.f5333693.webp' },
  { name: 'Sportswear & Fitness Gear', slug: 'sportswear-fitness-gear', image: '/assets/images/cagetory/sport.9e051f78.webp' },
  { name: 'Travel Bags & Luggage', slug: 'travel-bags-luggage', image: '/assets/images/cagetory/travel.04b6513f.webp' },
  { name: 'Casual T-Shirts', slug: 'casual-t-shirts', image: '/assets/images/cagetory/t-shirt.webp' },
  { name: 'Executive Polo Shirts', slug: 'executive-polo-shirts', image: '/assets/images/cagetory/polo-shirt.webp' },
  { name: 'Formal & Semi-Formal Shirts', slug: 'formal-semi-formal-shirts', image: '/assets/images/cagetory/shirt.webp' },
  { name: 'Hoodies & Winter Collection', slug: 'hoodies-winter-collection', image: '/assets/images/cagetory/hoodie.webp' },
  { name: 'Trousers & Chino Pants', slug: 'trousers-chino-pants', image: '/assets/images/cagetory/pants.webp' },
  { name: 'All Lifestyle Clothing', slug: 'all-lifestyle-clothing', image: '/assets/images/cagetory/clothing.9917b6ae.webp' },
];

const productsData = [
  // 10 Featured Products
  {
    name: 'Organic Ashwagandha Root Powder (200g)',
    slug: 'organic-ashwagandha-root-powder-200g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/organic_ashwagandha_powder.webp',
    price: 650,
    salePrice: 520,
    purchasePrice: 350,
    stock: 85,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: '100% pure and organic Ashwagandha root powder. Helps reduce stress, fatigue, and supports immune system and quality sleep. Completely free of chemicals and preservatives.',
    tags: ['ashwagandha', 'herbal', 'wellness', 'organic', 'immunity'],
    attributes: [{ key: 'Weight', value: '200g' }, { key: 'Form', value: 'Powder' }, { key: 'Origin', value: 'Natural Organic' }]
  },
  {
    name: 'Sundarban Raw Natural Honey (500g)',
    slug: 'sundarban-raw-natural-honey-500g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/sundarban_honey.webp',
    price: 850,
    salePrice: 720,
    purchasePrice: 480,
    stock: 120,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: '100% pure and raw forest honey harvested directly from the deep mangrove forests of Sundarbans. Packed with antioxidants and essential minerals for daily vitality.',
    tags: ['honey', 'sundarban', 'pure', 'organic', 'natural'],
    attributes: [{ key: 'Weight', value: '500g' }, { key: 'Type', value: 'Raw Forest Honey' }]
  },
  {
    name: 'Kumkumadi Miraculous Beauty Face Serum (30ml)',
    slug: 'kumkumadi-miraculous-beauty-face-serum-30ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/kumkumadi_face_serum.webp',
    price: 1250,
    salePrice: 990,
    purchasePrice: 650,
    stock: 60,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: 'Traditional Kumkumadi face serum crafted with pure Kashmiri saffron and 26 revitalizing herbs. Boosts skin radiance, reduces blemishes, and restores natural glow.',
    tags: ['kumkumadi', 'face-serum', 'beauty', 'skincare', 'glowing'],
    attributes: [{ key: 'Volume', value: '30ml' }, { key: 'Skin Type', value: 'All Skin Types' }]
  },
  {
    name: 'Pure Cold Pressed Kalonji Black Seed Oil (100ml)',
    slug: 'pure-cold-pressed-kalonji-black-seed-oil-100ml',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/kalonji_black_seed_oil.webp',
    price: 450,
    salePrice: 380,
    purchasePrice: 220,
    stock: 150,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: '100% pure cold-pressed black seed (Kalonji) oil. Renowned as a versatile natural remedy for immunity, hair health, and nourished skin.',
    tags: ['kalonji', 'black-seed', 'oil', 'herbal', 'immunity'],
    attributes: [{ key: 'Volume', value: '100ml' }, { key: 'Extraction', value: 'Cold Pressed 100% Pure' }]
  },
  {
    name: 'Organic Spirulina Superfood Capsules (60 Caps)',
    slug: 'organic-spirulina-superfood-capsules-60-caps',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/organic_spirulina_capsules.webp',
    price: 750,
    salePrice: 620,
    purchasePrice: 390,
    stock: 90,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: 'Nutrient-rich spirulina superfood capsules packed with plant-based protein, B-complex vitamins, and iron to elevate metabolism and daily endurance.',
    tags: ['spirulina', 'superfood', 'supplements', 'wellness'],
    attributes: [{ key: 'Quantity', value: '60 Capsules' }, { key: 'Dosage', value: '1-2 Caps Daily' }]
  },
  {
    name: 'Maha Bhringraj Taila Hair Fall Control (200ml)',
    slug: 'maha-bhringraj-taila-hair-fall-control-200ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/maha_bhringraj_taila.webp',
    price: 680,
    salePrice: 550,
    purchasePrice: 330,
    stock: 110,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: 'Ayurvedic Maha Bhringraj hair oil blended with Brahmi, Amla, and sesame oil. Strengthens hair roots, prevents premature hair fall, and supports hair density.',
    tags: ['bhringraj', 'hair-oil', 'hair-care', 'anti-hairfall'],
    attributes: [{ key: 'Volume', value: '200ml' }, { key: 'Target', value: 'Hair Fall & Regrowth' }]
  },
  {
    name: 'Sandalwood & Kashmiri Saffron Face Pack (100g)',
    slug: 'sandalwood-kashmiri-saffron-face-pack-100g',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/sandalwood_saffron_pack.webp',
    price: 580,
    salePrice: 460,
    purchasePrice: 280,
    stock: 95,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: 'Premium rejuvenating face pack enriched with pure sandalwood and Kashmiri saffron. Eliminates sun tan and restores skin brightness and smooth texture.',
    tags: ['sandalwood', 'saffron', 'face-pack', 'skin-brightening'],
    attributes: [{ key: 'Weight', value: '100g' }, { key: 'Usage', value: 'Twice Weekly' }]
  },
  {
    name: 'Moringa Superfood Leaf Powder (200g)',
    slug: 'moringa-superfood-leaf-powder-200g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/moringa_leaf_powder.webp',
    price: 480,
    salePrice: 390,
    purchasePrice: 240,
    stock: 140,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: 'Premium organic Moringa leaf powder containing high calcium, potassium, and vital nutrients. Supports healthy blood pressure, glucose balance, and vitality.',
    tags: ['moringa', 'superfood', 'health', 'organic-powder'],
    attributes: [{ key: 'Weight', value: '200g' }, { key: 'Grade', value: '100% Organic Fine Powder' }]
  },
  {
    name: 'Pure Ayurvedic Neem & Basil Cleansing Bar (125g)',
    slug: 'pure-ayurvedic-neem-basil-cleansing-bar-125g',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/neem_basil_soap.webp',
    price: 220,
    salePrice: 180,
    purchasePrice: 100,
    stock: 200,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: 'Handcrafted cleansing soap bar loaded with antibacterial neem and antioxidant tulsi. Purifies deep pores and keeps skin clear, healthy, and refreshed.',
    tags: ['soap', 'neem', 'basil', 'organic-soap', 'skincare'],
    attributes: [{ key: 'Weight', value: '125g' }, { key: 'Type', value: 'Handmade Herbal Soap' }]
  },
  {
    name: 'Natural Steam Distilled Rose Water Toner (120ml)',
    slug: 'natural-steam-distilled-rose-water-toner-120ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/rose_water_toner.webp',
    price: 360,
    salePrice: 290,
    purchasePrice: 160,
    stock: 130,
    isFeatured: true,
    isNewArrival: false,
    isFlashSale: false,
    description: '100% pure steam-distilled rose water toner. Balances skin pH levels, refines pores, and delivers long-lasting natural hydration.',
    tags: ['rose-water', 'toner', 'skincare', 'facial-mist'],
    attributes: [{ key: 'Volume', value: '120ml' }, { key: 'Purity', value: '100% Pure Distilled' }]
  },

  // 10 New Arrival Products
  {
    name: 'Organic Kashmiri Hibiscus Petals Herbal Tea (100g)',
    slug: 'organic-kashmiri-hibiscus-petals-herbal-tea-100g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/hibiscus_petals_tea.webp',
    price: 520,
    salePrice: 440,
    purchasePrice: 270,
    stock: 80,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Refreshing herbal red tea brewed from dried natural hibiscus petals. High in Vitamin C and antioxidants that support healthy metabolism and wellness.',
    tags: ['hibiscus-tea', 'herbal-tea', 'weight-loss', 'new-arrival'],
    attributes: [{ key: 'Weight', value: '100g' }, { key: 'Caffeine', value: 'Caffeine Free' }]
  },
  {
    name: 'Red Onion & Black Seed Active Hair Serum (50ml)',
    slug: 'red-onion-black-seed-active-hair-serum-50ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/onion_hair_serum.webp',
    price: 690,
    salePrice: 560,
    purchasePrice: 340,
    stock: 110,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Non-greasy active hair serum enriched with red onion extract and black seed oil. Protects from breakage and smoothens frizz for shiny, silky hair.',
    tags: ['onion-serum', 'hair-care', 'hair-growth', 'new-arrival'],
    attributes: [{ key: 'Volume', value: '50ml' }, { key: 'Finish', value: 'Non-Greasy Silk Finish' }]
  },
  {
    name: 'Pure Dried Egyptian Chamomile Whole Flowers (75g)',
    slug: 'pure-dried-egyptian-chamomile-whole-flowers-75g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/dried_chamomile_flowers.webp',
    price: 590,
    salePrice: 480,
    purchasePrice: 290,
    stock: 75,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Caffeine-free premium whole chamomile flower tea. Promotes calm, soothes evening tension, and supports deep, restful sleep.',
    tags: ['chamomile', 'sleep-tea', 'relaxation', 'herbal-tea', 'new-arrival'],
    attributes: [{ key: 'Weight', value: '75g' }, { key: 'Flavor', value: 'Floral & Sweet Apple Aroma' }]
  },
  {
    name: 'Organic Giloy & Fresh Neem Detox Juice (500ml)',
    slug: 'organic-giloy-fresh-neem-detox-juice-500ml',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/giloy_neem_juice.webp',
    price: 490,
    salePrice: 399,
    purchasePrice: 240,
    stock: 95,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Detoxifying herbal juice blend of Giloy and Neem. Purifies the bloodstream, cleanses the liver, and bolsters natural body defenses.',
    tags: ['giloy-juice', 'neem', 'detox', 'blood-purifier', 'new-arrival'],
    attributes: [{ key: 'Volume', value: '500ml' }, { key: 'Sugar Content', value: '0% Added Sugar' }]
  },
  {
    name: 'Ayurvedic Hibiscus & Shikakai Herbal Hair Pack (150g)',
    slug: 'ayurvedic-hibiscus-shikakai-herbal-hair-pack-150g',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/hibiscus_shikakai_hair_pack.webp',
    price: 420,
    salePrice: 340,
    purchasePrice: 200,
    stock: 120,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'All-natural herbal hair conditioning pack combining Hibiscus and Shikakai. Provides deep nourishment for soft, manageable, and voluminous hair.',
    tags: ['hair-pack', 'shikakai', 'hibiscus', 'hair-conditioning', 'new-arrival'],
    attributes: [{ key: 'Weight', value: '150g' }, { key: 'Form', value: 'Micro-fine Powder' }]
  },
  {
    name: 'Kashmiri Detox Kahwa Green Tea Blend (100g)',
    slug: 'kashmiri-detox-kahwa-green-tea-blend-100g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/detox_kahwa_tea.webp',
    price: 650,
    salePrice: 530,
    purchasePrice: 330,
    stock: 85,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Traditional Kashmiri Kahwa green tea blend infused with cardamom, cinnamon, and saffron. Helps boost metabolism and aids active digestion.',
    tags: ['kahwa', 'green-tea', 'detox-tea', 'weight-loss', 'new-arrival'],
    attributes: [{ key: 'Weight', value: '100g' }, { key: 'Ingredients', value: 'Green Tea, Saffron, Spices' }]
  },
  {
    name: 'Organic Lemongrass & Mint Herbal Infusion (80g)',
    slug: 'organic-lemongrass-mint-herbal-infusion-80g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/lemongrass_herbal_tea.webp',
    price: 390,
    salePrice: 310,
    purchasePrice: 180,
    stock: 100,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Invigorating herbal infusion of zesty lemongrass and cool mint leaves. Uplifts energy, calms digestion, and leaves a crisp refreshing finish.',
    tags: ['lemongrass', 'herbal-infusion', 'refreshing-tea', 'new-arrival'],
    attributes: [{ key: 'Weight', value: '80g' }, { key: 'Profile', value: 'Citrus & Minty' }]
  },
  {
    name: 'Triphala Churna Digestive Wellness Tablets (60 Tabs)',
    slug: 'triphala-churna-digestive-wellness-tablets-60-tabs',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/triphala_churna_tablets.webp',
    price: 460,
    salePrice: 370,
    purchasePrice: 220,
    stock: 130,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Digestive wellness formula combining Amla, Haritaki, and Bibhitaki. Supports gentle gastrointestinal cleansing and digestive regularity.',
    tags: ['triphala', 'digestion', 'ayurvedic-tablets', 'gut-health', 'new-arrival'],
    attributes: [{ key: 'Count', value: '60 Tablets' }, { key: 'Dosage', value: '2 Tablets Before Bed' }]
  },
  {
    name: 'Tulsi Holy Basil & Fresh Ginger Detox Tea (100g)',
    slug: 'tulsi-holy-basil-fresh-ginger-detox-tea-100g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/tulsi_ginger_tea.webp',
    price: 430,
    salePrice: 350,
    purchasePrice: 210,
    stock: 115,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: 'Therapeutic herbal tea featuring Krishna Tulsi and spicy ginger. Soothes the throat, supports healthy respiration, and strengthens vitality.',
    tags: ['tulsi-tea', 'ginger-tea', 'immunity', 'respiratory-health', 'new-arrival'],
    attributes: [{ key: 'Weight', value: '100g' }, { key: 'Type', value: 'Loose Herbal Leaf Tea' }]
  },
  {
    name: 'Organic Henna & Indigo Natural Hair Color Kit (200g)',
    slug: 'organic-henna-indigo-natural-hair-color-kit-200g',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/henna_indigo_set.webp',
    price: 550,
    salePrice: 440,
    purchasePrice: 260,
    stock: 90,
    isFeatured: false,
    isNewArrival: true,
    isFlashSale: false,
    description: '100% chemical, ammonia, and PPD-free natural hair color kit with organic Henna and Indigo leaf powders for healthy dark brown or black shades.',
    tags: ['henna', 'indigo', 'natural-hair-color', 'organic-dye', 'new-arrival'],
    attributes: [{ key: 'Net Weight', value: '100g Henna + 100g Indigo' }, { key: 'Chemicals', value: '0% Ammonia / PPD' }]
  },

  // 10 Flash Sale Products
  {
    name: 'Bhringraj & Amla Intensive Scalp Repair Hair Oil (150ml)',
    slug: 'bhringraj-amla-intensive-scalp-repair-hair-oil-150ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/bhringraj_amla_hair_oil.webp',
    price: 650,
    salePrice: 390,
    purchasePrice: 280,
    stock: 70,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Flash Sale Special! Intensive hair and scalp repair oil powered by Bhringraj and Amla extracts to nourish roots and counter premature thinning.',
    tags: ['flash-sale', 'hair-oil', 'bhringraj', 'amla-oil'],
    attributes: [{ key: 'Volume', value: '150ml' }, { key: 'Discount', value: '40% OFF Special' }]
  },
  {
    name: 'Ayurvedic Anti-Dandruff & Tea Tree Active Shampoo (200ml)',
    slug: 'ayurvedic-anti-dandruff-tea-tree-active-shampoo-200ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/anti_dandruff_shampoo.webp',
    price: 550,
    salePrice: 330,
    purchasePrice: 220,
    stock: 85,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Sulfate-free active anti-dandruff shampoo infused with organic tea tree and neem oil. Keeps scalp clear, fresh, and free from flake buildup.',
    tags: ['flash-sale', 'anti-dandruff', 'shampoo', 'hair-care'],
    attributes: [{ key: 'Volume', value: '200ml' }, { key: 'Free From', value: 'Sulfate & Paraben Free' }]
  },
  {
    name: 'Neem & Turmeric Clarifying Deep Face Wash (100ml)',
    slug: 'neem-turmeric-clarifying-deep-face-wash-100ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/neem_turmeric_wash.webp',
    price: 380,
    salePrice: 220,
    purchasePrice: 140,
    stock: 140,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Clarifying face wash combining fresh turmeric and neem. Purifies dirt, regulates excess sebum, and keeps skin smooth, hydrated, and clear.',
    tags: ['flash-sale', 'face-wash', 'neem-turmeric', 'acne-care'],
    attributes: [{ key: 'Volume', value: '100ml' }, { key: 'Special Price', value: 'Limited Time Deal' }]
  },
  {
    name: 'Premium Ayurvedic Chyawanprash Immunity Booster (500g)',
    slug: 'premium-ayurvedic-chyawanprash-immunity-booster-500g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/premium_chyawanprash.webp',
    price: 950,
    salePrice: 599,
    purchasePrice: 400,
    stock: 65,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Traditional immunity jam crafted with over 40 natural herbs and pure ghee. Rejuvenates physical strength, respiratory wellness, and daily stamina.',
    tags: ['flash-sale', 'chyawanprash', 'immunity', 'ayurvedic-jam'],
    attributes: [{ key: 'Weight', value: '500g' }, { key: 'Special Offer', value: 'Special Flash Discount' }]
  },
  {
    name: 'Herbal Tulsi & Honey Soothing Cough Syrup (100ml)',
    slug: 'herbal-tulsi-honey-soothing-cough-syrup-100ml',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/herbal_cough_syrup.webp',
    price: 250,
    salePrice: 150,
    purchasePrice: 90,
    stock: 160,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Natural soothing cough syrup formulated with tulsi, forest honey, and vasaka leaf. Provides quick, non-drowsy relief for throat irritation.',
    tags: ['flash-sale', 'cough-syrup', 'tulsi-honey', 'herbal-care'],
    attributes: [{ key: 'Volume', value: '100ml' }, { key: 'Non-Drowsy', value: '100% Non-Drowsy' }]
  },
  {
    name: 'Organic Ashwagandha Extract Vitality Blend (100g)',
    slug: 'organic-ashwagandha-extract-vitality-blend-100g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/organic_ashwagandha_powder.webp',
    price: 550,
    salePrice: 330,
    purchasePrice: 210,
    stock: 80,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Limited Flash Deal! Concentrated Ashwagandha vitality extract to ease fatigue, promote mental calmness, and optimize physical energy.',
    tags: ['flash-sale', 'ashwagandha', 'vitality', 'stress-relief'],
    attributes: [{ key: 'Weight', value: '100g' }, { key: 'Discount', value: '40% Flash Deal' }]
  },
  {
    name: 'Pure Cold-Pressed Virgin Black Seed Oil (200ml)',
    slug: 'pure-cold-pressed-virgin-black-seed-oil-200ml',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/kalonji_black_seed_oil.webp',
    price: 780,
    salePrice: 480,
    purchasePrice: 320,
    stock: 90,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: '200ml family value pack of pure cold-pressed virgin black seed oil. High-potency seeds extracted cleanly for complete daily wellness.',
    tags: ['flash-sale', 'kalonji-oil', 'black-seed', 'health-wellness'],
    attributes: [{ key: 'Volume', value: '200ml' }, { key: 'Extraction', value: 'Cold Pressed Virgin' }]
  },
  {
    name: 'Ayurvedic Golden Turmeric Face Cleanse Foam (150ml)',
    slug: 'ayurvedic-golden-turmeric-face-cleanse-foam-150ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/neem_turmeric_wash.webp',
    price: 490,
    salePrice: 295,
    purchasePrice: 180,
    stock: 100,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: 'Gentle foaming cleanser with golden turmeric and soothing neem. Cleanses pores deeply to reveal radiant, naturally balanced skin.',
    tags: ['flash-sale', 'turmeric-face-foam', 'beauty', 'skincare'],
    attributes: [{ key: 'Volume', value: '150ml' }, { key: 'Type', value: 'Foaming Pump Bottle' }]
  },
  {
    name: 'Wild Sundarban Floral Honey Family Jar (1000g)',
    slug: 'wild-sundarban-floral-honey-family-jar-1000g',
    categorySlug: 'health-herbal-wellness',
    image: '/assets/images/products/sundarban_honey.webp',
    price: 1600,
    salePrice: 999,
    purchasePrice: 650,
    stock: 50,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: '1kg family jar of raw natural Sundarban floral honey. Unprocessed and nutrient-dense, serving as a wholesome natural sweetener for your family.',
    tags: ['flash-sale', 'honey-1kg', 'sundarban', 'family-pack'],
    attributes: [{ key: 'Weight', value: '1kg (1000g)' }, { key: 'Guarantee', value: '100% Pure Raw Honey' }]
  },
  {
    name: 'Ayurvedic Kumkumadi Radiance Day Elixir (15ml)',
    slug: 'ayurvedic-kumkumadi-radiance-day-elixir-15ml',
    categorySlug: 'beauty-skincare',
    image: '/assets/images/products/kumkumadi_face_serum.webp',
    price: 850,
    salePrice: 499,
    purchasePrice: 320,
    stock: 65,
    isFeatured: false,
    isNewArrival: false,
    isFlashSale: true,
    description: '15ml travel-size Kumkumadi facial elixir. Targeted treatment to diminish fine lines and maintain youthful, luminous skin radiance.',
    tags: ['flash-sale', 'kumkumadi', 'face-elixir', 'anti-aging'],
    attributes: [{ key: 'Volume', value: '15ml' }, { key: 'Deal', value: 'Exclusive Flash Sale' }]
  }
];

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB successfully!');

    // 1. Seed Categories
    console.log('Seeding Categories...');
    const categoryMap = new Map();

    for (const cat of categoriesData) {
      const updated = await Category.findOneAndUpdate(
        { slug: cat.slug },
        {
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      categoryMap.set(cat.slug, updated._id);
      console.log(`✓ Category: ${cat.name}`);
    }

    // 2. Seed Products
    console.log('\nSeeding Products (10 Featured, 10 New Arrival, 10 Flash Sale)...');
    let count = 0;

    for (const prod of productsData) {
      const categoryId = categoryMap.get(prod.categorySlug);
      const discountRate = prod.salePrice ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100) : 0;
      const sku = `ABS-${prod.slug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await Product.findOneAndUpdate(
        { slug: prod.slug },
        {
          name: prod.name,
          slug: prod.slug,
          description: prod.description,
          price: prod.price,
          salePrice: prod.salePrice,
          purchasePrice: prod.purchasePrice,
          discountRate: discountRate,
          sku: sku,
          stock: prod.stock,
          categories: categoryId ? [categoryId] : [],
          tags: prod.tags,
          images: [prod.image],
          attributes: prod.attributes,
          isFeatured: prod.isFeatured,
          isNewArrival: prod.isNewArrival,
          isFlashSale: prod.isFlashSale,
          isPublished: true,
          ratings: 4.8 + Math.round(Math.random() * 2) / 10,
          numReviews: Math.floor(15 + Math.random() * 40),
          views: Math.floor(100 + Math.random() * 400),
          totalSales: Math.floor(20 + Math.random() * 80),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      count++;
      console.log(`✓ [${count}/30] Product: ${prod.name} (Featured: ${prod.isFeatured}, New: ${prod.isNewArrival}, Flash: ${prod.isFlashSale})`);
    }

    console.log('\n🎉 ALL CATEGORIES AND PRODUCTS SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
