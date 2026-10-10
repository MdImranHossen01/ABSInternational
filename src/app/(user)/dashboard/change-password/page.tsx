'use client';

import { useState } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);



  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: data.message || 'Password updated successfully.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (err) {
      toast.error('Network connection error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Change Password</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
          Maintain top security by regularly updating your portal login password.
        </p>
      </div>

      <div className="max-w-md">
        {/* Login Password Form */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Update Login Password
            </CardTitle>
            <CardDescription>Enter a secure password with at least 6 characters</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Current Password</Label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">New Password</Label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full font-bold h-10 text-xs">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
