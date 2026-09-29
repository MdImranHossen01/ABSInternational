'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function loginWithGoogle() {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: searchParams.get('callbackUrl') || '/login' });
    } catch {
      setIsGoogleLoading(false);
      toast.error('Failed to sign in with Google.');
    }
  }

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

        try {
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json().catch(() => null);
          const role = (sessionData?.user as any)?.role;
          const isAdmin = role === 'admin' || role === 'super_admin' || role === 'manager';

          // If there is a specific callbackUrl (e.g. /admin/orders or /shop), follow it unless it was generic /dashboard for an admin
          if (callbackUrl && !callbackUrl.includes('/login') && (!isAdmin || callbackUrl !== '/dashboard')) {
            window.location.replace(callbackUrl);
            return;
          }

          if (isAdmin) {
            window.location.replace('/admin/dashboard');
            return;
          }
        } catch (err) {
          console.error('Session role check error:', err);
        }

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
    <div className="relative flex flex-col text-slate-100 overflow-x-hidden">
      {/* Background Graphic Elements */}
      <CosmicAuthBackground />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-6 md:pt-8 md:pb-8 relative z-10">
        {/* Page Title: Metallic Gold LOGIN with generous top & bottom gaps */}
        <div className="text-center mt-4 mb-10 md:mt-8 md:mb-16 lg:mt-12 lg:mb-20">
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
                Email Or Mobile Number
              </label>
              <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                <Mail className="size-5 text-[#dfb248] mr-3 shrink-0" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email Or Mobile Number"
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
                disabled={isLoading || isGoogleLoading}
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

            {/* Divider OR */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#12141a] px-4 text-neutral-400 font-bold tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Continue with Google Button */}
            <div>
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3.5 px-4 rounded-full border border-neutral-800 hover:border-[#dfb248]/60 bg-[#07080c] hover:bg-[#181b24] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-md"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-[#dfb248]" />
                    <span>CONNECTING GOOGLE...</span>
                  </>
                ) : (
                  <>
                    <svg className="size-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
