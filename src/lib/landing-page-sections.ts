export type SectionType = 
  | 'hero' 
  | 'product_showcase' 
  | 'features' 
  | 'testimonials' 
  | 'faq' 
  | 'video' 
  | 'order_form' 
  | 'content_block';

export interface SectionContent {
  [key: string]: any;
}

export interface SectionStyles {
  backgroundColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  [key: string]: any;
}

export interface LandingPageSection {
  id: string;
  type: SectionType;
  content: SectionContent;
  styles?: SectionStyles;
}

export interface SectionTemplate {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  defaultContent: SectionContent;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    description: 'Main banner with headline and CTA',
    icon: 'layout',
    defaultContent: {
      headline: 'Transform Your Health Naturally',
      subheadline: 'Discover the power of alternative medicine with our premium products.',
      ctaText: 'Shop Now',
      ctaLink: '#order',
      backgroundImage: '/assets/hero-placeholder.webp',
      overlayOpacity: 0.5,
    }
  },
  {
    type: 'product_showcase',
    label: 'Product Highlight',
    description: 'Detailed view of a single product',
    icon: 'shopping-bag',
    defaultContent: {
      productId: '',
      title: 'Premium Health Booster',
      price: 1250,
      salePrice: 990,
      description: 'Our most popular supplement for daily energy and immunity.',
      image: '/assets/product-placeholder.webp',
      benefits: ['100% Organic', 'No Side Effects', 'Fast Results'],
    }
  },
  {
    type: 'order_form',
    label: 'Direct Order Form',
    description: 'High-converting checkout form',
    icon: 'credit-card',
    defaultContent: {
      title: 'Fill out the form below to order',
      buttonText: 'Confirm Order',
      showQuantity: true,
      defaultQuantity: 1,
      paymentInstructions: 'Pay cash to the delivery agent upon receiving the package.',
    }
  },
  {
    type: 'features',
    label: 'Features Grid',
    description: 'Display benefits or features with icons',
    icon: 'grid',
    defaultContent: {
      title: 'Why Choose Us?',
      items: [
        { title: 'Natural Ingredients', description: 'We use 100% natural and organic ingredients.', icon: 'leaf' },
        { title: 'Fast Delivery', description: 'Home delivery within 24-48 hours nationwide.', icon: 'truck' },
        { title: 'Cash on Delivery', description: 'Pay cash conveniently after receiving your parcel.', icon: 'shield-check' },
      ]
    }
  },
  {
    type: 'video',
    label: 'Video Section',
    description: 'Embed a YouTube or Vimeo video',
    icon: 'play-circle',
    defaultContent: {
      title: 'Learn More About Our Products',
      videoUrl: '',
      thumbnail: '',
    }
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'What your customers say',
    icon: 'message-square',
    defaultContent: {
      title: 'What Our Customers Say',
      reviews: [
        { name: 'Arif Ahmed', role: 'Verified Customer', content: 'Outstanding product quality! I have been using it for 2 months and got fantastic results.', rating: 5 },
        { name: 'Sadia Islam', role: 'Homemaker', content: 'Very fast delivery. Product quality and packaging are truly authentic.', rating: 5 },
      ]
    }
  },
  {
    type: 'faq',
    label: 'FAQ Section',
    description: 'Frequently Asked Questions',
    icon: 'help-circle',
    defaultContent: {
      title: 'Frequently Asked Questions',
      items: [
        { question: 'How can I place an order?', answer: 'Fill out the order form at the bottom of the landing page or contact our support team.' },
        { question: 'What are the delivery charges?', answer: 'Inside Dhaka ৳60 and Outside Dhaka ৳120.' },
      ]
    }
  },
  {
    type: 'content_block',
    label: 'Rich Text Block',
    description: 'Add paragraphs, lists, and images',
    icon: 'file-text',
    defaultContent: {
      content: '',
    }
  }
];
