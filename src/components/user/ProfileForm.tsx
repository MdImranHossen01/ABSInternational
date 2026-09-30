'use client';

import { useState, useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Loader2, 
  ShieldCheck, 
  Building, 
  Wallet, 
  User as UserIcon, 
  AlertCircle,
  CheckCircle2,
  Check,
  Upload,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bdLocations, bdDivisions, divisions } from '@/lib/bd-locations';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { uploadToImgBB } from '@/lib/upload';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email(),
  phone: z.string().optional(),
  image: z.string().optional(),
  // KYC fields
  kycFullName: z.string().optional(),
  nidNumber: z.string().optional(),
  kycDateOfBirth: z.string().optional(),
  kycFatherName: z.string().optional(),
  kycMotherName: z.string().optional(),
  kycPresentAddress: z.string().optional(),
  kycPermanentAddress: z.string().optional(),
  nidFrontImage: z.string().optional(),
  nidBackImage: z.string().optional(),
  kycOwnerPhoto: z.string().optional(),
  // Financial fields
  bkashNo: z.string().optional(),
  nagadNo: z.string().optional(),
  rocketNo: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankRoutingNo: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    division: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface KycUploadBoxProps {
  label: string;
  sublabel: string;
  value?: string;
  onChange: (url: string) => void;
  aspect?: 'video' | 'square';
  disabled?: boolean;
}

function KycUploadBox({
  label,
  sublabel,
  value,
  onChange,
  aspect = 'video',
  disabled = false,
}: KycUploadBoxProps) {
  const [uploading, setUploading] = useState(false);
  const inputId = useId();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onChange(url);
      toast.success(`${label} uploaded successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="rounded-xl border bg-card p-3 flex flex-col justify-between space-y-2 transition-all shadow-xs hover:border-primary/40">
      <div className="flex items-center justify-between gap-1">
        <div>
          <span className="text-xs font-bold text-foreground block">{label}</span>
          <span className="text-[10px] text-muted-foreground">{sublabel}</span>
        </div>
        {value ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            ✓ Uploaded
          </span>
        ) : (
          <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            Required
          </span>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        disabled={disabled || uploading}
        onChange={handleFile}
      />

      {value ? (
        <div className="space-y-2">
          <div
            className={cn(
              "relative w-full rounded-lg overflow-hidden border bg-muted/40 shadow-xs",
              aspect === "square" ? "aspect-square max-w-[150px] mx-auto" : "aspect-video"
            )}
          >
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>

          {!disabled && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <label
                htmlFor={inputId}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1 h-8 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-semibold cursor-pointer transition-colors border",
                  uploading && "opacity-50 pointer-events-none"
                )}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Replace</span>
              </label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
                disabled={uploading}
                className="h-8 px-2 text-muted-foreground hover:text-destructive text-[11px]"
                title="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/60 bg-muted/15 hover:bg-primary/[0.03] transition-all cursor-pointer text-center p-3.5",
            aspect === "square" ? "aspect-square max-w-[150px] mx-auto w-full" : "aspect-video",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-[11px] font-medium text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary block">Click to upload</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP (Max 10MB)</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}

export function ProfileForm() {
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKycSubmitting, setIsKycSubmitting] = useState(false);
  const [nidStatus, setNidStatus] = useState('Not Submitted');
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      image: '',
      kycFullName: '',
      nidNumber: '',
      kycDateOfBirth: '',
      kycFatherName: '',
      kycMotherName: '',
      kycPresentAddress: '',
      kycPermanentAddress: '',
      nidFrontImage: '',
      nidBackImage: '',
      kycOwnerPhoto: '',
      bkashNo: '',
      nagadNo: '',
      rocketNo: '',
      bankName: '',
      bankBranch: '',
      bankAccountNo: '',
      bankRoutingNo: '',
      address: {
        street: '',
        division: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Bangladesh',
      }
    },
  });

  const selectedDivision = form.watch('address.division');
  const availableDistricts = selectedDivision && bdDivisions[selectedDivision] 
                            ? bdDivisions[selectedDivision] 
                            : [];

  const selectedDistrict = form.watch('address.city');
  const availableThanas = selectedDistrict && bdLocations[selectedDistrict] 
                            ? bdLocations[selectedDistrict] 
                            : (bdLocations['Others'] || []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        
        setNidStatus(data.nidStatus || 'Not Submitted');
        form.reset({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          image: data.image || '',
          kycFullName: data.kycFullName || data.name || '',
          nidNumber: data.nidNumber || '',
          kycDateOfBirth: data.kycDateOfBirth || '',
          kycFatherName: data.kycFatherName || '',
          kycMotherName: data.kycMotherName || '',
          kycPresentAddress: data.kycPresentAddress || data.addresses?.[0]?.street || '',
          kycPermanentAddress: data.kycPermanentAddress || data.addresses?.[0]?.street || '',
          nidFrontImage: data.nidFrontImage || '',
          nidBackImage: data.nidBackImage || '',
          kycOwnerPhoto: data.kycOwnerPhoto || data.image || '',
          bkashNo: data.bkashNo || '',
          nagadNo: data.nagadNo || '',
          rocketNo: data.rocketNo || '',
          bankName: data.bankName || '',
          bankBranch: data.bankBranch || '',
          bankAccountNo: data.bankAccountNo || '',
          bankRoutingNo: data.bankRoutingNo || '',
          address: {
            street: data.addresses?.[0]?.street || '',
            division: data.addresses?.[0]?.division || '',
            city: data.addresses?.[0]?.city || '',
            state: data.addresses?.[0]?.state || '',
            zipCode: data.addresses?.[0]?.zipCode || '',
            country: data.addresses?.[0]?.country || 'Bangladesh',
          }
        });
      } catch (error: any) {
        console.error('Fetch profile error:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [form.reset]);

  // General profile update
  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to update profile');
      } else {
        const responseData = await res.json();
        if (responseData.user?.nidStatus) {
          setNidStatus(responseData.user.nidStatus);
        }
        toast.success('Profile settings updated successfully!');
        await update({ name: values.name, image: values.image });
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Dedicated KYC submission
  const handleKycSubmit = async () => {
    const values = form.getValues();
    const phone = values.phone?.trim();
    const fullName = values.kycFullName?.trim() || values.name?.trim();
    const nidNumber = values.nidNumber?.trim();
    const dob = values.kycDateOfBirth?.trim();
    const father = values.kycFatherName?.trim();
    const mother = values.kycMotherName?.trim();
    const presentAddr = values.kycPresentAddress?.trim();
    const permanentAddr = values.kycPermanentAddress?.trim();
    const frontImg = values.nidFrontImage;
    const backImg = values.nidBackImage;
    const ownerImg = values.kycOwnerPhoto;

    if (!phone || phone.length < 11) {
      toast.error('Owner valid mobile number (11 digits) is required.');
      return;
    }
    if (!fullName) {
      toast.error('Full name is required.');
      return;
    }
    if (!nidNumber || nidNumber.length < 10) {
      toast.error('Valid NID Number (minimum 10 digits) is required.');
      return;
    }
    if (!dob) {
      toast.error('Date of birth is required.');
      return;
    }
    if (!father) {
      toast.error("Father's name is required.");
      return;
    }
    if (!mother) {
      toast.error("Mother's name is required.");
      return;
    }
    if (!presentAddr) {
      toast.error('Present address is required.');
      return;
    }
    if (!permanentAddr) {
      toast.error('Permanent address is required.');
      return;
    }
    if (!frontImg) {
      toast.error('NID front photo is required.');
      return;
    }
    if (!backImg) {
      toast.error('NID back photo is required.');
      return;
    }
    if (!ownerImg) {
      toast.error('Owner photo is required.');
      return;
    }

    setIsKycSubmitting(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          name: fullName,
          kycFullName: fullName,
          isKycSubmit: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to submit KYC verification');
      } else {
        setNidStatus('Pending');
        toast.success('KYC application submitted successfully! Admin will review shortly.');
      }
    } catch {
      toast.error('Network error submitting KYC');
    } finally {
      setIsKycSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Profile Header Status Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
        <div className="flex items-center gap-2">
          {nidStatus === 'Approved' ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 gap-1.5 shadow-xs">
              <CheckCircle2 className="h-4 w-4" /> KYC Verified Account
            </Badge>
          ) : nidStatus === 'Pending' ? (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1 gap-1.5">
              <ShieldCheck className="h-4 w-4" /> KYC Under Review
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 text-xs px-3 py-1 gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> Verification Required
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 sm:grid sm:grid-cols-3 max-w-md bg-muted rounded-xl p-1 h-auto">
            <TabsTrigger value="basic" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5">
              <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Profile Info
            </TabsTrigger>
            <TabsTrigger value="kyc" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 
              KYC Verification
              {nidStatus === 'Approved' && (
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
              )}
            </TabsTrigger>
            <TabsTrigger value="payment" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Bank & MFS
            </TabsTrigger>
          </TabsList>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* TAB 1: BASIC PROFILE */}
            <TabsContent value="basic" className="space-y-4">
              <Card className="rounded-xl shadow-xs border">
                <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg">Personal Details</CardTitle>
                  <CardDescription className="text-xs">Update your public account bio and shipping details.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-1 space-y-4">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-1/3">
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Profile Picture</FormLabel>
                            <FormControl>
                              <ImageUpload 
                                  value={field.value || ''} 
                                  onUpload={(url) => field.onChange(url)} 
                                  aspect="square"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="w-full md:w-2/3 space-y-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} disabled={true} className="h-10 rounded-lg text-xs sm:text-sm bg-muted/30" />
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
                            <FormLabel className="text-xs font-bold">Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+8801XXXXXXXXX" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <h3 className="font-bold text-xs sm:text-sm text-foreground">Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="address.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold">Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Road, Flat 3B" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="address.division"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Division</FormLabel>
                            <Select
                              disabled={isSubmitting}
                              onValueChange={(val) => {
                                 field.onChange(val);
                                 form.setValue('address.city', '');
                                 form.setValue('address.state', '');
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-lg text-xs sm:text-sm"><SelectValue placeholder="Select a Division" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {divisions.map((division) => (
                                  <SelectItem key={division} value={division}>{division}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">District</FormLabel>
                            <Select
                              disabled={isSubmitting || !selectedDivision}
                              onValueChange={(val) => {
                                 field.onChange(val);
                                 form.setValue('address.state', '');
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-lg text-xs sm:text-sm"><SelectValue placeholder="Select a District" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableDistricts.map((district) => (
                                  <SelectItem key={district} value={district}>{district}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Thana / Upazila</FormLabel>
                            <Select
                              disabled={isSubmitting || !selectedDistrict}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-lg text-xs sm:text-sm"><SelectValue placeholder="Select a Thana" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableThanas.map((thana) => (
                                  <SelectItem key={thana} value={thana}>{thana}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Post Office / ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="1200" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="h-10 px-6 font-bold rounded-xl shadow-md text-xs sm:text-sm">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile Info
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: KYC VERIFICATION (SMART, COMPACT & CLEAN) */}
            <TabsContent value="kyc" className="space-y-4">
              
              {/* Status Alert Banner */}
              {nidStatus === 'Approved' ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Account Verified & Approved</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your National ID (NID) and identity credentials have been verified by administration. You have full access to Premium Membership and wallet payouts.
                    </p>
                  </div>
                </div>
              ) : nidStatus === 'Pending' ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Verification Under Review</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your National ID and documents are currently in the verification queue. Admin will review and verify your identity shortly.
                    </p>
                  </div>
                </div>
              ) : nidStatus === 'Rejected' ? (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Verification Rejected</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your previous application was rejected. Please ensure all photos are clear, corners visible, and details match your physical NID, then submit again.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* STEP 1: Verify contact details */}
              <Card className="rounded-xl shadow-xs border">
                <CardHeader className="p-3.5 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-black">
                      1
                    </span>
                    <div>
                      <CardTitle className="text-sm sm:text-base font-bold">Contact details</CardTitle>
                      <CardDescription className="text-xs">
                        Provide your active mobile number and account email.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-foreground">
                            Owner mobile number *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="01XXXXXXXXX"
                              {...field}
                              disabled={isKycSubmitting || nidStatus === 'Approved'}
                              className="h-10 rounded-lg font-medium text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-foreground">
                            Owner email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="user@example.com"
                              {...field}
                              disabled={true}
                              className="h-10 rounded-lg font-medium bg-muted/30 text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* STEP 2: NID details */}
              <Card className="rounded-xl shadow-xs border">
                <CardHeader className="p-3.5 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-black">
                      2
                    </span>
                    <div>
                      <CardTitle className="text-sm sm:text-base font-bold">Your NID details</CardTitle>
                      <CardDescription className="text-xs">
                        Enter them exactly as printed on the card.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-4 pt-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="kycFullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Full name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Full name as printed on NID" 
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="h-10 rounded-lg text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nidNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">NID number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10 or 17 digit NID number" 
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="h-10 rounded-lg font-mono text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kycDateOfBirth"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 lg:col-span-1">
                          <FormLabel className="text-xs font-bold">Date of birth *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="h-10 rounded-lg text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="kycFatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Father's name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Father's name as on NID" 
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="h-10 rounded-lg text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kycMotherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Mother's name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Mother's name as on NID" 
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="h-10 rounded-lg text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="kycPresentAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Present address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Current living address (Village/Road, Post, Thana, District)" 
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="min-h-[60px] rounded-lg text-xs resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kycPermanentAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Permanent address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Permanent address exactly as printed on back of NID card" 
                              {...field} 
                              disabled={isKycSubmitting || nidStatus === 'Approved'} 
                              className="min-h-[60px] rounded-lg text-xs resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* STEP 3: Verification Documents (CLEAN SINGLE CARDS, NO DUPLICATE PREVIEWS) */}
              <Card className="rounded-xl shadow-xs border">
                <CardHeader className="p-3.5 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-black">
                      3
                    </span>
                    <div>
                      <CardTitle className="text-sm sm:text-base font-bold">Verification Documents</CardTitle>
                      <CardDescription className="text-xs">
                        All three are required. JPG, PNG or WEBP, up to 10 MB each.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* NID Front */}
                    <FormField
                      control={form.control}
                      name="nidFrontImage"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <KycUploadBox
                              label="NID — front *"
                              sublabel="Front of card photo"
                              value={field.value}
                              onChange={(url) => field.onChange(url)}
                              aspect="video"
                              disabled={isKycSubmitting || nidStatus === 'Approved'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* NID Back */}
                    <FormField
                      control={form.control}
                      name="nidBackImage"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <KycUploadBox
                              label="NID — back *"
                              sublabel="Back of card photo"
                              value={field.value}
                              onChange={(url) => field.onChange(url)}
                              aspect="video"
                              disabled={isKycSubmitting || nidStatus === 'Approved'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Owner Photo */}
                    <FormField
                      control={form.control}
                      name="kycOwnerPhoto"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <KycUploadBox
                              label="Owner photo *"
                              sublabel="Face photo / Passport size"
                              value={field.value}
                              onChange={(url) => field.onChange(url)}
                              aspect="square"
                              disabled={isKycSubmitting || nidStatus === 'Approved'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Submission Action Bar */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-card border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  Once submitted, your application is reviewed by administration for verification.
                </p>

                {nidStatus === 'Approved' ? (
                  <Button
                    type="button"
                    disabled
                    className="bg-emerald-600 text-white font-bold h-10 px-5 rounded-lg shrink-0 text-xs sm:text-sm"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> KYC Verified & Approved
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleKycSubmit}
                    disabled={isKycSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 rounded-lg shadow-md shrink-0 text-xs sm:text-sm"
                  >
                    {isKycSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {nidStatus === 'Rejected'
                      ? 'Submit again'
                      : nidStatus === 'Pending'
                      ? 'Update Application'
                      : 'Submit KYC Application'}
                  </Button>
                )}
              </div>

            </TabsContent>

            {/* TAB 3: PAYMENT / MFS */}
            <TabsContent value="payment" className="space-y-4">
              <Card className="rounded-xl shadow-xs border">
                <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg">MFS & Bank Accounts</CardTitle>
                  <CardDescription className="text-xs">Setup your bKash/Nagad/Rocket numbers and bank routing details to receive payouts.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 pt-1 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2 border-b pb-1.5"><Wallet className="h-4 w-4 text-primary" /> Mobile Financial Services (MFS)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="bkashNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">bKash Personal Number</FormLabel>
                            <FormControl>
                              <Input placeholder="017XXXXXXXX" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nagadNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Nagad Personal Number</FormLabel>
                            <FormControl>
                              <Input placeholder="017XXXXXXXX" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rocketNo"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2 md:col-span-1">
                            <FormLabel className="text-xs font-bold">Rocket Personal Number</FormLabel>
                            <FormControl>
                              <Input placeholder="017XXXXXXXX" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2 border-b pb-1.5"><Building className="h-4 w-4 text-primary" /> Bank Account Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Dutch Bangla Bank" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankBranch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Branch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Motijheel Branch" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankAccountNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank account number" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bankRoutingNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold">Routing Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9-digit bank routing number" {...field} disabled={isSubmitting} className="h-10 rounded-lg text-xs sm:text-sm" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="h-10 px-6 font-bold rounded-xl shadow-md text-xs sm:text-sm">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save MFS & Bank Settings
                </Button>
              </div>
            </TabsContent>

          </form>
        </Form>
      </Tabs>
    </div>
  );
}
