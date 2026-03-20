# HiTex Marketplace

A mobile-first B2B marketplace for the textile waste recycling industry, connecting traders, manufacturers, and transporters across Tamil Nadu.

## 🌟 Features

### Core Marketplace
- **Lead Feed** — Browse buy/sell listings for Waste, Fiber, and Yarn with search, category filters, and type toggles
- **Post Lead** — Create new buy or sell listings with material specs, pricing, quantity, and location
- **Lead Detail** — View full listing details with image carousels, specs, and seller info
- **My Leads** — Manage your active listings with status tracking

### Catalog Storefront
- **Public Catalog** (`/catalog/:userId`) — Each user gets a shareable storefront link displaying their active listings
- **Share Catalog** — Share via native share API or clipboard from My Leads page
- **Visitor Enquiry** — Visitors can send in-app chat enquiries directly from the catalog

### Communication
- **Chat** — Real-time messaging between buyers and sellers, organized by lead/thread
- **Reviews** — Rate and review trade partners after transactions

### Business Tools
- **Billing** — Invoice management with product catalog, tax details (GST/HSN), and party ledger
- **Analytics** — Trade performance dashboards and insights
- **Market Pulse** — Live market price trends for textile materials
- **Demand Heatmap** — Geographic demand visualization across districts

### Utilities
- **TNEB** — Tamil Nadu Electricity Board rate reference
- **Job Work** — Job work listings and management
- **Transport** — Transport request management (Coming Soon)
- **Services** — Directory of available platform services

### User Management
- **Profile** — Business profile with verification, trust score, and bio
- **Onboarding** — Guided setup for new users
- **Multi-role Support** — Waste Trader, Manufacturer, Transporter roles
- **Multi-language** — i18n support with Tamil/English

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL with RLS policies |
| Auth | Email/password with profile auto-creation |
| State | React Context + TanStack Query |
| Routing | React Router v6 |
| Charts | Recharts |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── AppShell.tsx     # Main layout with bottom nav
│   ├── LeadCard.tsx     # Lead listing card
│   ├── LeadImageCarousel.tsx
│   ├── BillingHeader.tsx
│   ├── DateRangeFilter.tsx
│   └── NavLink.tsx
├── pages/               # Route pages
│   ├── billing/         # Billing sub-pages
│   │   ├── AddProduct.tsx
│   │   ├── ProductDetail.tsx
│   │   └── TaxDetails.tsx
│   ├── Index.tsx        # Home feed
│   ├── Catalog.tsx      # Public storefront
│   ├── LeadDetail.tsx   # Lead detail view
│   ├── MyLeads.tsx      # User's listings
│   ├── PostLead.tsx     # Create listing
│   ├── Chat.tsx         # Messaging
│   ├── Analytics.tsx    # Dashboards
│   ├── Billing.tsx      # Invoice management
│   ├── Profile.tsx      # User profile
│   └── ...
├── lib/                 # Utilities & context
│   ├── appContext.tsx    # Global app state
│   ├── i18n.tsx         # Internationalization
│   ├── mockData.ts      # Mock data models
│   ├── materialImages.ts
│   ├── csvExport.ts
│   └── utils.ts
├── hooks/               # Custom React hooks
├── integrations/        # Supabase client & types
└── main.tsx             # App entry point
```

## 🗄 Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User business profiles, verification, trust scores |
| `leads` | Buy/sell material listings |
| `chat_threads` | Conversation threads linked to leads |
| `chat_messages` | Individual messages in threads |
| `chat_participants` | Thread membership and unread counts |
| `reviews` | Trader ratings and feedback |
| `bills` | Invoices and billing records |
| `products` | Product catalog for billing |
| `parties` | Business contacts / trading partners |
| `ledger_entries` | Financial ledger for parties |
| `transport_requests` | Transport booking requests |
| `user_roles` | Role-based access (admin, trader, transporter, manufacturer) |

## 🚀 Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔗 Routes

| Path | Page | Auth |
|------|------|------|
| `/` | Home Feed | ✅ |
| `/catalog/:userId` | Public Catalog | ❌ |
| `/lead/:id` | Lead Detail | ✅ |
| `/my-leads` | My Listings | ✅ |
| `/post-lead` | Create Listing | ✅ |
| `/chats` | Chat List | ✅ |
| `/chat/:leadId` | Chat Thread | ✅ |
| `/billing` | Billing Dashboard | ✅ |
| `/billing/add-product` | Add Product | ✅ |
| `/billing/product/:id` | Product Detail | ✅ |
| `/billing/tax-details` | Tax Details | ✅ |
| `/analytics` | Analytics | ✅ |
| `/market-pulse` | Market Prices | ✅ |
| `/demand-heatmap` | Demand Map | ✅ |
| `/transport` | Transport | ✅ |
| `/tneb` | TNEB Rates | ✅ |
| `/job-work` | Job Work | ✅ |
| `/services` | Services | ✅ |
| `/review/:leadId` | Write Review | ✅ |
| `/profile` | User Profile | ✅ |

## 📄 License

Private — All rights reserved.
