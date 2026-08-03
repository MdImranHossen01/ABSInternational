'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ShieldCheck, Building, Wallet, User as UserIcon, AlertCircle } from 'lucide-react';
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

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email(),
  phone: z.string().optional(),
  image: z.string().optional(),
  nidNumber: z.string().optional(),
  nidFrontImage: z.string().optional(),
  nidBackImage: z.string().optional(),
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

export function ProfileForm() {
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nidStatus, setNidStatus] = useState('Not Submitted');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      image: '',
      nidNumber: '',
      nidFrontImage: '',
      nidBackImage: '',
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
          nidNumber: data.nidNumber || '',
          nidFrontImage: data.nidFrontImage || '',
          nidBackImage: data.nidBackImage || '',
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
        setNidStatus(responseData.user?.nidStatus || 'Pending');
        toast.success('Profile and MLM credentials updated successfully!');
        await update({ name: values.name, image: values.image });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getNidBadgeColor = () => {
    switch (nidStatus) {
      case 'Approved': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'Pending': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'Rejected': return 'bg-red-500 hover:bg-red-600 text-white';
      default: return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <Tabs defaultValue="basic" className="w-full space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md bg-muted rounded-xl">
          <TabsTrigger value="basic" className="rounded-lg gap-2"><UserIcon className="h-4 w-4" /> Profile Info</TabsTrigger>
          <TabsTrigger value="kyc" className="rounded-lg gap-2"><ShieldCheck className="h-4 w-4" /> KYC NID</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-lg gap-2"><Wallet className="h-4 w-4" /> Bank & MFS</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Update your public account bio and shipping details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Picture</FormLabel>
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
                    <div className="w-full md:w-2/3 space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" {...field} disabled={true} />
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
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+8801XXXXXXXXX" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-sm text-gray-700">Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="address.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Road, Flat 3B" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Division</FormLabel>
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
                                <SelectTrigger><SelectValue placeholder="Select a Division" /></SelectTrigger>
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
                            <FormLabel>District</FormLabel>
                            <Select
                              disabled={isSubmitting || !selectedDivision}
                              onValueChange={(val) => {
                                 field.onChange(val);
                                 form.setValue('address.state', '');
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a District" /></SelectTrigger>
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
                            <FormLabel>Thana / Upazila</FormLabel>
                            <Select
                              disabled={isSubmitting || !selectedDistrict}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a Thana" /></SelectTrigger>
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
                            <FormLabel>Post Office / ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="1200" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyc" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>KYC Verification</CardTitle>
                    <CardDescription>Upload your National ID (NID) for account verification.</CardDescription>
                  </div>
                  <Badge className={`${getNidBadgeColor()} capitalize text-xs px-3 py-1`}>{nidStatus}</Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {nidStatus === 'Rejected' && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-200">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <div className="text-xs">
                        <strong>NID Verification Rejected:</strong> Please re-upload clear photos of both sides and double-check your NID Number.
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="nidNumber"
                    render={({ field }) => (
                      <FormItem className="max-w-md">
                        <FormLabel>NID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 10 or 17 digit NID number" {...field} disabled={isSubmitting || nidStatus === 'Approved'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nidFrontImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NID Front Side Photo</FormLabel>
                          <FormControl>
                            {nidStatus === 'Approved' && field.value ? (
                              <div className="relative aspect-video rounded-lg overflow-hidden border">
                                <Image src={field.value} alt="NID Front" fill className="object-cover" />
                              </div>
                            ) : (
                              <ImageUpload 
                                  value={field.value || ''} 
                                  onUpload={(url) => field.onChange(url)} 
                                  aspect="video"
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nidBackImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NID Back Side Photo</FormLabel>
                          <FormControl>
                            {nidStatus === 'Approved' && field.value ? (
                              <div className="relative aspect-video rounded-lg overflow-hidden border">
                                <Image src={field.value} alt="NID Back" fill className="object-cover" />
                              </div>
                            ) : (
                              <ImageUpload 
                                  value={field.value || ''} 
                                  onUpload={(url) => field.onChange(url)} 
                                  aspect="video"
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>MFS & Bank Accounts</CardTitle>
                  <CardDescription>Setup your bKash/Nagad/Rocket numbers and bank routing details to receive payouts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2 border-b pb-2"><Wallet className="h-4 w-4 text-primary" /> Mobile Financial Services (MFS)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="bkashNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>bKash Personal Number</FormLabel>
                            <FormControl>
                              <Input placeholder="017XXXXXXXX" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Nagad Personal Number</FormLabel>
                            <FormControl>
                              <Input placeholder="017XXXXXXXX" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rocketNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rocket Personal Number</FormLabel>
                            <FormControl>
                              <Input placeholder="017XXXXXXXX" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2 border-b pb-2"><Building className="h-4 w-4 text-primary" /> Bank Account Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Dutch Bangla Bank" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Branch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Motijheel Branch" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank account number" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Routing Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9-digit bank routing number" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-3 max-w-4xl">
              <Button type="submit" disabled={isSubmitting} className="h-12 px-8 font-bold rounded-xl shadow-lg">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save MLM & Profile Settings
              </Button>
            </div>

          </form>
        </Form>
      </Tabs>
    </div>
  );
}
