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

  // PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

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

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || !/^\d{4}$/.test(newPin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setPinLoading(true);
    try {
      const res = await fetch('/api/user/wallet/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPin, newPin }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'PIN Updated!',
          text: data.message || 'Security PIN updated successfully.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        setOldPin('');
        setNewPin('');
      } else {
        toast.error(data.message || 'Failed to update PIN');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Change Password & Security</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
          Maintain top security by regularly updating your portal login password and your 4-digit transaction authorization PIN.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Transaction PIN Form */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" /> 4-Digit Security PIN
            </CardTitle>
            <CardDescription>Required for withdrawals and member-to-member transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Old PIN (If already set)</Label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="Leave empty if first time"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">New 4-Digit PIN</Label>
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="h-10 text-xs font-mono"
                  required
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground leading-relaxed">
                Never share your security PIN with anyone. Admin staff will never ask for your PIN.
              </div>

              <Button type="submit" disabled={pinLoading} variant="outline" className="w-full font-bold h-10 text-xs border-amber-500/30 text-amber-800 dark:text-amber-300">
                {pinLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                Save Security PIN
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
