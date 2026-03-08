

## B2B Textile Marketplace — "HiTex"

### Phase 1: Core Marketplace UI (This Implementation)

**1. App Shell & Navigation**
- Bottom navigation bar with 4 tabs: Home, My Leads, TNEB, Profile
- Business Role Switcher in top header (Waste Trader / Recycling Mill / OE Mill / Job Worker)
- Color palette: Trust Blue (#2563EB), Sustainable Green (#059669), Deep Navy (#0F172A)
- Inter font, mobile-first, white background, high-contrast

**2. Home Screen — Marketplace Feed**
- Card-based feed of textile waste listings
- Each card shows: material type (Comber Noil, Hosiery Clips, etc.), quantity (kg), price per kg (₹), location district, seller role badge, status (Active/Sold)
- Search bar + filter chips (by category: Waste/Fiber/Yarn, by material type)
- Pull-to-refresh style interaction

**3. Lead Detail Page**
- Full listing details with specs (color, trash%, count)
- **Masked Contact Section**: For free users, seller name and phone are blurred with a gold "🔒 Premium Unlock — ₹10,000/year" button
- For subscribed users: full contact details + "Open Chat" button
- Mock subscription state toggle for demo purposes

**4. Multi-Step Onboarding Flow**
- Step 1: Phone number + OTP input (mock OTP for now)
- Step 2: Role selection (multi-select: Waste Trader, Recycling Mill, OE Mill, Job Worker)
- Step 3: Business details (name, GST number, district) + document upload placeholders (Selfie, GST Certificate)
- "Pending Verification" status banner after registration

**5. Post a Lead**
- Form to create a new listing: category, material type, price/kg, quantity, specs (color, trash%, count)
- Appears under "My Leads" tab with status management

**6. TNEB Page**
- Input field to save 12-digit EB Consumer Number
- Placeholder dashboard cards for "Next Bill Due Date" and "Amount Due"
- "API coming soon" indicator

**7. Market Pulse (Charts)**
- Line/bar charts showing average price trends for Waste, Fiber, Yarn categories
- Built with Recharts using mock historical data
- Time range selector (1M, 3M, 6M)

**8. Profile Page**
- Business profile display with verification badge
- Subscription status card
- Roles display
- Settings & logout

All data will be mock/local state for this phase. Backend integration (Supabase auth, database, payments) can be added in the next phase.

