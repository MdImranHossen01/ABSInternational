import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  ShoppingBag, 
  Activity, 
  Users, 
  Gift, 
  Wallet, 
  CheckCircle2, 
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us | ABS International MLM & Service Platform',
  description: 'Welcome to ABS International - your trusted partner in health, beauty and wellness. Explore our innovative MLM ecosystem, direct e-commerce, digital Seba Card benefits, and community-driven healthcare initiatives.',
};

async function getSettings() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne().lean();
    if (!settings) {
      return {
        brandName: "ABS International",
        contact: {
          email: "support@absinternational.com",
          phone: "+8801234567890",
          address: "Dhaka, Bangladesh"
        }
      };
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error fetching settings for about page:', error);
    return null;
  }
}

export default async function AboutPage() {
  const settings = await getSettings();
  const brandName = settings?.brandName || "ABS International";

  const pillars = [
    {
      icon: <Activity className="h-6 w-6 text-emerald-500" />,
      title: "Health & Herbal Wellness",
      desc: "100% pure and organic herbal food supplements, pure Sundarbans honey, black seed oil, and premium Ayurvedic formulations."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-amber-500" />,
      title: "Natural Beauty & Skincare",
      desc: "Herbal face serums, pure sandalwood-saffron packs, herbal hair oils, and all-natural products crafted to enhance your natural beauty."
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-blue-500" />,
      title: "Digital Seba Card",
      desc: "Monthly complimentary MBBS doctor consultations, up to 50% discount on partner lab tests, and 24/7 emergency ambulance support."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      title: "Empowering MLM Ecosystem",
      desc: "Opportunity to build financial independence with a 1,500 BDT joining package—featuring 15% direct sponsor bonus, 10-generation matching commission, and executive rank rewards."
    }
  ];

  const mlmHighlights = [
    { label: "Joining Package", value: "1,500 BDT", sub: "Product Value Included" },
    { label: "Distributed Commission", value: "34.5% (517 BDT)", sub: "Transparent Split to 8 Funds" },
    { label: "Sponsor Direct Bonus", value: "15% (225 BDT)", sub: "Instant Wallet Payout" },
    { label: "Generation Bonus", value: "Up to 10 Levels", sub: "Deep Passive Earnings" }
  ];

  const ranks = [
    { rank: "Premium Member", req: "1,500 BDT Package Purchase", reward: "Digital Seba Card + Platform Access" },
    { rank: "Team Manager", req: "6 Direct Active Members", reward: "200 BDT + Free Seba Card Renewal" },
    { rank: "Royal Manager", req: "6 Team Managers", reward: "1,000 BDT + Executive Buffet Lunch" },
    { rank: "Silver Manager", req: "6 Royal Managers", reward: "6,000 BDT + Executive Buffet Lunch" },
    { rank: "Gold Manager", req: "6 Silver Managers", reward: "Branded Smartphone + 10,000 BDT Incentive" },
    { rank: "Diamond Manager", req: "6 Gold Managers", reward: "Motorbike + Cox's Bazar Tour + 35,000 BDT" },
    { rank: "Crown Manager", req: "6 Diamond Managers", reward: "Private Car + Luxury Tour + 120,000 BDT" },
    { rank: "Director", req: "6 Crown Managers", reward: "Luxury Flat + Umrah Hajj + 200,000 BDT + 2% Company Share" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-28 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-primary/15 text-primary mb-6 shadow-sm border border-primary/20">
            <Sparkles className="h-4 w-4" /> Welcome to ABS International
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Your Trusted Partner in <br />
            <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Health, Beauty & Financial Freedom
            </span>
          </h1>
          <p className="text-muted-foreground text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            <strong className="text-foreground">{brandName}</strong> is an innovative multi-level marketing (MLM), e-commerce, and community service platform. We are dedicated to promoting family wellness through premium herbal & healthcare products while creating sustainable avenues for financial independence.
          </p>

          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-8">
            <Link href="/register">
              <Button size="lg" className="rounded-xl px-4 sm:px-8 py-5 sm:py-6 font-bold text-sm sm:text-base shadow-lg shadow-primary/25 hover:scale-105 transition-all whitespace-nowrap">
                Join As Member <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="rounded-xl px-4 sm:px-8 py-5 sm:py-6 font-bold text-sm sm:text-base hover:bg-card whitespace-nowrap">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Financial Metrics Strip */}
      <section className="py-10 bg-card/60 border-b border-border backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {mlmHighlights.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-1">
                <p className="text-2xl md:text-3xl font-black text-primary">{stat.value}</p>
                <p className="text-sm font-bold text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Company & Vision / ABS Dream */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                <Building2 className="h-4 w-4" /> Company Overview
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                Empowering Communities Through Health, Wellness & Entrepreneurship
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                ABS International was founded with the mission to safeguard community health and empower individuals through their skills and network to build independent careers. Our product catalog features certified natural Ayurvedic remedies, dietary supplements, organic skincare, and daily lifestyle essentials.
              </p>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Members can launch their entrepreneurial journey by acquiring our 1,500 BDT starter package. A transparent 34.5% (517 BDT) from each package is systematically distributed into sponsor bonuses, 10-generation matching funds, auto-profit matrices, royalty pools, and community charity funds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-card border border-border flex gap-3">
                  <HeartHandshake className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Our Mission</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      To deliver wellness to every household through natural healthcare products and nurture self-reliant entrepreneurs across the nation.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex gap-3">
                  <Award className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">ABS Dream (Vision)</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      To emerge as the most trusted direct-selling e-commerce and social networking ecosystem in Bangladesh.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card via-card/80 to-primary/10 p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                  ABS
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">ABS Ecosystem</h3>
                  <p className="text-xs text-muted-foreground">Health • Commerce • Healthcare Seba</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold">ABS Shops & Premium Products</span>
                  </div>
                  <span className="text-xs font-bold text-primary">100% Organic</span>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-semibold">Digital Healthcare Seba Card</span>
                  </div>
                  <span className="text-xs font-bold text-blue-500">Free Doctor / 50% Lab</span>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-semibold">Automated Multi-Fund Wallet</span>
                  </div>
                  <span className="text-xs font-bold text-purple-500">8 Transparent Pools</span>
                </div>

                <div className="p-4 rounded-xl bg-background/80 border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="h-5 w-5 text-rose-500" />
                    <span className="text-sm font-semibold">1% Charity Fund Allocation</span>
                  </div>
                  <span className="text-xs font-bold text-rose-500">15 TK per Package</span>
                </div>
              </div>

              <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
                Registered MLM & E-Commerce Service Platform • Dhaka, Bangladesh
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Our Core Pillars of Service
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              The four foundational pillars defining the success, reliability, and excellence of ABS International.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-background border border-border shadow-sm space-y-4 hover:-translate-y-1.5 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rank Hierarchy Summary */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">
              <Award className="h-4 w-4" /> Career & Growth Path
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Rank Development & Promotion Hierarchy
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              A transparent, merit-based career ranking and reward structure designed to honor your hard work and leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ranks.map((r, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                    Step 0{i + 1}
                  </span>
                  <Award className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-bold text-base text-foreground">{r.rank}</h3>
                <div className="space-y-1.5 pt-1 text-xs">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Requirement:</strong> {r.req}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    <strong className="text-foreground">Reward:</strong> {r.reward}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seba Card Feature Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                <Stethoscope className="h-4 w-4" /> ABS Digital Seba Card
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Exclusive Healthcare Benefits for Every Active Member
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                ABS International goes beyond business—we safeguard your family's health and wellness. Upon activating your membership, your Digital Seba Card grants you free monthly MBBS doctor consultations and up to 50% discounts across partner diagnostic labs nationwide.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free Monthly MBBS Consultation
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 50% Lab & Diagnostic Discount
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 50% Emergency Ambulance Hotline
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-xs aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-900 p-5 shadow-2xl border border-emerald-400/30 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase opacity-80">Health Benefit</p>
                    <h4 className="text-base font-black tracking-wide">DIGITAL SEBA CARD</h4>
                  </div>
                  <Stethoscope className="h-6 w-6 text-emerald-200" />
                </div>
                <div>
                  <p className="font-mono text-xs tracking-wider opacity-90">ABS-SEBA-XXXXXX</p>
                  <p className="text-[9px] text-emerald-200 mt-1">Valid For Registered ABS Members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight text-foreground">
            Start Your Journey with ABS International Today
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Join thousands of individuals experiencing better health, exclusive healthcare benefits, and genuine financial independence.
          </p>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl px-4 sm:px-8 py-5 sm:py-6 font-bold text-sm sm:text-base shadow-xl shadow-primary/25 hover:scale-105 transition-all whitespace-nowrap">
                Register as Member <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-xl px-4 sm:px-8 py-5 sm:py-6 font-bold text-sm sm:text-base hover:bg-card whitespace-nowrap">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
