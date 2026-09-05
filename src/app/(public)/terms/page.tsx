import { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  ShoppingBag, 
  Truck, 
  UserCheck, 
  Scale, 
  HelpCircle, 
  ShieldCheck, 
  Award, 
  Wallet, 
  HeartHandshake, 
  Stethoscope, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | ABS International',
  description: 'Terms and Conditions, Membership Guidelines, MLM Compensation Rules, and Seba Healthcare Policies of ABS International.',
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
          address: 'Dhaka, Bangladesh',
        },
      };
    }
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error fetching settings for terms page:', error);
    return {
      brandName: 'ABS International',
      contact: {
        email: 'support@absinternationalltd.com',
        phone: '+880 1800-000000',
        address: 'Dhaka, Bangladesh',
      },
    };
  }
}

export default async function TermsPage() {
  const settings = await getSettings();
  const brandName = settings.brandName || 'ABS International';
  const contactEmail = settings.contact?.email || 'support@absinternationalltd.com';
  const contactPhone = settings.contact?.phone || '+880 1800-000000';
  const lastUpdated = 'September 2026';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Terms & <span className="text-primary">Conditions</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to {brandName}. These terms govern your general usage, e-commerce purchases, affiliate membership, compensation distribution, and Seba healthcare benefits.
          </p>
          <div className="mt-6 inline-block bg-muted/60 px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Last Updated &bull; {lastUpdated}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12 text-foreground/90">

            {/* 1. Introduction & Acceptance */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">1. Agreement to Terms & Platform Scope</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By visiting, browsing, registering an account, or purchasing products on <strong className="text-foreground">{brandName}</strong>, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. {brandName} operates an integrated multi-tiered ecosystem comprising:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2 sm:pl-4">
                <li>Direct E-commerce retail for health, beauty, and wellness products.</li>
                <li>Affiliate / Multi-Level Marketing (MLM) network opportunities for registered members.</li>
                <li>Digital Seba Healthcare and partner service benefits.</li>
              </ul>
            </div>

            <Separator />

            {/* 2. Membership, Joining Package & Activation */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">2. Membership & Joining Package Activation</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Customers may become a verified <strong className="text-foreground">Premium Member</strong> by purchasing the designated joining product package valued at <strong className="text-foreground">1,500 BDT</strong> or through qualifying direct product purchases.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border bg-card/60 space-y-1.5">
                  <h4 className="font-bold text-sm text-primary">Joining Package (1,500 BDT)</h4>
                  <p className="text-xs text-muted-foreground">Includes high-value health & beauty product package, instant affiliate network eligibility, and active Seba Card benefits.</p>
                </div>
                <div className="p-4 rounded-xl border bg-card/60 space-y-1.5">
                  <h4 className="font-bold text-sm text-primary">Sponsor Verification</h4>
                  <p className="text-xs text-muted-foreground">Every member requires a valid Sponsor ID upon registration. Sponsor assignments are permanent and non-transferable once linked.</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 3. Compensation Plan & Bonus Distribution */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">3. Compensation Plan & MLM Bonus Rules</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                From each 1,500 BDT joining package sale, <strong className="text-foreground">34.5% (517 BDT)</strong> is systematically allocated and distributed across 8 core funds as follows:
              </p>
              <div className="overflow-x-auto rounded-xl border bg-card/40">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 text-foreground font-semibold border-b">
                    <tr>
                      <th className="p-3">Fund / Bonus Name</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Amount (BDT)</th>
                      <th className="p-3">Distribution Criteria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-muted-foreground">
                    <tr>
                      <td className="p-3 font-medium text-foreground">Sponsor Bonus</td>
                      <td className="p-3">15.0%</td>
                      <td className="p-3">225 BDT</td>
                      <td className="p-3">Immediate credit to direct referrer</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Generation Bonus</td>
                      <td className="p-3">7.0%</td>
                      <td className="p-3">105 BDT</td>
                      <td className="p-3">Distributed across 10 generations (Gen 1: 40% down to Gen 10: 2%)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Auto Profit Pool</td>
                      <td className="p-3">3.5%</td>
                      <td className="p-3">52 BDT</td>
                      <td className="p-3">Auto-profit matrix pool (Tiers 1 to 10)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Global Profit Share</td>
                      <td className="p-3">2.0%</td>
                      <td className="p-3">30 BDT</td>
                      <td className="p-3">Shared equally among all active platform members</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Incentive Fund</td>
                      <td className="p-3">2.0%</td>
                      <td className="p-3">30 BDT</td>
                      <td className="p-3">Reserved for milestone & physical rewards</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Rank Development</td>
                      <td className="p-3">2.0%</td>
                      <td className="p-3">30 BDT</td>
                      <td className="p-3">Reserved for rank promotion payouts</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Royalty Fund</td>
                      <td className="p-3">2.0%</td>
                      <td className="p-3">30 BDT</td>
                      <td className="p-3">For Diamond, Crown, and Director tiers</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-foreground">Charity Fund</td>
                      <td className="p-3">1.0%</td>
                      <td className="p-3">15 BDT</td>
                      <td className="p-3">Dedicated to social aid and underprivileged support</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* 4. Rank Progression Hierarchy */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">4. Rank Progression & Incentive Milestones</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Rank promotions are automated upon satisfying downline structural requirements. Members must maintain active status to claim rank rewards:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 text-xs sm:text-sm">
                <li className="p-3.5 rounded-xl border bg-muted/20">
                  <span className="font-bold text-primary block mb-1">1. Team Manager</span>
                  6 Premium Members &bull; Reward: 200 BDT + Free Seba Card
                </li>
                <li className="p-3.5 rounded-xl border bg-muted/20">
                  <span className="font-bold text-primary block mb-1">2. Royal Manager</span>
                  6 Team Managers &bull; Reward: 1,000 BDT + Buffet Lunch
                </li>
                <li className="p-3.5 rounded-xl border bg-muted/20">
                  <span className="font-bold text-primary block mb-1">3. Silver Manager</span>
                  6 Royal Managers &bull; Reward: 6,000 BDT + Buffet Lunch
                </li>
                <li className="p-3.5 rounded-xl border bg-muted/20">
                  <span className="font-bold text-primary block mb-1">4. Gold Manager</span>
                  6 Silver Managers &bull; Reward: Smartphone + 10,000 BDT Incentive
                </li>
                <li className="p-3.5 rounded-xl border bg-muted/20">
                  <span className="font-bold text-primary block mb-1">5. Diamond Manager</span>
                  6 Gold Managers &bull; Reward: Motorbike + Cox&apos;s Bazar Tour + 15,000 BDT + 20,000 BDT Royalty
                </li>
                <li className="p-3.5 rounded-xl border bg-muted/20">
                  <span className="font-bold text-primary block mb-1">6. Crown Manager</span>
                  6 Diamond Managers &bull; Reward: Private Car + Cox&apos;s Bazar Tour + 20,000 BDT + 100,000 BDT Royalty
                </li>
                <li className="p-3.5 rounded-xl border bg-muted/20 sm:col-span-2">
                  <span className="font-bold text-primary block mb-1">7. Director (Top Tier)</span>
                  6 Crown Managers &bull; Reward: Flat + Umrah Hajj + 50,000 BDT Incentive + 150,000 BDT Royalty + 2% Company Share
                </li>
              </ul>
            </div>

            <Separator />

            {/* 5. Wallet System, PIN & Withdrawals */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">5. Wallet Operations, Security PIN & Withdrawals</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The platform operates a segregated multi-wallet system (Deposit Wallet, Available Bonus Balance, Withdrawal Wallet).
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2 sm:pl-4">
                <li><strong className="text-foreground">Security PIN / Rank Password:</strong> All member balance transfers and withdrawal submissions require authorization using your secure transaction PIN.</li>
                <li><strong className="text-foreground">Withdrawal Channels:</strong> Payouts are disbursed via verified bKash, Nagad, Rocket, or designated Bank accounts.</li>
                <li><strong className="text-foreground">Processing Schedule:</strong> Withdrawal requests are audited and processed within official working hours following administrative verification.</li>
                <li><strong className="text-foreground">Member Transfers:</strong> Wallet-to-wallet transfers between verified active members are instant and logged with permanent audit references.</li>
              </ul>
            </div>

            <Separator />

            {/* 6. KYC & NID Verification */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">6. KYC Compliance & National ID (NID) Policy</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                In compliance with regulatory standards and anti-fraud protocols, all members must complete <strong className="text-foreground">KYC Verification</strong> by providing valid National ID (NID) credentials. Unverified accounts may face limitations on withdrawal limits, wallet transfers, and rank prize disbursements.
              </p>
            </div>

            <Separator />

            {/* 7. Seba Healthcare Privileges */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">7. Digital Seba Healthcare & Service Benefits</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Every activated member receives access to the <strong className="text-foreground">Digital Seba Card</strong> benefits:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl border bg-card/60 text-center space-y-1">
                  <div className="text-primary font-bold text-lg">1 Free Consultation</div>
                  <p className="text-xs text-muted-foreground">Monthly MBBS Doctor consultation voucher.</p>
                </div>
                <div className="p-4 rounded-xl border bg-card/60 text-center space-y-1">
                  <div className="text-primary font-bold text-lg">50% Lab Discount</div>
                  <p className="text-xs text-muted-foreground">Diagnostic and lab tests at affiliated health partner centers.</p>
                </div>
                <div className="p-4 rounded-xl border bg-card/60 text-center space-y-1">
                  <div className="text-primary font-bold text-lg">50% Ambulance</div>
                  <p className="text-xs text-muted-foreground">Emergency ambulance discount voucher & helpline.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                *Seba vouchers are subject to partner facility availability and must be validated through your digital member dashboard.
              </p>
            </div>

            <Separator />

            {/* 8. E-Commerce, Shipping & Returns */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-primary shrink-0" />
                <h2 className="text-2xl font-bold tracking-tight">8. Product Orders, Shipping & Returns</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Orders placed through our store are fulfilled using registered logistics partners (e.g., Steadfast, Pathao, Redx).
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2 sm:pl-4">
                <li><strong className="text-foreground">Shipping Timeline:</strong> Deliveries inside Dhaka typically take 24–48 hours; outside Dhaka 48–96 hours.</li>
                <li><strong className="text-foreground">Delivery Charges:</strong> Calculated dynamically during checkout based on delivery destination.</li>
                <li><strong className="text-foreground">Return Eligibility:</strong> Items must be inspected upon delivery. Sealed health and cosmetic products can only be returned if damaged upon arrival or defective before opening.</li>
              </ul>
            </div>

            <Separator />

            {/* 9. Prohibited Conduct & Anti-Fraud */}
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 m-0">9. Anti-Fraud & Code of Conduct</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {brandName} maintains zero tolerance for fraudulent activities, including creating artificial fake accounts, cross-sponsoring manipulation, sharing deceptive income claims, or attempting unauthorized access to automated ledgers. Violations will result in immediate forfeiture of balances, rank cancellation, and permanent account termination.
              </p>
            </div>

            <Separator />

            {/* Contact / Help CTA */}
            <div className="bg-primary/5 p-8 sm:p-10 rounded-3xl text-center shadow-sm border border-primary/10">
              <div className="flex flex-col items-center">
                <HelpCircle className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Questions Regarding Our Terms?</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                  Our compliance and member care team is available to assist you with any questions regarding policies, plans, or commissions.
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
