'use client';

import { Suspense } from 'react';
import { UsersManagementView } from '@/components/admin/UsersManagementView';
import { Loader2 } from 'lucide-react';

export default function AdminStaffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UsersManagementView type="admins" />
    </Suspense>
  );
}
