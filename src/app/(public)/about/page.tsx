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
      desc: "১০০% খাঁটি ও অর্গানিক ভেষজ ফুড সাপ্লিমেন্ট, খাঁটি সুন্দরবনের মধু, কালোজিরা তেল, এবং প্রিমিয়াম আয়ুর্বেদিক উপাদান।"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-amber-500" />,
      title: "Natural Beauty & Skincare",
      desc: "ভেষজ ফেস সিরাম, খাঁটি চন্দন-জাফরান প্যাক, হারবাল তেল এবং প্রাকৃতিক উপাদান দ্বারা ত্বকের লাবণ্য বৃদ্ধির সামগ্রী।"
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-blue-500" />,
      title: "Digital Seba Card",
      desc: "সদস্যদের জন্য প্রতি মাসে ফ্রি MBBS ডাক্তার কনসালটেশন, পার্টনার ল্যাব টেস্টে ৫০% ছাড় এবং জরুরি অ্যাম্বুলেন্স ডিসকাউন্ট।"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
      title: "Empowering MLM Ecosystem",
      desc: "মাত্র ১,৫০০ টাকার জয়েনিং প্যাকেজে স্বাবলম্বী হওয়ার সুযোগ—১৫% স্পন্সর বোনাস, ১০ জেনারেশন কমিশন ও র‍্যাঙ্ক রিওয়ার্ড।"
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
            <strong className="text-foreground">{brandName}</strong> একটি আধুনিক মাল্টি-লেভেল মার্কেটিং (MLM), ই-কমার্স ও সামাজিক সেবা প্ল্যাটফর্ম। আমরা মানসম্মত ভেষজ ও স্বাস্থ্যসেবা পণ্যের মাধ্যমে লাখো মানুষের সুস্থতা নিশ্চিত করার পাশাপাশি টেকসই আর্থিক স্বাবলম্বিতা তৈরি করছি।
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <Link href="/register">
              <Button size="lg" className="rounded-xl px-8 py-6 font-bold text-base shadow-lg shadow-primary/25 hover:scale-105 transition-all">
                Join As Member <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 font-bold text-base hover:bg-card">
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
                ABS International প্রতিষ্ঠিত হয়েছে সাধারণ মানুষের স্বাস্থ্য সুরক্ষা ও তাদের মেধা ও নেটওয়ার্ককে কাজে লাগিয়ে একটি স্বাধীন কর্মসংস্থান সৃষ্টির লক্ষ্য নিয়ে। আমাদের পণ্য সম্ভারে রয়েছে প্রাকৃতিক আয়ুর্বেদিক ওষুধ, হেলথ সাপ্লিমেন্ট, ন্যাচারাল স্কিনকেয়ার এবং দৈনন্দিন লাইফস্টাইল পণ্য।
              </p>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                আমাদের প্ল্যাটফর্মে একজন সদস্য মাত্র ১,৫০০ টাকার প্যাকেজ গ্রহণ করে নিজের ব্যবসা শুরু করতে পারেন। প্রতিটি প্যাকেজের ৩৪.৫% (৫১৭ টাকা) স্বয়ংক্রিয়ভাবে স্পন্সর বোনাস, ১০ জেনারেশন ফান্ড, অটো প্রফিট ম্যাট্রিক্স, রয়্যালটি ও চ্যারিটি ফান্ডে স্বচ্ছভাবে বণ্টিত হয়।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-card border border-border flex gap-3">
                  <HeartHandshake className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Our Mission</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      প্রাকৃতিক পণ্য ও স্বাস্থ্যসেবার মাধ্যমে প্রতিটি পরিবারে সুস্থতা পৌঁছে দেওয়া এবং উদ্যোক্তা তৈরি করা।
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex gap-3">
                  <Award className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">ABS Dream (Vision)</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      বাংলাদেশের সর্বাধিক বিশ্বস্ত ই-কমার্স ও সোশ্যাল নেটওয়ার্কিং প্ল্যাটফর্ম হিসেবে প্রতিষ্ঠা লাভ করা।
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
              যে চারটি প্রধান ভিত্তির উপর দাঁড়িয়ে আছে ABS International-এর সাফল্য ও গ্রহণযোগ্যতা।
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
              আপনার মেধা ও পরিশ্রমের যথাযথ মূল্যায়নে আমাদের রয়েছে স্বচ্ছ ও চমৎকার ক্যারিয়ার র‍্যাঙ্কিং রিওয়ার্ড সিস্টেম।
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
                ABS International কেবল ব্যবসার সুযোগই নয়, আপনার পরিবারের সুস্বাস্থ্যের নিশ্চয়তা দেয়। মেম্বারশিপ অ্যাক্টিভেশনের সাথে সাথে পাওয়া ডিজিটাল সেবা কার্ডের মাধ্যমে আপনি পাবেন মাসিক ফ্রি ডাক্তার পরামর্শ ও দেশের শীর্ষ ল্যাব সমূহে ৫০% ছাড়।
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
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl px-8 py-6 font-bold text-base shadow-xl shadow-primary/25 hover:scale-105 transition-all">
                Register as Premium Member <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 font-bold text-base hover:bg-card">
                Contact Our Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
