/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next';
import { 
  ArrowRight,
  Target, 
  Eye, 
  ShieldCheck, 
  MapPin, 
  Award, 
  HeartHandshake, 
  Stethoscope, 
  Heart, 
  Truck, 
  Store
} from 'lucide-react';
import Link from 'next/link';
import { getCachedSettings } from '@/lib/data-fetching';
import HeroBanner from '@/components/storefront/HeroBanner';
import { AtAGlance } from '@/components/storefront/AtAGlance';
import { CounterSection } from '@/components/storefront/CounterSection';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSettings();
  const brandName = settings?.brandName || 'ABS International';
  const metaTitle = settings?.metaTitle || `${brandName} | MLM & Service Platform`;
  const description = settings?.metaDescription || settings?.siteDescription || 'Your trusted partner in health, beauty and wellness.';

  return {
    title: metaTitle,
    description,
    openGraph: {
      title: brandName,
      description,
      type: 'website',
    },
  };
}

export default async function Home() {
  const settings = await getCachedSettings();
  const brandName = settings?.brandName || 'ABS International';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      
      {/* 1. Hero Section */}
      <HeroBanner brandName={brandName} />

      {/* 2. EXACT At A Glance Section from taffoodproducts */}
      <AtAGlance brandName={brandName} />

      {/* 3. ABS Dream (Vision & Goals) */}
      <section className="py-20 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              ABS Dream: Vision & Goals
            </h2>
            <p className="text-muted-foreground">
              Our ultimate path towards building a sustainable, supportive, and rewarding ecosystem for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vision */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Empowering individuals across the country to achieve absolute financial independence while prioritizing wellness and health through natural, high-quality products.
              </p>
            </div>

            {/* Goals */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Our Goal</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                To build an extensive, interconnected network of active members supported by solid healthcare privileges, lifestyle rewards, and a transparent system.
              </p>
            </div>

            {/* Trust & Transparency */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Core Values</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Upholding integrity, security, and absolute transparency in every transaction. Providing equal opportunities for everyone to grow and secure their family's future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seba & Healthcare Benefits Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-primary tracking-wide uppercase">Exclusive Healthcare Benefit</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-6">
                Digital Seba Card Benefits
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We believe health is the greatest wealth. Upon joining as a premium member, you receive a digital Seba Card that grants you access to essential medical and healthcare discounts.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-1">Free Doctor Consultations</h4>
                    <p className="text-muted-foreground text-sm">Get 1 free MBBS Doctor Consultation booking or digital voucher every month.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-1">50% Diagnostic Discount</h4>
                    <p className="text-muted-foreground text-sm">Enjoy up to 50% discount on lab reports, diagnostic tests, and health screenings at partner centers.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-1">Emergency Ambulance Service</h4>
                    <p className="text-muted-foreground text-sm">Avail 50% discount on emergency ambulance bookings with dedicated hotline support.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col items-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Realistic Physical Card Mockup with 3D perspective */}
              <div className="w-full max-w-md relative z-10 transition-transform duration-500 hover:scale-[1.02] hover:-rotate-1">
                {/* Physical Card Body */}
                <div className="relative aspect-[1.586/1] w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden text-white border border-white/20 bg-gradient-to-br from-slate-950 via-emerald-950 to-primary flex flex-col justify-between select-none">
                  {/* Glassmorphic & Light Flare Effects */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_50%)] pointer-events-none" />
                  <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-primary/30 blur-2xl pointer-events-none" />
                  
                  {/* Subtle Geometric Background Pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Card Header: Brand & Contactless Icon */}
                  <div className="relative flex justify-between items-start z-10">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md p-1.5 border border-white/20 flex items-center justify-center shadow-md">
                        <Heart className="h-full w-full text-emerald-300 fill-emerald-300" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest text-emerald-300 uppercase leading-tight font-mono">ABS HEALTHCARE</p>
                        <h4 className="text-xs sm:text-sm font-extrabold tracking-wide text-white uppercase drop-shadow-sm font-logo">SEBA PLATINUM CARD</h4>
                      </div>
                    </div>

                    {/* Contactless / NFC Waves Symbol */}
                    <div className="flex items-center gap-1.5 opacity-90">
                      <svg className="w-5 h-5 text-emerald-200 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 10a10 10 0 0 1 20 0" />
                        <path d="M6 14a6 6 0 0 1 12 0" />
                        <path d="M10 18a2 2 0 0 1 4 0" />
                      </svg>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-200">VIP</span>
                    </div>
                  </div>

                  {/* Card Mid: Realistic Golden EMV Chip & QR Code */}
                  <div className="relative flex items-center justify-between z-10 my-1">
                    {/* Metallic Golden EMV Smart Chip */}
                    <div className="w-11 h-9 sm:w-13 sm:h-10 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-0.5 shadow-md border border-amber-300/60 relative overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full border border-amber-800/40 rounded-[3px] flex flex-col justify-around py-0.5 px-1">
                        <div className="w-full h-[1px] bg-amber-800/30" />
                        <div className="flex justify-between">
                          <div className="w-2 h-2 rounded-full border border-amber-800/40" />
                          <div className="w-2 h-2 rounded-full border border-amber-800/40" />
                        </div>
                        <div className="w-full h-[1px] bg-amber-800/30" />
                      </div>
                    </div>

                    {/* Security Hologram badge */}
                    <div className="flex items-center gap-1 text-[9px] font-mono tracking-widest text-emerald-200/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                      <span>HEALTHCARE 24/7</span>
                    </div>
                  </div>

                  {/* Card Footer: Embossed Card Number, Holder Info & Status */}
                  <div className="relative z-10 space-y-2">
                    {/* Embossed VIP Member ID */}
                    <div className="font-mono text-sm sm:text-base tracking-[0.25em] text-white/95 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      8801 • 9420 • 7831 • 2026
                    </div>

                    <div className="flex justify-between items-end pt-1 border-t border-white/10 text-white">
                      <div>
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-200/80 font-mono">Card Holder</p>
                        <p className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-white font-mono">PREMIUM MEMBER</p>
                      </div>

                      <div className="text-center">
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-200/80 font-mono">Valid Thru</p>
                        <p className="text-[11px] sm:text-xs font-bold tracking-wider text-white font-mono">12/29</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-emerald-200/80 font-mono">Status</p>
                        <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action button under physical card */}
              <div className="mt-8 text-center relative z-10">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center gap-2 text-sm font-bold bg-primary text-primary-foreground px-6 py-2.5 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 transition-all"
                >
                  Activate Your Seba Card
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MLM & Business Plan Opportunity */}
      <section className="py-20 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold text-primary tracking-wide uppercase">Earn & Grow</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2 mb-4">
              Our Lucrative Business Plan
            </h2>
            <p className="text-muted-foreground">
              A fair, rewarding, and highly structural commission distribution model designed to support active promoters and builders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Package */}
            <div className="bg-card border border-border p-6 rounded-2xl text-center">
              <h4 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Joining Package</h4>
              <p className="text-3xl font-extrabold text-primary mb-4">1,500 BDT</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Join our platform by purchasing the standard product package to unlock all earning opportunities.
              </p>
            </div>

            {/* Sponsor Bonus */}
            <div className="bg-card border border-border p-6 rounded-2xl text-center">
              <h4 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Sponsor Bonus</h4>
              <p className="text-3xl font-extrabold text-primary mb-4">15%</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Earn 225 BDT instantly for every premium member you directly refer to ABS International.
              </p>
            </div>

            {/* Generation Bonus */}
            <div className="bg-card border border-border p-6 rounded-2xl text-center">
              <h4 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Generation Bonus</h4>
              <p className="text-3xl font-extrabold text-primary mb-4">10 Levels</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Earn residual commissions down to 10 generations of your growing downline network.
              </p>
            </div>

            {/* Global Profit Share */}
            <div className="bg-card border border-border p-6 rounded-2xl text-center">
              <h4 className="text-sm uppercase font-semibold text-muted-foreground mb-2">Global Profit Share</h4>
              <p className="text-3xl font-extrabold text-primary mb-4">2% Pool</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Share from the 2% company-wide profit pool distributed regularly among qualified members.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-card border border-border p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Social Contribution</h4>
                <p className="text-sm text-muted-foreground">1% of all joining packages is allocated to our Charity Fund for orphans and underprivileged people.</p>
              </div>
            </div>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shrink-0"
            >
              Start Earning Today
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ABS Shops & Network Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-sm font-bold text-primary tracking-wide uppercase">Physical Network</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                ABS Shops & Distribution Networks
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We are not just digital; we are physically grounded. ABS International operates local shops, outlets, and distribution centers across various regions to ensure seamless product delivery and client support.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">Regional Outlets</span>
                </div>
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">Distribution Hubs</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">Secure Pickups</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">Fast Delivery Networks</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/40 border border-border p-8 rounded-3xl flex flex-col justify-center items-center text-center py-16">
              <Store className="h-16 w-16 text-primary/80 mb-6" />
              <h3 className="text-xl font-bold mb-2">Locate an ABS Shop Near You</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Explore our growing network of outlets. Purchase membership packages or pickup products directly from our distribution centers.
              </p>
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-accent transition-all"
              >
                Browse Shop Locations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Counter Section (Right above Footer) */}
      <CounterSection />

    </div>
  );
}
