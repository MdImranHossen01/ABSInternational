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
    description: '১০০% খাঁটি এবং অর্গানিক অশ্বগন্ধা রুট পাউডার। স্ট্রেস ও ক্লান্তি দূর করে শরীরের স্বাভাবিক রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি এবং ঘুমের মান উন্নত করতে সহায়ক। সম্পূর্ণ কেমিক্যাল ও প্রিজারভেটিভ মুক্ত।',
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
    description: 'সুন্দরবনের গভীর জঙ্গল থেকে সংগৃহীত ১০০% বিশুদ্ধ ও প্রাকৃতিক খলিসা ফুলের মধু। অ্যান্টিঅক্সিডেন্ট এবং প্রাকৃতিক খনিজ উপাদানে ভরপুর, যা দৈনিক শক্তি যোগাতে ও ঠান্ডা-কাশি প্রতিরোধে কার্যকর।',
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
    description: 'বিশুদ্ধ জাফরান ও ২৬টি ভেষজ উপাদানে প্রস্তুত ঐতিহ্যবাহী কুমকুমাদি ফেস সিরাম। ত্বকের উজ্জ্বলতা বৃদ্ধি করে, মেছতা ও ডার্ক স্পট দূর করে প্রাকৃতিকভাবে ত্বককে কোমল ও লাবণ্যময় করে তোলে।',
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
    description: 'প্রথম কোল্ড প্রেস পদ্ধতিতে তৈরি শতভাগ খাঁটি কালোজিরা তেল। সকল রোগের মহৌষধ হিসেবে পরিচিত কালোজিরা তেল রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি, চুল পড়া রোধ ও ত্বকের যত্নে অত্যন্ত কার্যকরী।',
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
    description: 'প্রকৃতির অন্যতম পুষ্টিকর সুপারফুড স্পিরুলিনা। এতে রয়েছে উচ্চমাত্রার প্রোটিন, ভিটামিন বি-কমপ্লেক্স ও আয়রন যা শারীরিক দুর্বলতা দূর করে মেটাবলিজম ও কর্মক্ষমতা বাড়াতে সহায়তা করে।',
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
    description: 'ভৃঙ্গরাজ, ব্রাহ্মী, আমলকী ও তিল তেলের সমন্বয়ে প্রস্তুত মহা ভৃঙ্গরাজ তৈল। চুলের গোড়া শক্ত করে অতিরিক্ত চুল পড়া বন্ধ করে এবং নতুন চুল গজাতে সহায়তা করে। মাথার তালুর খুশকি ও চুলকানি দূর করে।',
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
    description: 'খাঁটি চন্দন ও কাশ্মীরি জাফরানের মিশ্রণে তৈরি প্রিমিয়াম ফেসপ্যাক। রোদে পোড়া দাগ (সানট্যান) দূর করে ত্বককে মুহূর্তেই ফ্রেশ, মসৃণ ও উজ্জ্বল করে তোলে। সব ধরনের ত্বকে ব্যবহার উপযোগী।',
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
    description: 'মিরাকল ট্রি হিসেবে পরিচিত সজিনা পাতার প্রিমিয়াম পাউডার। এতে দুধের চেয়ে ৪ গুণ ক্যালসিয়াম এবং কলার চেয়ে ৩ গুণ পটাশিয়াম রয়েছে। ডায়াবেটিস নিয়ন্ত্রণ ও রক্তচাপ স্বাভাবিক রাখতে অত্যন্ত উপকারী।',
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
    description: 'নিমের অ্যান্টি-ব্যাকটেরিয়াল এবং তুলসীর অ্যান্টি-অক্সিডেন্ট গুণে সমৃদ্ধ হ্যান্ডমেড সোপ। ব্রণের জীবাণু ধ্বংস করে ত্বককে গভীর থেকে পরিষ্কার ও স্বাস্থ্যোজ্জ্বল রাখে।',
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
    description: 'তাজা গোলাপের পাপড়ি থেকে স্টিম ডিস্টিলেশন প্রক্রিয়ায় প্রস্তুত ১০০% পিওর রোজ ওয়াটার। ত্বকের পিএইচ লেভেল ব্যালান্স করে পোরস সঙ্কুচিত করে এবং প্রাকৃতিক আর্দ্রতা ধরে রাখে।',
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
    description: 'প্রাকৃতিক জবা ফুলের শুকনো পাপড়ি দিয়ে তৈরি সুস্বাদু ও রিফ্রেশিং রেড টি। এটি ভিটামিন সি এবং অ্যান্টিঅক্সিডেন্টে ভরপুর, যা উচ্চ রক্তচাপ নিয়ন্ত্রণ ও ওজন কমাতে সাহায্য করে।',
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
    description: 'লাল পেঁয়াজের নির্যাস ও কালোজিরা সমৃদ্ধ নন-স্টিকি হেয়ার সিরাম। চুলের ভাঙন রোধ করে, ফ্রিজি চুলকে সিল্কি ও উজ্জ্বল করে এবং চুল পড়া দ্রুত নিয়ন্ত্রণ করে।',
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
    description: 'ক্যাফেইন-মুক্ত প্রিমিয়াম ক্যামোমাইল ফুল চা। রাতের অনিদ্রা ও মানসিক ক্লান্তি দূর করে গভীর ও প্রশান্তিদায়ক ঘুম নিশ্চিত করতে জাদুকরী ভূমিকা পালন করে।',
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
    description: 'গিলয় ও নিমের অ্যান্টি-টক্সিন সংমিশ্রণ যা রক্ত পরিশোধিত করে, লিভার ডিটক্সিফাই করে এবং ক্রনিক জ্বর ও ত্বকের অ্যালার্জি প্রতিরোধে দারুণ কার্যকরী।',
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
    description: 'জবা ও শিকাকাই এর সমন্বয়ে তৈরি সম্পূর্ণ প্রাকৃতিক হেয়ার প্যাক। চুলের রুক্ষতা দূর করে ডিপ কন্ডিশনিং প্রদান করে এবং চুলকে করে তোলে বাউন্সি ও ঝলমলে।',
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
    description: 'কাশ্মীরি গ্রিন টি, এলাচ, দারুচিনি ও জাফরানের সমন্বয়ে স্পেশাল কাহওয়া ব্লেন্ড। মেটাবলিজম বৃদ্ধি করে মেদ কমাতে এবং হজম প্রক্রিয়া সক্রিয় রাখতে অত্যন্ত উপাদেয়।',
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
    description: 'লেমনগ্রাস ও পুদিনা পাতার তরতাজা সুবাসযুক্ত ভেষজ পানীয়। এটি শরীরের ক্লান্তি নিমিষেই দূর করে এবং সতেজ অনুভূতি এনে দেয়।',
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
    description: 'আমলকী, হরিতকী ও বহেরা—এই তিন ফলের নিখুঁত মিশ্রণে প্রস্তুত ত্রিফলা ট্যাবলেট। দীর্ঘমেয়াদী কোষ্ঠকাঠিন্য ও গ্যাস্ট্রিকের সমস্যা থেকে স্থায়ী স্বস্তি দিতে পরীক্ষিত সমাধান।',
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
    description: 'কৃষ্ণ তুলসী ও আদার কার্যকরী ফর্মুলা যা ঋতু পরিবর্তনের সর্দি, হাঁচি ও গলার অস্বস্তি দূর করে ফুসফুসের কার্যক্ষমতা উন্নত করে।',
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
    description: 'কেমিক্যাল, অ্যামোনিয়া ও পি-পি-ডি মুক্ত শতভাগ প্রাকৃতিক মেহেদি ও নীল পাতার হেয়ার কালার কিট। সাদা চুলকে কোনো পার্শ্বপ্রতিক্রিয়া ছাড়াই ন্যাচারাল কালো বা গাঢ় বাদামী রঙ দেয়।',
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
    description: 'ফ্ল্যাশ সেল অফার! ভৃঙ্গরাজ ও আমলকী এক্সট্র্যাক্ট সমৃদ্ধ হেয়ার অয়েল। চুলের গোড়ায় পুষ্টি যুগিয়ে অকালে চুল পাকা ও চুল পড়া বন্ধ করতে অত্যন্ত কার্যকরী।',
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
    description: 'টি ট্রি অয়েল ও নিম সমৃদ্ধ সালফেট-মুক্ত অ্যান্টি-ড্যানড্রাফ শ্যাম্পু। প্রথম ব্যবহার থেকেই খুশকির কারণ ছত্রাক দূর করে এবং মাথার ত্বক পরিষ্কার ও চুলকে প্রাণবন্ত রাখে।',
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
    description: 'কাঁচা হলুদ ও নিমের কার্যকরী ফেসওয়াশ যা ত্বকের গভীর থেকে ধুলোবালি ও অতিরিক্ত তেল দূর করে ব্রণের উপদ্রব নিয়ন্ত্রণ করে। ত্বককে রাখে আর্দ্র ও ফ্রেশ।',
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
    description: '৪০টিরও বেশি ভেষজ উপাদান এবং খাঁটি গাওয়া ঘিয়ে প্রস্তুত স্পেশাল চ্যবনপ্রাশ। শিশু ও বড়দের শারীরিক বলবৃদ্ধি, ফুসফুসের সুস্থতা ও দীর্ঘস্থায়ী শক্তি বৃদ্ধির অব্যর্থ দাওয়াই।',
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
    description: 'তুলসী, মধু ও বাসক পাতার সুষম সংমিশ্রণে তৈরি সম্পূর্ণ প্রাকৃতিক কাশির সিরাপ। কোনো প্রকার তন্দ্রাচ্ছন্নতা বা পার্শ্বপ্রতিক্রিয়া ছাড়াই শুকনো ও কফযুক্ত কাশি নিরাময় করে।',
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
    description: 'ফ্ল্যাশ সেল লিমিটেড অফার! প্রিমিয়াম অশ্বগন্ধা নির্যাস যা দ্রুত মানসিক অবসাদ কমায়, টেস্টোস্টেরন লেভেল ও শক্তি বৃদ্ধিতে সহায়তা করে।',
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
    description: '২০০ মিলি ফ্যামিলি প্যাক ভার্জিন কালোজিরা তেল। প্রিমিয়াম সিড থেকে সংগৃহীত। ফ্ল্যাশ সেলে পাচ্ছেন বিশেষ সাশ্রয়ী মূল্যে।',
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
    description: 'গোল্ডেন টারমারিক ও নিমের ফোমিং ক্লিনজার। ত্বকের গভীর থেকে ময়লা অপসারণ করে নিখুঁত প্রাকৃতিক উজ্জ্বলতা এনে দেয়।',
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
    description: '১ কেজি স্পেশাল ফ্যামিলি জার সুন্দরবনের প্রাকৃতিক মধু। ফ্ল্যাশ সেলে থাকছে অবিশ্বাস্য ডিসকাউন্ট! পরিবারের সবার জন্য স্বাস্থ্যকর প্রাকৃতিক সুইটনার।',
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
    description: '১৫ মিলি ট্রাভেল সাইজ কুমকুমাদি ডে ইলিক্সির। ত্বকের বলিরেখা দূর করে ত্বককে তারুণ্যদীপ্ত ও গ্লোয়িং রাখতে বিশেষ ফ্ল্যাশ ডিল।',
    tags: ['flash-sale', 'kumkumadi', 'face-elixir', 'anti-aging'],
    attributes: [{ key: 'Volume', value: '15ml' }, { key: 'Deal', value: 'Exclusive Flash Sale' }]
  }
];

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
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
