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

      {/* 2. ABS Dream (Vision & Goals) */}
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

      {/* 3. Seba & Healthcare Benefits Section */}
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

            <div className="bg-card border border-border p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="border border-primary/20 bg-background/50 rounded-2xl p-6 relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ABS Healthcare Net</p>
                    <h3 className="font-bold text-lg text-primary tracking-wide">DIGITAL SEBA CARD</h3>
                  </div>
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex justify-between items-end border-t border-border pt-4 text-xs text-muted-foreground">
                  <div>
                    <p className="font-bold text-foreground">MEMBER ID</p>
                    <p>ABS-XXXX-XXXX</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">STATUS</p>
                    <p className="text-green-500 font-semibold">ACTIVE</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Activate Your Seba Card
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MLM & Business Plan Opportunity */}
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

      {/* 5. ABS Shops & Network Section */}
      <section className="py-20">
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

    </div>
  );
}


