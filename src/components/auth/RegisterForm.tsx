'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Gift,
  PenLine,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { CosmicAuthBackground } from '@/components/layout/CosmicAuthBackground';
import { divisions, bdDivisions, bdLocations } from '@/lib/bd-locations';

interface RegisterFormProps {
  initialSponsor?: string;
}

export function RegisterForm({ initialSponsor }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Prefill sponsor from route parameter or query string
  const urlSponsor = initialSponsor || searchParams.get('sponsor') || searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    sponsorId: urlSponsor,
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    division: '',
    district: '',
    thana: '',
    placementId: '',
    placementPosition: '',
    nidNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cascading location options
  const availableDistricts = formData.division ? bdDivisions[formData.division] || [] : [];
  const availableThanas = formData.district ? bdLocations[formData.district] || [] : [];

  // Live Sponsor Verification State
  const [sponsorVerifying, setSponsorVerifying] = useState(false);
  const [sponsorStatus, setSponsorStatus] = useState<{
    valid: boolean;
    name?: string;
    username?: string;
    memberId?: string;
    message?: string;
  } | null>(null);

  // Live Placement Verification State
  const [placementVerifying, setPlacementVerifying] = useState(false);
  const [placementStatus, setPlacementStatus] = useState<{
    valid: boolean;
    name?: string;
    memberId?: string;
    username?: string;
    occupiedPositions: number[];
    isFull?: boolean;
    message?: string;
  } | null>(null);

  // Verify Sponsor Function
  const verifySponsor = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setSponsorStatus(null);
      return;
    }
    setSponsorVerifying(true);
    try {
      const res = await fetch(`/api/mlm/verify?type=sponsor&id=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setSponsorStatus({
          valid: true,
          name: data.name,
          username: data.username,
          memberId: data.memberId,
        });
      } else {
        setSponsorStatus({
          valid: false,
          message: data.message || 'Sponsor not found',
        });
      }
    } catch {
      setSponsorStatus({ valid: false, message: 'Verification failed' });
    } finally {
      setSponsorVerifying(false);
    }
  }, []);

  // Verify Placement Function
  const verifyPlacement = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setPlacementStatus(null);
      return;
    }
    setPlacementVerifying(true);
    try {
      const res = await fetch(`/api/mlm/verify?type=placement&id=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setPlacementStatus({
          valid: true,
          name: data.name,
          memberId: data.memberId,
          username: data.username,
          occupiedPositions: data.occupiedPositions || [],
          isFull: data.isFull,
        });
      } else {
        setPlacementStatus({
          valid: false,
          occupiedPositions: [],
          message: data.message || 'Placement member not found',
        });
      }
    } catch {
      setPlacementStatus({
        valid: false,
        occupiedPositions: [],
        message: 'Verification failed',
      });
    } finally {
      setPlacementVerifying(false);
    }
  }, []);

  // Debounce Sponsor Verification
  useEffect(() => {
    if (!formData.sponsorId) {
      setSponsorStatus(null);
      return;
    }
    const timer = setTimeout(() => {
      verifySponsor(formData.sponsorId);
    }, 450);
    return () => clearTimeout(timer);
  }, [formData.sponsorId, verifySponsor]);

  // Debounce Placement Verification
  useEffect(() => {
    if (!formData.placementId) {
      setPlacementStatus(null);
      return;
    }
    const timer = setTimeout(() => {
      verifyPlacement(formData.placementId);
    }, 450);
    return () => clearTimeout(timer);
  }, [formData.placementId, verifyPlacement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      division: value,
      district: '',
      thana: '',
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: value,
      thana: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter both First Name and Last Name.');
      return;
    }

    if (!formData.email.trim() || !formData.phone.trim()) {
      toast.error('Email and Phone Number are required.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    if (formData.placementId && !formData.placementPosition) {
      toast.error('Please select a Placement Position (Hand 1 to Hand 6).');
      return;
    }

    if (placementStatus?.isFull) {
      toast.error('The selected placement member already has all 6 direct positions occupied.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim() || undefined,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim() || undefined,
          division: formData.division || undefined,
          district: formData.district || undefined,
          thana: formData.thana || undefined,
          nidNumber: formData.nidNumber.trim() || undefined,
          sponsorId: formData.sponsorId.trim() || undefined,
          placementId: formData.placementId.trim() || undefined,
          placementPosition: formData.placementPosition ? Number(formData.placementPosition) : undefined,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Registration failed.');
      } else {
        if (session) {
          toast.success(
            data.memberId
              ? `Registration successful! New Member ID: ${data.memberId}`
              : 'Registration successful! New member account created.'
          );
          setFormData((prev) => ({
            sponsorId: urlSponsor || prev.sponsorId,
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            address: '',
            division: '',
            district: '',
            thana: '',
            placementId: '',
            placementPosition: '',
            nidNumber: '',
            password: '',
            confirmPassword: '',
          }));
          setPlacementStatus(null);
        } else {
          toast.success('Registration successful! Please login with your credentials.');
          router.push('/login');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col text-slate-100 overflow-x-hidden">
      {/* Background Graphic Elements */}
      <CosmicAuthBackground />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-6 md:pt-8 md:pb-8 relative z-10">
        {/* Page Title: Metallic Gold REGISTER with generous top & bottom gaps */}
        <div className="text-center mt-4 mb-10 md:mt-8 md:mb-16 lg:mt-12 lg:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.18em] uppercase bg-gradient-to-b from-[#ffea9f] via-[#dfb248] to-[#9e7623] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(223,178,72,0.35)]">
            REGISTER
          </h1>
        </div>

        {/* Gold Bordered Container Card */}
        <div className="w-full max-w-4xl bg-[#12141a]/95 backdrop-blur-md border-2 border-[#dfb248] rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_0_35px_rgba(223,178,72,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Field: Sponsor Name (Full Width) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider">
                  Sponsor Name
                </label>
                {sponsorVerifying && (
                  <span className="flex items-center text-xs text-amber-300/80 gap-1">
                    <Loader2 className="size-3 animate-spin" /> Verifying...
                  </span>
                )}
                {!sponsorVerifying && sponsorStatus?.valid && (
                  <span className="flex items-center text-xs font-semibold text-emerald-400 gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="size-3" /> {sponsorStatus.name} ({sponsorStatus.username || sponsorStatus.memberId})
                  </span>
                )}
                {!sponsorVerifying && sponsorStatus && !sponsorStatus.valid && (
                  <span className="flex items-center text-xs font-semibold text-rose-400 gap-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                    <AlertCircle className="size-3" /> {sponsorStatus.message}
                  </span>
                )}
              </div>
              <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                <Gift className="size-5 text-[#dfb248] mr-3 shrink-0" />
                <input
                  type="text"
                  name="sponsorId"
                  value={formData.sponsorId}
                  onChange={handleChange}
                  placeholder="Enter Sponsor Username or Member ID"
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none font-medium"
                />
              </div>
            </div>

            {/* Grid 2 Columns: First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <PenLine className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <PenLine className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Username & Email Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <PenLine className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <Mail className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Field: Phone Number (Full Width) */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                <Phone className="size-5 text-[#dfb248] mr-3 shrink-0" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                />
              </div>
            </div>

            {/* Field: Address (House #, Road #, Area) */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                Address
              </label>
              <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                <Home className="size-5 text-[#dfb248] mr-3 shrink-0" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House #, Road #, Area"
                  className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none font-medium"
                />
              </div>
            </div>

            {/* Grid 3 Columns: Division, District, Thana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
              {/* Division */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Division
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleDivisionChange}
                    className="w-full bg-transparent text-white text-sm md:text-base outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0c0d12] text-neutral-400">
                      Select division
                    </option>
                    {divisions.map((div) => (
                      <option key={div} value={div} className="bg-[#0c0d12] text-white">
                        {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  District
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    disabled={!formData.division}
                    className="w-full bg-transparent text-white text-sm md:text-base outline-none appearance-none cursor-pointer disabled:text-neutral-500 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#0c0d12] text-neutral-400">
                      Select district
                    </option>
                    {availableDistricts.map((dist) => (
                      <option key={dist} value={dist} className="bg-[#0c0d12] text-white">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thana */}
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Thana
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <select
                    name="thana"
                    value={formData.thana}
                    onChange={handleChange}
                    disabled={!formData.district}
                    className="w-full bg-transparent text-white text-sm md:text-base outline-none appearance-none cursor-pointer disabled:text-neutral-500 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#0c0d12] text-neutral-400">
                      Select thana
                    </option>
                    {availableThanas.map((th) => (
                      <option key={th} value={th} className="bg-[#0c0d12] text-white">
                        {th}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Placement ID & Placement Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider">
                    Placement ID
                  </label>
                  {placementVerifying && (
                    <span className="flex items-center text-xs text-amber-300/80 gap-1">
                      <Loader2 className="size-3 animate-spin" /> Checking...
                    </span>
                  )}
                  {!placementVerifying && placementStatus?.valid && (
                    <span className="flex items-center text-xs font-semibold text-emerald-400 gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="size-3" /> {placementStatus.name}
                    </span>
                  )}
                  {!placementVerifying && placementStatus && !placementStatus.valid && (
                    <span className="flex items-center text-xs font-semibold text-rose-400 gap-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                      <AlertCircle className="size-3" /> {placementStatus.message}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <MapPin className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type="text"
                    name="placementId"
                    value={formData.placementId}
                    onChange={handleChange}
                    placeholder="Placement ID"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                  />
                </div>
                {placementStatus?.isFull && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">
                    This member already has all 6 direct positions occupied.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Placement
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <MapPin className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <select
                    name="placementPosition"
                    value={formData.placementPosition}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white text-sm md:text-base outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0c0d12] text-neutral-400">
                      Please Select Position
                    </option>
                    {[1, 2, 3, 4, 5, 6].map((hand) => {
                      const isOccupied = placementStatus?.occupiedPositions?.includes(hand);
                      return (
                        <option
                          key={hand}
                          value={hand}
                          disabled={isOccupied}
                          className="bg-[#0c0d12] text-white disabled:text-neutral-500"
                        >
                          Hand {hand} {isOccupied ? '(Occupied)' : '(Available)'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: NID & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  NID
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <CreditCard className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type="text"
                    name="nidNumber"
                    value={formData.nidNumber}
                    onChange={handleChange}
                    placeholder="NID No"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <Lock className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
            </div>

            {/* Grid 2 Columns: Confirm Password (Left) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-xs md:text-sm font-bold text-[#dfb248] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center bg-[#07080c] border border-neutral-800 rounded-xl px-4 py-3.5 focus-within:border-[#dfb248] transition-all">
                  <Lock className="size-5 text-[#dfb248] mr-3 shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full bg-transparent text-white placeholder:text-neutral-500 text-sm md:text-base outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-neutral-400 hover:text-amber-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: ALREADY USER? LOGIN (Left) & SIGN UP Button (Right) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-5 border-t border-neutral-800/80">
              <div className="text-xs md:text-sm font-semibold tracking-wide text-neutral-400">
                ALREADY USER?{' '}
                <Link
                  href="/login"
                  className="text-[#dfb248] hover:text-amber-200 font-bold underline-offset-4 hover:underline transition-colors uppercase ml-1"
                >
                  LOGIN
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest text-black bg-gradient-to-r from-[#dfb248] via-[#fae69e] to-[#c29633] hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(223,178,72,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    CREATING ACCOUNT...
                  </>
                ) : (
                  'SIGN UP'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
