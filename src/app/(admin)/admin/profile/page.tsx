'use client';

import { AdminProfileForm } from '@/components/admin/AdminProfileForm';
import { PasswordChangeForm } from '@/components/user/PasswordChangeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck } from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="flex-1 space-y-6 px-0 py-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Profile & Security</h1>
        <p className="text-sm text-muted-foreground">
          Manage your administrator profile details, avatar, and password security.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Password & Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <AdminProfileForm />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Update Password
              </CardTitle>
              <CardDescription>
                Ensure your administrator account is using a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <PasswordChangeForm hideHeader={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
