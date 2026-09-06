'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ShieldCheck, User as UserIcon, Mail, Phone, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

const adminProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email(),
  phone: z.string().optional(),
  image: z.string().optional(),
});

type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;

export function AdminProfileForm() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      image: '',
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          form.reset({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            image: data.image || '',
          });
        } else {
          toast.error('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
        toast.error('An error occurred while loading profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [form]);

  async function onSubmit(values: AdminProfileFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success('Admin profile updated successfully');
        if (update) {
          await update({
            ...session,
            user: {
              ...session?.user,
              name: values.name,
              image: values.image,
            }
          });
        }
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" />
          Admin Profile Details
        </CardTitle>
        <CardDescription>
          Update your administrator display name, contact phone number, and avatar image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start gap-2">
                  <FormLabel className="font-semibold">Profile Photo</FormLabel>
                  <div className="flex items-center gap-4">
                    {field.value ? (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/30 shadow-sm">
                        <Image
                          src={field.value}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30 text-muted-foreground">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                    <FormControl>
                      <ImageUpload
                        value={field.value || ''}
                        onUpload={(url) => field.onChange(url)}
                        aspect="square"
                        className="w-auto"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Super Admin" {...field} className="h-11 rounded-lg" />
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
                    <FormLabel className="font-semibold">Email Address (Read-only)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="h-11 rounded-lg bg-muted text-muted-foreground cursor-not-allowed" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Primary email address associated with your admin account.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="017XXXXXXXX" {...field} className="h-11 rounded-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px] font-semibold">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
