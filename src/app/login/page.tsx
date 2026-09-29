'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/logo';
import { CosmicAuthBackground } from '@/components/layout/CosmicAuthBackground';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any)?.role;
      if (role === 'admin' || role === 'super_admin' || role === 'manager') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error('Please enter your email, username, or phone number.');
      return;
    }

    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signIn('credentials', {
        email: identifier.trim(),
        password: password,
        redirect: false,
      });

      if (response?.error) {
        toast.error('Invalid credentials. Please check your username/email and password.');
      } else {
        toast.success('Signed in successfully!');
        const callbackUrl = searchParams.get('callbackUrl');
        if (callbackUrl && !callbackUrl.includes('/login')) {
          window.location.replace(callbackUrl);
        } else {
          window.location.replace('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col text-slate-100 overflow-x-hidden">
      {/* Background Graphic Elements */}
      <CosmicAuthBackground />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-24 md:pt-14 md:pb-32">
        {/* Brand Logo Centered */}
        <div className="flex justify-center mb-4 md:mb-8">
          <Logo
            className="gap-3 md:gap-4"
            imageClassName="size-12 sm:size-14 md:size-16"
            textClassName="text-xl sm:text-2xl md:text-3xl font-black text-amber-400 tracking-wider whitespace-nowrap"
            sizes="(max-width: 768px) 48px, 64px"
          />
        </div>

        {/* Page Title: Metallic Gold LOGIN with generous top & bottom gaps */}
        <div className="text-center mt-10 mb-14 md:mt-16 md:mb-24 lg:mt-20 lg:mb-28">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.18em] uppercase bg-gradient-to-b from-[#ffea9f] via-[#dfb248] to-[#9e7623] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(223,178,72,0.35)]">
            LOGIN
          </h1>
        </div>

        {/* Gold Bordered Container Card */}
        <div className="w-full max-w-xl bg-[#12141a]/95 backdrop-blur-md border-2 border-[#dfb248] rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_0_35px_rgba(223,178,72,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Field 1: Your Email Or Username */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-2">
                Your Email Or Username
              </label>
              <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                <Mail className="size-5 text-[#dfb248] mr-3 shrink-0" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email Or Username"
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none font-medium"
                />
              </div>
            </div>

            {/* Field 2: Your Password & Forget Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider">
                  Your Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs md:text-sm font-bold text-[#dfb248] hover:text-amber-200 transition-colors uppercase tracking-wide"
                >
                  Forget Password?
                </Link>
              </div>
              <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                <Lock className="size-5 text-[#dfb248] mr-3 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Row 3: Remember Me & New User Register */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs md:text-sm font-bold text-[#dfb248] tracking-wider uppercase">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-neutral-700 text-[#dfb248] focus:ring-[#dfb248] bg-[#07080c] accent-[#dfb248]"
                />
                REMEMBER ME
              </label>

              <div className="text-xs md:text-sm font-bold tracking-wider uppercase text-neutral-400">
                NEW USER?{' '}
                <Link
                  href="/register"
                  className="text-[#dfb248] hover:text-amber-200 font-extrabold underline-offset-4 hover:underline transition-colors"
                >
                  REGISTER
                </Link>
              </div>
            </div>

            {/* Submit Button: Full-Width Golden Metallic SIGN IN */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full font-black text-sm md:text-base uppercase tracking-widest text-black bg-gradient-to-r from-[#dfb248] via-[#fae69e] to-[#c29633] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_25px_rgba(223,178,72,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    SIGNING IN...
                  </>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
