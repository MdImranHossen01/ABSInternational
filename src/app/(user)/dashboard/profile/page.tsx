'use client';

import { ProfileForm } from '@/components/user/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight">Profile Information</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Manage your personal details, KYC, and payment withdrawal methods</p>
      </div>
      <ProfileForm />
    </div>
  );
}

