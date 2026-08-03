# Technical Project Proposal: ABS International MLM & Service Platform

---

## 1. Executive Summary

**ABS International** is a Multi-Level Marketing (MLM), Product E-commerce, and Healthcare/Social Benefit platform. Customers join the system by purchasing a joining product package valued at **1,500 BDT** or by purchasing products directly. The platform will be operated via an integrated mobile application for users and a state-of-the-art central management web dashboard for administrators.

---

## 2. Core System Features & Scope of Work

### A. Public Website / Home Page (ল্যান্ডিং পেইজ)

- **🏢 Company Branding:**
  - **Company Logo:** Prominent logo placeholder/branding container.
  - **Introduction:** Welcome message: "Welcome to ABS International - your trusted partner in health, beauty and wellness."
  - **Account Access:** Fast access buttons for **Login** and **Register**.
- **🧭 Primary Navigation Menu:**
  - Home, Plan, and About Us.
- **🛍️ Core Showcase Sections (Details included on home page):**
  - **ABS Shops:** Details about physical shops and network locations.
  - **ABS Products:** Featured display of flagship/premium products.
  - **ABS dream:** Visual section showcasing the project vision and goals.

---

### B. Mobile Application (User Panel - Final Member App)

- **🏠 Interactive Dashboard:**
  - **Member Details:** Display of Member Name, Member ID, and Sponsor ID.
  - **Rank Summary:** Current Rank and visual Rank Progress bar.
  - **Sales & Team Metrics:** Track Personal Sales, Team Sales, and Total Team count (Team Performance).
  - **Integrated Member Wallet:** Live display of Available Wallet Balances (Deposit Wallet, Available Bonus Balance, Withdrawal Wallet).
  - **In-App Navigation Menu:** Standard sidebar drawer/navigation routing containing all account modules.

- **👤 Profile Management:**
  - **Personal Information:** Edit/update name, mobile number, email, and address (My Profile).
  - **KYC Verification:** **National ID (NID)** image upload and real-time verification status tracker.
  - **Bank/MFS Details:** Save and edit bank accounts and Mobile Financial Services (bKash/Nagad/Rocket) credentials.
  - **Sponsor Information:** View Sponsor's name, ID, and contact details.

- **🛍️ Product Store & E-commerce:**
  - **Product Categories:** View and browse products by categories (Health, Beauty, Wellness).
  - **Product Packages:** Choose Joining package products (Basic Package / VIP Package selection).
  - **Product Stories:** A customer success and product testimonial story section.
  - **Ordering Engine:** Browse products, filter, add to cart, pay using in-app wallets, and track order delivery status.
  - **Order History:** Detailed order list and logs (Pending ➔ Processing ➔ Shipped ➔ Delivered).
  - **Digital Seba Card:** Automatically generate a digital health benefit "Seba Card" upon membership activation.

- **👥 My Team (Downline Network):**
  - **Direct Team:** List of direct referrals along with their activation status.
  - **10 Generation Team Tree (My Tree):** Visual representation of the downline team tree from Generation 1 to Generation 10.
  - **Active/Inactive Members:** Filter and track active and inactive members separately.
  - **Team Performance:** Performance details of downlines and team sales tracking.

- **💰 My Bonus & Commission Ledgers:**
  - **Total Income & Total Bonus Summary:** Aggregated view of overall earnings and bonuses.
  - **Sponsor Bonus:** Direct referral commission (15%).
  - **Generation Bonus:** Multi-level commission statement up to 10 generations.
  - **Global Profit Share:** Share from the 2% company-wide pool.
  - **Incentive Fund:** Performance incentives and rewards status.
  - **Rank Development Fund:** Promotion commission details.
  - **Royalty Fund:** Royal manager/Director level royalty payouts ledger.
  - **Charity Fund:** Dedicated ledger view showing contribution to charity (1%).

- **🏆 Rank, Progress & Achievements:**
  - **My Rank:** Current rank title and achievements checklist.
  - **Rank Progress:** Requirement checklists and bar charts showing progress towards the next rank.
  - **Rank System & Promotion Criteria:** Explanatory screen for rank promotions.
  - **Achievement Photo Gallery:** Dedicated area to display achievement certificates or photos of rank achievers.

- **🎁 Reward Center:**
  - **Reward Tracking:** View Eligible Rewards, click to claim, and track delivery status (Pending ➔ Approved ➔ Delivered).
  - **Reward & Milestone History:** Archive of claimed and delivered rewards.

- **💼 Wallet System & Transactions:**
  - **Deposit Engine:** Main Wallet deposit options (bKash/Nagad/Rocket/Bank) and **Deposit History** logs.
  - **Withdrawal Engine:** Submit withdrawal requests and view **Withdrawal History** logs.
  - **Balance Transfer:** Secure wallet-to-wallet transfer to other members' accounts.
  - **Transaction Statement:** Unified statement ledger showing all account transaction details.
  - **Rank Password / Secure Transaction PIN:** A separate security PIN/password required to authorize withdrawals and transfers.

- **🏥 Seba / Service Benefit Module:**
  - 1 free **MBBS Doctor Consultation** booking or digital voucher per month.
  - **50% Discount** voucher for lab reports and diagnostic tests at partner centers.
  - **50% Discount** on Emergency Ambulance requests and dedicated hotline access.

- **🔔 Notifications Center:**
  - Real-time in-app notifications hub for transactions, downline activities, rank promotions, and admin announcements.

- **📄 PDF Guidelines & Support:**
  - In-app PDF viewer for platform guidelines and policies.
  - **Support Ticket System:** Create support tickets, upload query screenshots, and view support ticket history.

- **🚪 Account Security & Session:**
  - Change Account Password and **Logout** options.

---

### B. Super Admin Dashboard (Admin Control Panel)

- **User & NID Verification Management:**
  - Verification queue for submitted NID photos with approve/reject controls.
  - Complete control to search, edit profiles, and block/unblock member accounts.

- **Product & Inventory Management:**
  - Add new products, configure categories, control pricing, and manage inventory levels.
  - Order management system to update specific shipping statuses (Pending ➔ Shipped ➔ Delivered).

- **Automated Commission & Fund Distribution Engine:**
  - Automated split algorithm: upon a 1,500 BDT package sale, **34.5% (517 BDT)** is immediately credited to 8 specific funds.
  - Distribution logic for 10-level Generation Bonuses.
  - Scheduler to split Global Profit (2% / 30 BDT) equally among all active members.

- **Withdrawal Approval Queue:**
  - Filter and manage withdrawal requests for bKash, Nagad, Rocket, and Bank transfers.
  - Manual and automated payout approval panel.

- **Rank & Incentive Disbursement:**
  - Automated rank promotion engine upon meeting criteria (e.g., 6 downlines reaching a specific rank).
  - Incentive fund ledger (Smartphones, bikes, cars, Umrah Hajj, etc.) and delivery log tracking.

- **Charity Fund Ledger (1% / 15 BDT):**
  - Dedicated ledger tracking charity funds gathered from packages and managing donation disbursement logs.

- **Seba & Discount Management:**
  - Manage doctors, diagnostic centers, ambulance partners, and verify/redeem user discount vouchers.

---

### C. Advanced Platform Enhancements, Marketing & Operations

- **⚡ Core UI/UX & Frontend Technology (Next.js & PWA Stack):**
  - **Next.js & PWA Web App:** Built on Next.js framework, fully installable as a Progressive Web App (PWA).
  - **Splash Screen & Skeleton Loading:** Smooth splash screens and skeleton loader animations during content fetching.
  - **Premium Animations & Smooth Scrolling:** Interactive motion effects and smooth scrolling for a premium experience.
  - **Theme & Font Customization:** Dynamic theme palette and typography settings controllable from the System Design configuration panel.
  - **Day and Night Mode:** Easily toggle between dark and light themes.
  - **Fully Responsive Design:** Tailored layouts for Mobile, Tablet, and Desktop screens.

- **🛍️ Advanced E-Commerce & Shopping Experience:**
  - **Advanced Product Filtering:** Filter products by category, price range, and brands.
  - **Voice Search Functionality:** Search products hands-free using voice inputs.
  - **Wishlist & Quick View Modal:** Add products to a wishlist or view details instantly inside a modal without leaving the product page.
  - **Customer Reviews:** Feedback and star rating system for products.
  - **Dynamic Discount Coupons & Offers:** Create and manage promotional codes and specific offers.
 

- **📈 Marketing, Tracking & SEO (CRO Optimization):**
  - **Server-Side Tracking:** High-accuracy server-side tracking to prevent data loss.
  - **GTM & GA4 Setup:** Google Tag Manager and Google Analytics 4 integration.
  - **Meta Pixel & TikTok Pixel Setup:** Dedicated marketing pixel integrations for tracking conversions.
  - **SEO & CRO Optimized Structure:** Schema markup, fast page loads, and conversion rate optimizations.
  - **Dynamic Meta Tags & Sitemap:** Dynamic meta titles, descriptions, Open Graph (OG), Twitter Card metadata, and XML sitemap generator.

- **💼 Operations, Accounting & Logistics:**
  - **Instant Courier Booking:** Integration with local courier APIs (e.g., Pathao, Steadfast, Redx) for instant shipping booking and tracking.
  - **Dynamic Delivery Charge:** Automated shipping cost calculation based on user address.
  - **Automated & Sticker Invoice:** Automatically generate invoices and printable shipping label stickers with barcode/QR code.

  - **Short Product Alert:** Real-time warning notifications when product stock drops below safety levels.
  - **Abandoned Cart Check:** Track and log users who left products in their carts with recovery tools.


- **🔐 Security, Roles & Internal ERP:**
  - **Role-Based Authentication:** Multi-level dashboard access for Admin, Inventory Manager, and Members.
  - **Manual Order Entry:** Allow admins to place manual orders for offline customers directly from the dashboard.
  
  - **Fraud Detection:** Algorithms to flag abnormal bonus generation or suspicious user activity.
  - **Advanced Security & Free SSL:** Full database encryption and free SSL integration.
  - **Landing Page Builder:** One-click custom landing page setup for lead generation.
 
  - **Payment Gateways:** Integration with SSL Commerz leading local payment gateways.
---

## 3. Financial Breakdown & MLM Calculation Logic

### A. 1500 TK Package Fund Split (34.5% = 517 TK Distribution)

- **Sponsor Bonus:**
  - Percentage: 15%
  - Amount: 225 BDT
  - Description: Awarded to the direct referrer of the new joining member.

- **Generation Bonus:**
  - Percentage: 7%
  - Amount: 105 BDT
  - Description: Distributed across 10 generations of downline network.

- **Auto Profit:**
  - Percentage: 3.5%
  - Amount: 52 BDT
  - Description: Stored in the Auto-Profit matrix pool.

- **Global Profit:**
  - Percentage: 2%
  - Amount: 30 BDT
  - Description: Shared equally among all active platform members.

- **Incentive Fund:**
  - Percentage: 2%
  - Amount: 30 BDT
  - Description: Stored for rank rewards.

- **Rank Development Fund:**
  - Percentage: 2%
  - Amount: 30 BDT
  - Description: Reserved for rank promotion bonuses.

- **Royalty Fund:**
  - Percentage: 2%
  - Amount: 30 BDT
  - Description: Reserved for Diamond, Crown, and Director royalty payouts.

- **Charity Fund:**
  - Percentage: 1%
  - Amount: 15 BDT
  - Description: Reserved for distribution to orphans and the underprivileged.

- **Total Distributed:**
  - Percentage: **34.5%**
  - Amount: **517 BDT**
  - Description: Total system distribution from each 1,500 BDT package.

---

### B. Generation Bonus Breakup (Out of 100% Generation Allocated Pool)

- **1st Generation:** 40%
- **2nd Generation:** 20%
- **3rd Generation:** 10%
- **4th Generation:** 6%
- **5th Generation:** 6%
- **6th Generation:** 5%
- **7th Generation:** 5%
- **8th Generation:** 3%
- **9th Generation:** 3%
- **10th Generation:** 2%

---

### C. Auto Profit Matrix Amount Tier

- Tier 1: 240 BDT
- Tier 2: 720 BDT
- Tier 3: 2,160 BDT
- Tier 4: 7,776 BDT
- Tier 5: 46,656 BDT
- Tier 6: 2,33,280 BDT
- Tier 7: 1,399,680 BDT
- Tier 8: 5,038,848 BDT
- Tier 9: 30,233,088 BDT
- Tier 10: 120,932,352 BDT

---

### D. Rank Development & Promotion Hierarchy

- **1. Premium Member (Entry Level)**
  - Requirement: Purchase the 1,500 BDT membership package/product.

- **2. Team Manager**
  - Requirement: 6 Premium Members
  - Reward: 200 BDT + Free Seba Card.

- **3. Royal Manager**
  - Requirement: 6 Team Managers
  - Reward: 1,000 BDT + Buffet Lunch.

- **4. Silver Manager**
  - Requirement: 6 Royal Managers
  - Reward: 6,000 BDT + Buffet Lunch.

- **5. Gold Manager**
  - Requirement: 6 Silver Managers
  - Reward: Smartphone + 10,000 BDT Incentive.

- **6. Diamond Manager**
  - Requirement: 6 Gold Managers
  - Reward: Motorbike + Cox's Bazar Tour + 15,000 BDT Incentive + 20,000 BDT Royalty Fund.

- **7. Crown Manager**
  - Requirement: 6 Diamond Managers
  - Reward: Private Car + Cox's Bazar Tour + 20,000 BDT Incentive + 100,000 BDT Royalty Fund.

- **8. Director**
  - Requirement: 6 Crown Managers
  - Reward: Flat + Umrah Hajj + 50,000 BDT Incentive + 150,000 BDT Royalty Fund + 2% Company Share.

---

## 4. Proposed Technical Architecture & Technology Stack

- **Frontend (Mobile App):** Next.js Progressive Web App (PWA) with Trusted Web Activity / Capacitor (Android APK and PWA setup, publishing to Play Store is the client's responsibility).
- **Admin Web Dashboard:** Next.js (React) / Tailwind CSS with modern UI & Chart analytics.
- **Backend API & Microservices:** Node.js (Express/NestJS) REST API.
- **Database:** PostgreSQL / MongoDB (ACID-compliant transactions for multi-wallet integrity and concurrency lock).
- **Caching & Queue:** Redis for cron job calculation (Global profit distribution) & fast wallet balance lookup.
- **Storage:** Amazon S3 / DigitalOcean Spaces (NID document storage & PDF Guidelines).

---

## 5. Security & Financial Audit Architecture

- **Database Transaction Locks:** Atomic Operations/Transactions will be enforced during wallet debit/credit operations to prevent double-spending.
- **NID Encryption:** NID information and images will be encrypted on the server.
- **Audit Log:** Time-stamped activity log recorded for all payouts, promotions, and admin role changes.
- **Automated Reconciliation:** 1-click reconciliation module for admins to match daily income with payouts.

---

## 6. Project Phasing & Timeline

- **Phase 1: System Design & DB Architecture**
  - Duration: 1 Week
  - Scope: Database Schema, Financial Algorithm Verification, UX/UI Design Mockups.

- **Phase 2: Backend API & Commission Engine**
  - Duration: 2 Weeks
  - Scope: User auth, NID verification logic, MLM calculation, Multi-wallet engine.

- **Phase 3: Mobile App & Admin Dashboard**
  - Duration: 3 Weeks
  - Scope: Next.js PWA User App (Android APK/TWA), Next.js Admin Panel, Product store, payment gateway integrations.

- **Phase 4: Testing & Financial Audit**
  - Duration: 1 Week
  - Scope: Stress testing MLM payouts, security audits, simulated 1000+ transaction trees.

- **Phase 5: Deployment & Deliverables Handover**
  - Duration: 1 Week
  - Scope: Android APK build and source code delivery, Admin Server Deployment & Training (Play Store publishing is the client's responsibility).

---

## 7. Project Timeline & Financial Terms

- **Total Project Timeline:** 45 Days
- **Total Project Fee:** 30,000 BDT
- **Advance Payment:** 5,000 BDT
- **Remaining Payment:** Payable after live delivery and successful testing, subject to mutual agreement.

---
*Prepared for ABS International Project Requirement Evaluation.*
