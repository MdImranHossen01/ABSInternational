import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Award,
  Sparkles,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Crown,
  Target,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Our Executive Leadership & Team | ABS International',
  description: 'Meet the visionary leaders, directors, health experts, and management team driving ABS International forward in health, wellness, and community empowerment.',
};

export default function TeamPage() {
  const leadership = [
    {
      name: "Md. Nazim Uddin",
      role: "Chairman",
      badge: "Honorable Chairman",
      bio: "Guiding the strategic vision and ethical governance of ABS International to build a transparent and sustainable community empowerment platform.",
      image: "/assets/images/Executive/Md.-Nazim-Uddin-Chairman.webp",
      email: "chairman@absinternationalltd.com",
      phone: "+880 1728-268550"
    },
    {
      name: "Md. Shamim Islam",
      role: "Managing Director & CEO",
      badge: "Managing Director",
      bio: "Leading ABS International into Bangladesh's foremost welfare platform through visionary corporate leadership and over 10+ years of network ecosystem management.",
      image: "/assets/images/Executive/Md.-Shamim-Islam-Managing-Director.webp",
      email: "md@absinternationalltd.com",
      phone: "+880 1881-060734"
    },
    {
      name: "Dr. Farhana Yasmin (MBBS, MPH)",
      role: "Chief Medical & Healthcare Advisor",
      badge: "Director of Health Seba",
      bio: "Public health specialist and seasoned clinician overseeing the ABS Digital Seba Card healthcare program, telemedicine partnerships, and strict herbal product QA.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
      email: "health@absinternational.com",
      phone: "+880 1700-000003"
    },
    {
      name: "Sharif Ahmed Chowdhury",
      role: "Director of Operations & Supply Chain",
      badge: "Head of Operations",
      bio: "Directing nationwide fulfillment hubs, courier integrations, and swift product logistics across all regional ABS distribution centers.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
      email: "operations@absinternational.com",
      phone: "+880 1700-000004"
    }
  ];

  const managementTeam = [
    {
      name: "Kazi Nazmul Huda",
      role: "Head of Finance & Accounts",
      desc: "Supervising automated multi-wallet split calculations, fund reconciliations, and daily financial audit checks.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80"
    },
    {
      name: "Nusrat Jahan Rimi",
      role: "Head of Customer Relations & KYC",
      desc: "Managing member NID verification queues, digital Seba Card issuance, and 24/7 client support desk.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80"
    },
    {
      name: "Rakibul Islam",
      role: "Senior IT & Systems Lead",
      desc: "Overseeing server performance, database concurrency security, and real-time bonus payout engine.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80"
    },
    {
      name: "Sumaiya Akhter",
      role: "Product Quality & Research Officer",
      desc: "Coordinating organic herbal quality benchmarks, lab certifications, and natural beauty skincare formulations.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80"
    }
  ];

  const coreValues = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Integrity & Transparency",
      desc: "Ensuring 100% honesty, audit trails, and automated real-time accuracy across every bonus distribution."
    },
    {
      icon: <Crown className="h-6 w-6 text-amber-500" />,
      title: "Leadership Empowerment",
      desc: "Equipping our member network with structured growth paths, rank incentives, and life-changing career rewards."
    },
    {
      icon: <Target className="h-6 w-6 text-blue-500" />,
      title: "Quality First Approach",
      desc: "Delivering only clinically validated, 100% pure organic herbal formulas and trusted healthcare privileges."
    },
    {
      icon: <Award className="h-6 w-6 text-emerald-500" />,
      title: "Community Welfare",
      desc: "Dedicating 1% of all packages to our Charity Fund and making quality medical healthcare accessible to all."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header / Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-28 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Meet Our <span className="bg-gradient-to-r from-primary via-emerald-600 to-teal-500 bg-clip-text text-transparent">Executive Leaders</span> & Experts
          </h1>
          <p className="text-muted-foreground text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Guided by seasoned healthcare specialists, corporate leaders, and dedicated operations professionals, ABS International is pioneering sustainable wellness and community empowerment.
          </p>
        </div>
      </section>

      {/* Leadership Board */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">

            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Executive Leadership
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              The strategic minds guiding the vision and expansion of ABS International nationwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((member, idx) => (
              <div
                key={idx}
                className="group relative bg-card rounded-3xl border border-border overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 flex flex-col"
              >
                {/* Photo container */}
                <div className="relative aspect-[4/4] w-full overflow-hidden bg-muted">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/90 text-primary-foreground backdrop-blur-md shadow-md">
                      {member.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold leading-snug">{member.name}</h3>
                    <p className="text-xs text-primary-foreground/90 font-medium">{member.role}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>

                  <div className="pt-4 border-t border-border/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      <a href={`mailto:${member.email}`}>{member.email}</a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <a href={`tel:${member.phone}`}>{member.phone}</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Operational Management */}
      <section className="py-16 md:py-24 bg-card/40 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Operations & Management Team
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Dedicated professionals managing daily operations, member support, and seamless nationwide logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementTeam.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-background border border-border shadow-sm flex flex-col items-center text-center space-y-4 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-md">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">{member.name}</h4>
                  <p className="text-xs font-semibold text-primary">{member.role}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values / Work Culture */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Work Ethics
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Principles That Guide Our Team
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Integrity, professionalism, and community welfare are at the core of everything we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {val.icon}
                </div>
                <h3 className="font-bold text-base text-foreground">{val.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="py-20 text-center relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background border-t border-border">
        <div className="container mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight text-foreground">
            Want to Work with Our Dynamic Team?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Become an active member of the ABS International family and build a prosperous, self-reliant future.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="rounded-xl px-8 py-6 font-bold text-base shadow-xl shadow-primary/25 hover:scale-105 transition-all">
                Join As Member Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 font-bold text-base hover:bg-card">
                Contact Corporate Office
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
