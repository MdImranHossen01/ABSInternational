import { Metadata } from 'next';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  MessageCircleMore, 
  Stethoscope, 
  Users, 
  ShoppingBag, 
  Headphones, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Facebook, X, Instagram, Youtube } from '@/components/ui/social-icons';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | ABS International',
  description: 'Connect with ABS International for customer care, member support, Seba healthcare benefits, and corporate partnerships.',
};

async function getSettings() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne().lean();
    if (!settings) {
      return {
        brandName: "ABS International",
        contact: {
          email: "support@absinternationalltd.com",
          phone: "+880 1800-000000",
          address: "House #12, Road #04, Dhanmondi, Dhaka - 1205, Bangladesh"
        },
        socialLinks: {}
      };
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error fetching settings for contact page:', error);
    return null;
  }
}

export default async function ContactPage() {
  const settings = await getSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Information currently unavailable. Please try again later.</p>
      </div>
    );
  }

  const { contact = {}, socialLinks, brandName = "ABS International" } = settings as {
    contact?: { email?: string; phone?: string; address?: string };
    socialLinks?: { facebook?: string; twitter?: string; instagram?: string; youtube?: string };
    brandName?: string;
  };

  const mainPhone = contact?.phone || "+880 1800-000000";
  const mainEmail = contact?.email || "support@absinternationalltd.com";
  const mainAddress = contact?.address || "Dhaka, Bangladesh";

  const contactItems = [
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Direct Hotline",
      subtitle: "Customer & Orders",
      value: mainPhone,
      href: `tel:${mainPhone}`,
      label: "Call Now",
      isExternal: false
    },
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Support",
      subtitle: "General Inquiries",
      value: mainEmail,
      href: `mailto:${mainEmail}`,
      label: "Send Email",
      isExternal: false
    },
    {
      icon: <MessageCircleMore className="h-6 w-6 text-primary" />,
      title: "WhatsApp Helpline",
      subtitle: "Instant Messaging",
      value: mainPhone,
      href: `https://wa.me/${String(mainPhone).replace(/\D/g, '')}`,
      label: "Chat on WhatsApp",
      isExternal: true
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Corporate Office",
      subtitle: "Headquarters",
      value: mainAddress,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mainAddress)}`,
      label: "Get Directions",
      isExternal: true
    }
  ];

  const specializedDepartments = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Member & MLM Support",
      description: "Assistance with joining packages, sponsor placement, team generation trees, wallet transfers, and rank incentives.",
      actionText: "Open Support Ticket",
      actionLink: "/dashboard/support"
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
      title: "Digital Seba Healthcare Desk",
      description: "MBBS doctor appointment booking, 50% discount vouchers for partner diagnostic centers, and ambulance helpline.",
      actionText: "View Seba Services",
      actionLink: "/dashboard/seba"
    },
    {
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      title: "Orders & Delivery Logistics",
      description: "Track shipment statuses, courier delivery updates (Steadfast / Pathao / Redx), and product return queries.",
      actionText: "Track Your Order",
      actionLink: "/track-order"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "KYC & Security Verification",
      description: "National ID (NID) document submission support, payout account verification, and transaction PIN assistance.",
      actionText: "Manage KYC Profile",
      actionLink: "/dashboard/profile"
    }
  ];

  const socialItems = [
    { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, url: socialLinks?.facebook },
    { name: 'X', icon: <X className="h-5 w-5" />, url: socialLinks?.twitter },
    { name: 'Instagram', icon: <Instagram className="h-5 w-5" />, url: socialLinks?.instagram },
    { name: 'Youtube', icon: <Youtube className="h-5 w-5" />, url: socialLinks?.youtube },
  ].filter(item => item.url);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10 text-primary">
            <Headphones className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about {brandName} products, joining packages, affiliate income, or Seba healthcare privileges? Our dedicated support team is ready to help.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactItems.map((item, idx) => (
              <Card key={idx} className="border bg-card/60 hover:shadow-md transition-shadow">
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-base mb-0.5">{item.title}</h3>
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-3">{item.subtitle}</span>
                  <p className="text-xs text-muted-foreground mb-4 break-words max-w-[200px]">
                    {item.value}
                  </p>
                  <a
                    href={item.href || "#"}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-auto"
                  >
                    {item.label} <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="mb-16" />

          {/* Department Directory */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Specialized Support Helpdesks</h2>
              <p className="text-muted-foreground text-sm">
                Direct your queries to the appropriate department for prioritized and faster resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specializedDepartments.map((dept, idx) => (
                <div key={idx} className="p-6 rounded-2xl border bg-card/40 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        {dept.icon}
                      </div>
                      <h3 className="font-bold text-base text-foreground">{dept.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {dept.description}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={dept.actionLink}
                      className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                    >
                      {dept.actionText} &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="mb-16" />

          {/* Map and Office Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">Headquarters & Store Visit</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Visit our physical center to explore our health and beauty products, consult with support advisors, or meet with our affiliate managers.
                </p>
                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-sm border bg-muted">
                  <iframe
                    title="ABS International Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mainAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:pl-6">
              <div className="p-6 rounded-2xl border bg-card/60 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Clock className="h-6 w-6" />
                  <h4 className="font-bold text-lg text-foreground">Official Operating Hours</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Saturday - Thursday:</span>
                    <span className="font-semibold text-foreground">10:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Friday:</span>
                    <span className="font-semibold text-primary">Weekly Holiday (Online Support Active)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted-foreground">Emergency Ambulance Hotline:</span>
                    <span className="font-semibold text-emerald-600">24/7 Available</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base mb-3">Connect on Social Channels</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Follow {brandName} official channels for real-time announcements, product arrivals, and rank achiever events.
                </p>

                {socialItems.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {socialItems.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                        title={social.name}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">Official channels available soon.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/40 py-8 border-t mt-auto text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
