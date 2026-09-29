'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Loader2, 
  CreditCard, 
  Plus, 
  Minus, 
  Globe, 
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { fbEvent } from '@/lib/fpixel';
import { ttEvent } from '@/lib/tiktok';

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name is required'),
  phone: z.string().trim().regex(/^(?:01)[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number'),
  street: z.string().trim().min(5, 'Delivery address is required'),
  deliveryArea: z.enum(['inside', 'outside'], {
    message: 'Select delivery area',
  }),
  paymentMethod: z.enum(['COD', 'Online', 'Manual'], {
    message: 'Select a payment method'
  }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

interface ProductSummaryCardProps {
  selectedProduct: {
    productId: string;
    productName: string;
    price: number;
    productImage: string;
  };
  basePrice: number;
  showQuantity: boolean;
  quantity: number;
  setQuantity: (q: number) => void;
}

function ProductSummaryCard({
  selectedProduct,
  basePrice,
  showQuantity,
  quantity,
  setQuantity
}: ProductSummaryCardProps) {
  return (
    <>
      <div className="flex gap-4">
        <div className="h-20 w-20 relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
          <Image 
            src={selectedProduct.productImage || '/assets/product-placeholder.webp'} 
            alt={selectedProduct.productName || 'Product'} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm leading-tight line-clamp-2">
            {selectedProduct.productName}
          </h3>
          <p className="text-primary font-black">৳{basePrice}</p>
        </div>
      </div>

      {showQuantity && (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-900/30 p-3 rounded-2xl border">
          <span className="font-bold text-xs text-slate-600 dark:text-zinc-400">Quantity</span>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 rounded-lg border bg-white hover:bg-slate-50 flex items-center justify-center font-bold"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-black text-slate-800 dark:text-zinc-100">{quantity}</span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 rounded-lg border bg-white hover:bg-slate-50 flex items-center justify-center font-bold"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface CouponAndBillBreakdownProps {
  couponCode: string;
  setCouponCode: (c: string) => void;
  appliedCoupon: string | null;
  applyingCoupon: boolean;
  applyCoupon: () => void;
  removeCoupon: () => void;
  itemsTotal: number;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  couponDiscount: number;
  freeDeliveryThreshold: number;
  finalTotal: number;
}

function CouponAndBillBreakdown({
  couponCode,
  setCouponCode,
  appliedCoupon,
  applyingCoupon,
  applyCoupon,
  removeCoupon,
  itemsTotal,
  deliveryCharge,
  isFreeDelivery,
  couponDiscount,
  freeDeliveryThreshold,
  finalTotal
}: CouponAndBillBreakdownProps) {
  return (
    <>
      {/* Coupon Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            disabled={!!appliedCoupon || applyingCoupon}
            className="h-10 text-xs rounded-xl"
          />
          {appliedCoupon ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={removeCoupon}
              className="h-10 px-3 rounded-xl"
            >
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={applyCoupon}
              disabled={applyingCoupon || !couponCode}
              className="h-10 px-4 rounded-xl"
            >
              {applyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
            </Button>
          )}
        </div>
        {appliedCoupon && (
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Coupon "{appliedCoupon}" active!
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-2 text-sm text-slate-600 dark:text-zinc-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-slate-800 dark:text-zinc-100">৳{itemsTotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span className={isFreeDelivery ? "text-green-600 font-black" : "font-bold text-slate-800 dark:text-zinc-100"}>
            {isFreeDelivery ? 'FREE' : `৳${deliveryCharge}`}
          </span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Coupon Discount</span>
            <span>- ৳{couponDiscount}</span>
          </div>
        )}
        {isFreeDelivery && (
          <p className="text-[10px] text-green-600 font-bold text-right -mt-1">
            Free shipping applied (Order ≥ ৳{freeDeliveryThreshold})
          </p>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between text-base font-black text-slate-900 dark:text-zinc-100 pt-2">
          <span>Total</span>
          <span className="text-primary text-xl">৳{finalTotal}</span>
        </div>
      </div>
    </>
  );
}

export default function OrderForm({ content, settings }: { content: any; settings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [isPendingOrderBlocked, setIsPendingOrderBlocked] = useState(false);
  
  // Quantity State
  const [quantity, setQuantity] = useState(content.defaultQuantity || 1);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Selected Product State (for pages with multiple products)
  const [selectedProduct, setSelectedProduct] = useState({
    productId: content.productId,
    productName: content.productName,
    price: content.price,
    productImage: content.productImage
  });

  useEffect(() => {
    setSelectedProduct({
      productId: content.productId,
      productName: content.productName,
      price: content.price,
      productImage: content.productImage
    });
  }, [content.productId, content.productName, content.price, content.productImage]);

  useEffect(() => {
    const handleProductSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSelectedProduct({
          productId: customEvent.detail.productId,
          productName: customEvent.detail.productName,
          price: customEvent.detail.price,
          productImage: customEvent.detail.productImage
        });
        setQuantity(content.defaultQuantity || 1);
      }
    };
    window.addEventListener('select-lp-product', handleProductSelect);
    return () => {
      window.removeEventListener('select-lp-product', handleProductSelect);
    };
  }, [content.defaultQuantity]);

  // Manual Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [manualDetails, setManualDetails] = useState({
    senderNumber: '',
    transactionId: ''
  });
  const [paymentDetailTab, setPaymentDetailTab] = useState<'phone' | 'trx'>('phone');

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      phone: '',
      street: '',
      deliveryArea: 'inside',
      paymentMethod: 'COD',
    },
  });

  const watchedPhone = form.watch('phone');
  const watchedFullName = form.watch('fullName');
  const watchedStreet = form.watch('street');
  const watchedDeliveryArea = form.watch('deliveryArea');

  // Reset manual payment details if payment method changes away from Manual
  useEffect(() => {
    const method = form.watch('paymentMethod');
    if (method !== 'Manual') {
      setSelectedMethod(null);
      setManualDetails({ senderNumber: '', transactionId: '' });
    }
  }, [form.watch('paymentMethod')]);

  // Check for pending order proactively when phone number is typed
  useEffect(() => {
    if (!watchedPhone || watchedPhone.trim().length < 11) {
      setIsPendingOrderBlocked(false);
      return;
    }

    const checkPendingOrder = async () => {
      try {
        const res = await fetch(`/api/orders/check-pending?phone=${encodeURIComponent(watchedPhone.trim())}`);
        if (res.ok) {
          const { hasPending } = await res.json();
          if (hasPending) {
            setIsPendingOrderBlocked(true);
            toast.error("You already have a pending order. Please wait for it to be confirmed before placing a new one.");
          } else {
            setIsPendingOrderBlocked(false);
          }
        }
      } catch (err) {
        console.error("Error checking pending order:", err);
      }
    };

    checkPendingOrder();
  }, [watchedPhone]);

  // Track InitiateCheckout
  const hasTrackedInitiate = useRef(false);
  useEffect(() => {
    if (!selectedProduct.productId || hasTrackedInitiate.current) return;
    if (!watchedPhone || watchedPhone.trim().length < 11 || !watchedFullName || watchedFullName.trim().length < 2) return;

    hasTrackedInitiate.current = true;

    const basePrice = selectedProduct.price || 0;
    const checkoutPayload = {
      content_ids: [selectedProduct.productId],
      content_type: 'product',
      value: basePrice * quantity,
      currency: 'BDT',
      num_items: 1,
      contents: [{
        id: selectedProduct.productId,
        quantity: quantity,
        item_price: basePrice
      }]
    };

    const initiateUserData = { em: '', ph: watchedPhone, country: 'bd' };

    fbEvent('InitiateCheckout', checkoutPayload, initiateUserData);
    ttEvent('InitiateCheckout', checkoutPayload, initiateUserData);
  }, [watchedPhone, watchedFullName, selectedProduct.productId, selectedProduct.price, quantity]);

  // Debounced sync of checkout info for abandoned carts tracking
  const submissionSucceededRef = useRef(false);
  useEffect(() => {
    if (!selectedProduct.productId || submissionSucceededRef.current) return;
    if (!watchedPhone || watchedPhone.trim().length < 11 || !watchedFullName || watchedFullName.trim().length < 2) return;

    const syncAbandonedCart = async () => {
      try {
        const basePrice = selectedProduct.price || 0;
        await fetch('/api/cart/abandoned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: watchedFullName,
            phone: watchedPhone,
            email: '',
            street: watchedStreet,
            deliveryArea: watchedDeliveryArea,
            items: [{
              product: selectedProduct.productId,
              name: selectedProduct.productName || 'Landing Page Product',
              quantity: quantity,
              price: basePrice,
              image: selectedProduct.productImage || ''
            }],
            totalAmount: basePrice * quantity
          })
        });
      } catch (error) {
        console.error('Failed to sync abandoned cart:', error);
      }
    };

    const timer = setTimeout(syncAbandonedCart, 2000); // 2 seconds debounce
    return () => clearTimeout(timer);
  }, [watchedFullName, watchedPhone, watchedStreet, watchedDeliveryArea, quantity, selectedProduct]);

  // Pricing calculations
  const basePrice = selectedProduct.price || 0;
  const itemsTotal = basePrice * quantity;
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 0;
  const isFreeDelivery = freeDeliveryThreshold > 0 && itemsTotal >= freeDeliveryThreshold;

  const chargeInsideDhaka = settings?.deliveryChargeInsideDhaka ?? 60;
  const chargeOutsideDhaka = settings?.deliveryChargeOutsideDhaka ?? 120;
  const deliveryCharge = isFreeDelivery ? 0 : (watchedDeliveryArea === 'inside' ? chargeInsideDhaka : chargeOutsideDhaka);
  
  const finalTotal = Math.max(0, itemsTotal + deliveryCharge - couponDiscount);

  // Apply Coupon
  const applyCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, totalAmount: itemsTotal })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discountAmount);
        setAppliedCoupon(data.code);
        if (!codeToUse) toast.success(`Coupon "${data.code}" applied!`);
      } else {
        if (codeToUse) {
          removeCoupon();
          toast.info(data.message || 'Coupon removed due to total changes');
        } else {
          toast.error(data.message || 'Invalid coupon');
        }
      }
    } catch (error) {
      if (!codeToUse) toast.error('Failed to validate coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  // Re-validate coupon when total changes
  useEffect(() => {
    if (appliedCoupon && itemsTotal > 0) {
      applyCoupon(appliedCoupon);
    }
  }, [itemsTotal]);

  const onSubmit = async (values: CheckoutValues) => {
    if (values.paymentMethod === 'Manual' && !selectedMethod?.id) {
      toast.error('Please select a payment gateway and provide transaction details!');
      return;
    }

    // Product ID check
    if (!selectedProduct.productId) {
      toast.error('Sorry, orders for this product are currently unavailable. (Missing Product ID)');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: [{
          product: selectedProduct.productId,
          name: selectedProduct.productName || 'Landing Page Product',
          quantity: quantity,
          price: basePrice,
          image: selectedProduct.productImage || ''
        }],
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          email: `${values.phone}@store.com`,
          street: values.street,
          city: values.deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
          state: values.deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
          division: values.deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
          district: values.deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
          thana: values.deliveryArea === 'inside' ? 'Dhaka' : 'Outside Dhaka',
          zipCode: '0000',
          country: 'Bangladesh'
        },
        paymentMethod: values.paymentMethod,
        deliveryCharge: deliveryCharge,
        couponCode: appliedCoupon || undefined,
        manualPaymentDetails: values.paymentMethod === 'Manual' ? {
          methodName: selectedMethod?.id,
          senderNumber: manualDetails.senderNumber,
          transactionId: manualDetails.transactionId
        } : undefined
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        submissionSucceededRef.current = true;

        // CAPI & Pixel Purchase Event
        try {
          const nameParts = values.fullName.trim().split(/\s+/);
          const purchaseEventData = {
            value: order.totalAmount ?? finalTotal,
            currency: 'BDT',
            content_ids: [selectedProduct.productId],
            content_type: 'product',
            num_items: 1,
            contents: [{
              id: selectedProduct.productId,
              quantity: quantity,
              item_price: basePrice,
            }],
          };

          const purchaseUserData: any = {
            em: '',
            ph: values.phone,
            fn: nameParts[0] || '',
            ln: nameParts.slice(1).join(' ') || '',
            country: 'bd',
          };

          if (values.deliveryArea === 'inside') {
            purchaseUserData.ct = 'Dhaka';
            purchaseUserData.st = 'Dhaka';
          }

          fbEvent('Purchase', purchaseEventData, purchaseUserData, order._id);
          ttEvent('Purchase', purchaseEventData, purchaseUserData, order._id);
        } catch (trackingError) {
          console.error('Tracking error:', trackingError);
        }

        if (values.paymentMethod === 'Online') {
          // Initialize SSLCommerz Payment
          const initRes = await fetch('/api/payment/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order._id }),
          });

          if (initRes.ok) {
            const { url } = await initRes.json();
            window.location.href = url;
            return;
          } else {
            const initError = await initRes.json();
            toast.error(initError.message || 'Failed to initialize payment gateway. Please try paying from dashboard.');
            setSuccessOrderId(order._id);
            setSuccess(true);
          }
        } else {
          setSuccessOrderId(order._id);
          setSuccess(true);
          toast.success('Order placed successfully!');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Order failed');
      }
    } catch (error) {
      toast.error('Sorry, there was an issue processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 max-w-xl text-center py-20 space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center bg-emerald-100 text-emerald-600 rounded-full animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Order Placed Successfully!</h2>
        <p className="text-muted-foreground">Our representative will contact you via phone shortly. Thank you for shopping with us.</p>
        {successOrderId && (
          <p className="text-xs font-bold text-primary">Order ID: #{successOrderId.slice(-6).toUpperCase()}</p>
        )}
        <Button onClick={() => setSuccess(false)} variant="outline" className="rounded-full">Place New Order</Button>
      </div>
    );
  }

  const isPhoneValid = /^(?:01)[3-9]\d{8}$/.test((watchedPhone || '').trim());
  const isAddressValid = (watchedStreet || '').trim().length >= 5;
  const isNameValid = (watchedFullName || '').trim().length >= 2;
  const isFormValid = !!(
    isNameValid &&
    isPhoneValid &&
    isAddressValid &&
    watchedDeliveryArea &&
    (form.watch('paymentMethod') !== 'Manual' || (selectedMethod?.id && manualDetails.senderNumber && manualDetails.transactionId))
  );

  return (
    <div id="order" className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Summary */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block">
          <Card className="border-2 rounded-[2rem] overflow-hidden shadow-xl bg-white dark:bg-zinc-950">
            <CardHeader className="bg-slate-50 dark:bg-zinc-900/50 pb-4 border-b">
              <CardTitle className="text-lg font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <ProductSummaryCard
                selectedProduct={selectedProduct}
                basePrice={basePrice}
                showQuantity={content.showQuantity}
                quantity={quantity}
                setQuantity={setQuantity}
              />
              <Separator />
              <CouponAndBillBreakdown
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                appliedCoupon={appliedCoupon}
                applyingCoupon={applyingCoupon}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
                itemsTotal={itemsTotal}
                deliveryCharge={deliveryCharge}
                isFreeDelivery={isFreeDelivery}
                couponDiscount={couponDiscount}
                freeDeliveryThreshold={freeDeliveryThreshold}
                finalTotal={finalTotal}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Checkout Form */}
        <div className="lg:col-span-6">
          <Card className="border-4 border-primary/20 rounded-[2rem] shadow-2xl overflow-hidden bg-white dark:bg-zinc-950">
            <div className="bg-primary p-6 text-primary-foreground text-center">
              <h2 className="text-xl md:text-2xl font-black">{content.title}</h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
                {/* Mobile Only: Selected Product Summary */}
                <div className="block lg:hidden space-y-4 pb-4 border-b">
                  <ProductSummaryCard
                    selectedProduct={selectedProduct}
                    basePrice={basePrice}
                    showQuantity={content.showQuantity}
                    quantity={quantity}
                    setQuantity={setQuantity}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} className="h-12 rounded-xl border-2 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 017XXXXXXXX" {...field} className="h-12 rounded-xl border-2 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryArea"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-bold">Delivery Area</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-row space-x-6 pt-1"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                              <FormControl>
                                <RadioGroupItem value="inside" />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer text-sm">
                                Inside Dhaka (৳{chargeInsideDhaka})
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 cursor-pointer">
                              <FormControl>
                                <RadioGroupItem value="outside" />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer text-sm">
                                Outside Dhaka (৳{chargeOutsideDhaka})
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Full Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="House/Street, Road, Area, Thana, District" {...field} className="rounded-xl border-2 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Mobile Only: Coupon & Bill Breakdown */}
                <div className="block lg:hidden space-y-4 py-4 border-y">
                  <CouponAndBillBreakdown
                    couponCode={couponCode}
                    setCouponCode={setCouponCode}
                    appliedCoupon={appliedCoupon}
                    applyingCoupon={applyingCoupon}
                    applyCoupon={applyCoupon}
                    removeCoupon={removeCoupon}
                    itemsTotal={itemsTotal}
                    deliveryCharge={deliveryCharge}
                    isFreeDelivery={isFreeDelivery}
                    couponDiscount={couponDiscount}
                    freeDeliveryThreshold={freeDeliveryThreshold}
                    finalTotal={finalTotal}
                  />
                </div>

                <div className="space-y-4">

                  {/* Payment Method Selector */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-bold">Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 border rounded-xl p-4 cursor-pointer hover:bg-slate-50/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="COD" />
                              </FormControl>
                              <FormLabel className="font-bold flex-1 cursor-pointer">
                                Cash on Delivery (COD)
                                <p className="text-xs font-normal text-muted-foreground mt-0.5">Pay in cash when you receive the product.</p>
                              </FormLabel>
                            </FormItem>

                            {settings?.paymentConfig?.activeMethod === 'sslcommerz' && (
                              <FormItem className="flex items-center space-x-3 space-y-0 border rounded-xl p-4 cursor-pointer hover:bg-slate-50/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="Online" />
                                </FormControl>
                                <FormLabel className="font-bold flex-1 cursor-pointer">
                                  Online Payment (SSLCommerz)
                                  <p className="text-xs font-normal text-muted-foreground mt-0.5">Secure payment via Cards or Mobile Banking.</p>
                                  <Badge variant="secondary" className="mt-1 text-[10px]">Recommended</Badge>
                                </FormLabel>
                              </FormItem>
                            )}

                            {(settings?.manualPaymentConfig?.bkash?.active ||
                              settings?.manualPaymentConfig?.nagad?.active ||
                              settings?.manualPaymentConfig?.rocket?.active ||
                              settings?.manualPaymentConfig?.banglaQr?.active) && (
                                <FormItem className="flex items-center space-x-3 space-y-0 border rounded-xl p-4 cursor-pointer hover:bg-slate-50/50 transition-colors">
                                  <FormControl>
                                    <RadioGroupItem value="Manual" />
                                  </FormControl>
                                  <FormLabel className="font-bold flex-1 cursor-pointer">
                                    Manual Payment (Mobile Banking / QR)
                                    <p className="text-xs font-normal text-muted-foreground mt-0.5">Send money and provide transaction ID to confirm.</p>
                                  </FormLabel>
                                </FormItem>
                              )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Manual Payment Option Cards */}
                  {form.watch('paymentMethod') === 'Manual' && settings?.manualPaymentConfig && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top duration-300">
                      {['bkash', 'nagad', 'rocket', 'banglaQr'].map((method) => {
                        const config = settings.manualPaymentConfig[method];
                        if (!config?.active) return null;
                        const isSelected = selectedMethod?.id === method;
                        return (
                          <div
                            key={method}
                            onClick={() => {
                              setSelectedMethod({ id: method, ...config });
                              setShowPaymentModal(true);
                            }}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 hover:bg-slate-50 ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                            }`}
                          >
                            <div className="h-10 w-10 flex items-center justify-center">
                              {method === 'banglaQr' ? (
                                <Globe className="h-8 w-8 text-primary" />
                              ) : (
                                <Image src={`/assets/${method}logo.webp`} alt={method} width={40} height={40} className="h-full w-auto object-contain" />
                              )}
                            </div>
                            <p className="text-[10px] font-bold uppercase">{method === 'banglaQr' ? 'Bangla QR' : method}</p>
                            {isSelected && (
                              <div className="text-[8px] font-bold text-primary flex items-center gap-0.5 mt-1">
                                <CheckCircle2 className="h-2 w-2" /> Details Added
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Validation message if Manual method selected but details missing */}
                  {form.watch('paymentMethod') === 'Manual' && !selectedMethod?.id && (
                    <p className="text-[10px] text-destructive font-bold text-center mt-2 animate-pulse">
                      Please select a mobile payment gateway and provide transaction details!
                    </p>
                  )}
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                   <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                   <div className="text-sm text-emerald-800">
                      <strong>Secure Payment:</strong> {content.paymentInstructions}
                   </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !isFormValid || isPendingOrderBlocked}
                  className={`w-full h-14 rounded-2xl font-black text-xl gap-3 transition-all duration-200 ${
                    isFormValid && !isPendingOrderBlocked
                      ? 'bg-primary shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95'
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : isPendingOrderBlocked ? (
                    'Pending Order Exists'
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6" /> 
                      {content.buttonText}
                    </>
                  )}
                </Button>
                {!isFormValid && (
                  <p className="text-[10px] font-bold text-muted-foreground text-center w-full uppercase tracking-widest mt-2">
                    Please fill in delivery details to complete order
                  </p>
                )}

                <div className="flex items-center justify-center gap-6 text-[10px] uppercase font-bold opacity-50 tracking-widest">
                   <div className="flex items-center gap-1"><Truck className="h-3 w-3" /> Fast Delivery</div>
                   <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified Quality</div>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>

      {/* Manual Payment Verification Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="py-4 px-6 bg-gradient-to-br from-primary to-primary/80 text-white relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl p-1.5 shadow-md shrink-0 flex items-center justify-center">
                {selectedMethod?.id === 'banglaQr' ? (
                  <Globe className="h-6 w-6 text-primary" />
                ) : (
                  <Image src={`/assets/${selectedMethod?.id}logo.webp`} alt={selectedMethod?.id} width={40} height={40} className="h-full w-auto object-contain" />
                )}
              </div>
              <div className="text-left">
                <DialogTitle className="text-base md:text-lg font-black uppercase tracking-tight">
                  {selectedMethod?.id === 'banglaQr' ? 'Pay via Bangla QR' : `Pay via ${selectedMethod?.id}`}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[60vh] pr-2">
            {/* Payment Info */}
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
              {selectedMethod?.id !== 'banglaQr' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Send Money To</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[9px] py-0.5 px-1.5">Personal Number</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p className="text-lg font-black tracking-widest text-slate-900 dark:text-zinc-50 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-primary/10 flex-1 text-center select-all">
                      {selectedMethod?.number}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg text-[10px] font-bold border hover:bg-primary hover:text-white transition-all shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedMethod?.number || '');
                        toast.success('Number copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </>
              )}

              {(selectedMethod?.qrCode || selectedMethod?.id === 'banglaQr') && (
                <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-primary/10">
                  <p className="text-[9px] font-bold uppercase opacity-40">Scan QR Code to Pay</p>
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-primary/10">
                    <Image src={selectedMethod?.qrCode || '/assets/placeholder-qr.png'} alt="QR" width={128} height={128} className="h-32 w-32 object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Panel */}
            <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl p-3 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <p className="text-[10px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Payment Instructions:</p>
              <div className="max-h-24 overflow-y-auto pr-1 space-y-1 text-[9px] leading-relaxed text-slate-600 dark:text-zinc-400 font-medium">
                <p>1. Open your <strong>{selectedMethod?.id === 'bkash' ? 'bKash' : selectedMethod?.id === 'nagad' ? 'Nagad' : selectedMethod?.id === 'rocket' ? 'Rocket' : 'Mobile Banking'}</strong> app or dial USSD and choose <strong>"Send Money"</strong>.</p>
                {selectedMethod?.id !== 'banglaQr' ? (
                  <p>2. Enter the <strong>Personal</strong> number shown above as the recipient.</p>
                ) : (
                  <p>2. Scan the <strong>Bangla QR</strong> code shown above using your bank or payment app.</p>
                )}
                <p>3. Send the exact total payment amount of <strong>৳{Math.round(finalTotal)}</strong>.</p>
                <p>4. After completing payment, confirm below using your <strong>Sender Phone Number</strong> or <strong>Transaction ID (TrxID)</strong>.</p>
              </div>
            </div>

            {/* Selection Tabs */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 mt-2">
              <button
                type="button"
                onClick={() => setPaymentDetailTab('phone')}
                className={`flex-1 pb-1.5 text-[11px] font-bold text-center border-b-2 transition-all ${
                  paymentDetailTab === 'phone'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                Via Sender Phone
              </button>
              <button
                type="button"
                onClick={() => setPaymentDetailTab('trx')}
                className={`flex-1 pb-1.5 text-[11px] font-bold text-center border-b-2 transition-all ${
                  paymentDetailTab === 'trx'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                Via Transaction ID (TrxID)
              </button>
            </div>

            {/* Verification Field based on active tab */}
            <div className="space-y-3 pt-1">
              {paymentDetailTab === 'phone' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Sender Phone Number</Label>
                  <Input
                    placeholder="017XXXXXXXX"
                    value={manualDetails.senderNumber}
                    onChange={(e) => setManualDetails({ ...manualDetails, senderNumber: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Transaction ID (TrxID)</Label>
                  <Input
                    placeholder="e.g. 8N7792VOP"
                    value={manualDetails.transactionId}
                    onChange={(e) => setManualDetails({ ...manualDetails, transactionId: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex gap-3 shrink-0">
            <Button
              variant="outline"
              type="button"
              className="flex-1 rounded-xl h-11 text-xs"
              onClick={() => {
                setSelectedMethod(null);
                setManualDetails({ senderNumber: '', transactionId: '' });
                setShowPaymentModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl h-11 text-xs font-bold bg-primary text-white"
              onClick={() => {
                if (paymentDetailTab === 'phone' && !manualDetails.senderNumber.trim()) {
                  toast.error('Please enter the sender phone number');
                  return;
                }
                if (paymentDetailTab === 'trx' && !manualDetails.transactionId.trim()) {
                  toast.error('Please enter the transaction ID');
                  return;
                }
                setShowPaymentModal(false);
                toast.success('Payment details saved. Please submit the form to confirm your order.');
              }}
            >
              Confirm Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
