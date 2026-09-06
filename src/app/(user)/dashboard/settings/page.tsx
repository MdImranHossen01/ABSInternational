'use client';

import { PasswordChangeForm } from '@/components/user/PasswordChangeForm';

export default function SettingsPage() {
  return (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight">Account Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Update password and account security</p>
      </div>
      <PasswordChangeForm />
    </div>
  );
}

