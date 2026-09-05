import { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldCheck, 
  Info, 
  Share2, 
  Lock, 
  Eye, 
  Bell, 
  CreditCard, 
  UserCheck, 
  Database, 
  Stethoscope, 
  HeartHandshake 
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | ABS International',
  description: 'Privacy Policy and Data Protection guidelines for ABS International e-commerce, MLM network, and Seba healthcare platform.',
};

async function getSettings() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne().lean();
    if (!settings) {
      return {
        brandName: 'ABS International',
        contact: {
          email: 'support@absinternationalltd.com',
          phone: '+880 1800-000000',
        },
      };
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error fetching settings for privacy page:', error);
    return {
      brandName: 'ABS International',
      contact: {
        email: 'support@absinternationalltd.com',
        phone: '+880 1800-000000',
      },
    };
  }
}

export default async function PrivacyPage() {
  const settings = await getSettings();
  const brandName = settings.brandName || 'ABS International';
  const contactEmail = settings.contact?.email || 'support@absinternationalltd.com';
  const lastUpdated = 'September 2026';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            At {brandName}, your privacy and data security are our top priorities. This policy outlines how we collect, store, verify, and protect your personal, financial, and network information.
          </p>
          <div className="mt-6 inline-block bg-muted/60 px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Effective Date &bull; {lastUpdated}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12 text-foreground/90">

            {/* 1. Introduction */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">1. Introduction & Scope</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy applies to all users of <strong className="text-foreground">{brandName}</strong>, including public shoppers, registered customers, affiliate members, and Seba benefit recipients. By accessing our web application, mobile app, or related digital services, you consent to the data collection and processing methods described herein.
              </p>
            </div>

            <Separator />

            {/* 2. Information We Collect */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">2. Information We Collect</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To deliver our e-commerce store, affiliate MLM engine, secure wallets, and Seba healthcare features, we collect several categories of information:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl border bg-card/60 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-base">
                    <UserCheck className="h-5 w-5" />
                    <span>Identity & Profile Data</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Full name, email address, contact phone number, delivery address, Sponsor ID, and account profile credentials.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border bg-card/60 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-base">
                    <ShieldCheck className="h-5 w-5" />
                    <span>KYC & Government Verification</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    National ID (NID) number and encrypted NID card photos for member authentication, anti-fraud compliance, and payout validation.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border bg-card/60 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-base">
                    <CreditCard className="h-5 w-5" />
                    <span>Financial & Payout Details</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    bKash, Nagad, Rocket phone numbers, bank account numbers, transaction hashes, and deposit/withdrawal histories. (Encrypted PINs are never stored in plaintext).
                  </p>
                </div>

                <div className="p-5 rounded-2xl border bg-card/60 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-base">
                    <Database className="h-5 w-5" />
                    <span>MLM & Ledger Activity</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sponsor referrals, downline generation tree connections, rank progression logs, wallet transaction ledgers, and commission statements.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border bg-card/60 space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-base">
                    <Stethoscope className="h-5 w-5" />
                    <span>Digital Seba Card & Healthcare Records</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Seba Card membership ID, doctor consultation appointment requests, diagnostic discount voucher redemptions, and ambulance helpline logs.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 3. How We Use Your Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">3. How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2 sm:pl-4">
                <li><strong className="text-foreground">Order & Delivery Fulfillment:</strong> To process product orders, calculate courier charges, generate delivery invoices, and dispatch packages via courier APIs.</li>
                <li><strong className="text-foreground">Automated Commission & MLM Ledger Calculations:</strong> To distribute Sponsor Bonuses, Generation Bonuses, Auto Profit pools, and rank incentives accurately.</li>
                <li><strong className="text-foreground">KYC Compliance & Anti-Fraud Security:</strong> To verify genuine identities, prevent multi-account manipulations, and ensure safe financial withdrawals.</li>
                <li><strong className="text-foreground">Healthcare & Partner Services:</strong> To validate digital Seba vouchers with partner diagnostic centers and medical professionals.</li>
                <li><strong className="text-foreground">Account Notifications:</strong> To provide SMS or email alerts regarding wallet transactions, downline achievements, and order updates.</li>
              </ul>
            </div>

            <Separator />

            {/* 4. Data Sharing & Third Parties */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Share2 className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">4. Third-Party Data Sharing Policy</h2>
              </div>
              <div className="p-4 rounded-xl border bg-primary/5 text-sm leading-relaxed text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">
                  We do NOT sell, rent, or trade your personal or financial data to any third-party marketing companies.
                </p>
                <p>Data is strictly shared on a need-to-know basis with:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li><strong className="text-foreground">Logistics Partners:</strong> Steadfast, Pathao, or Redx solely for shipping address label generation and parcel tracking.</li>
                  <li><strong className="text-foreground">Payment Gateways & MFS:</strong> SSLCommerz, bKash, Nagad, and Rocket for secure deposit validation.</li>
                  <li><strong className="text-foreground">Healthcare Partners:</strong> Affiliated hospitals and diagnostic centers solely to verify Seba Card eligibility upon presentation.</li>
                  <li><strong className="text-foreground">Legal & Regulatory Authorities:</strong> When required by the law enforcement agencies of Bangladesh.</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* 5. Data Security & Encryption */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">5. Data Security & Storage Architecture</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {brandName} implements bank-grade security protocols to protect your information:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl border bg-card/60 text-center space-y-1">
                  <div className="text-primary font-bold text-base">Atomic Ledgers</div>
                  <p className="text-xs text-muted-foreground">ACID-compliant database transactions preventing double-spending.</p>
                </div>
                <div className="p-4 rounded-xl border bg-card/60 text-center space-y-1">
                  <div className="text-primary font-bold text-base">KYC Document Encryption</div>
                  <p className="text-xs text-muted-foreground">Encrypted cloud storage for NID documents and ID proofs.</p>
                </div>
                <div className="p-4 rounded-xl border bg-card/60 text-center space-y-1">
                  <div className="text-primary font-bold text-base">HTTPS & SSL/TLS</div>
                  <p className="text-xs text-muted-foreground">End-to-end encrypted browser sessions across all pages.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 6. User Rights & Account Control */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">6. Your Rights & Account Controls</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access your personal profile, view your complete wallet transaction statement, change your account password, update your transaction PIN, and submit support tickets regarding any data inquiries.
              </p>
            </div>

            <Separator />

            {/* Contact / Help CTA */}
            <div className="bg-primary/5 p-8 sm:p-10 rounded-3xl text-center shadow-sm border border-primary/10">
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Data Privacy Inquiries</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                  If you have concerns about your data, KYC verification, or privacy practices, reach out directly to our Data Protection Officer.
                </p>
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <Link
                    href="/contact"
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all text-sm"
                  >
                    Contact Support
                  </Link>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="px-6 py-2.5 bg-card border font-semibold rounded-full hover:bg-muted transition-all text-sm text-foreground"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer disclaimer */}
      <footer className="bg-muted/40 py-8 border-t mt-auto text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved. Registered under laws of Bangladesh.</p>
        </div>
      </footer>
    </div>
  );
}
