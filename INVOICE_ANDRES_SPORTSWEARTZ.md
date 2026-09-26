# INVOICE & QUOTATION - ANDRES SPORTSWEARTZ WEBSITE

---

| | |
|---|---|
| **Invoice #** | AWS-2026-001 |
| **Date** | 25 September 2026 |
| **Prepared by** | WalkTech - Web Development |
| **Prepared for** | Andres Sportsweartz |
| **Payment terms** | Net 30 |

## SCOPE OF WORK

### Phase 1 - Frontend Website

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | Product catalogue | Browse, search, and filter products by category |
| 2 | Shopping cart | Persistent cart with size/quantity selection |
| 3 | Checkout flow | Customer form with server-side validation |
| 4 | Order confirmation | Reference number generated automatically |
| 5 | WhatsApp integration | One-tap WhatsApp order sharing on every page |
| 6 | Responsive design | Mobile-first, works on phones, tablets, desktops |
| 7 | Business settings | WhatsApp number, business name, hours, address, social links |

### Phase 2 - Backend & Database

| # | Deliverable | Description |
|---|-------------|-------------|
| 8 | Supabase database | Orders, customers, products, order_items tables |
| 9 | Server-side pricing | Prices validated on server - customers cannot tamper |
| 10 | Rate limiting | 5 orders per 10 minutes per visitor |
| 11 | Bot protection | Hidden spam trap field |
| 12 | Product photo storage | Supabase Storage for product images |
| 13 | Order persistence | All orders saved permanently with reference numbers |

### Phase 3 - Admin Dashboard

| # | Deliverable | Description |
|---|-------------|-------------|
| 14 | Staff authentication | Admin login with allow-list (staff account) |
| 15 | Dashboard overview | New orders, total orders, product counts |
| 16 | Orders management | View all orders, filter by status, order details |
| 17 | Products management | Add, edit, hide, remove products |
| 18 | Settings page | Configure business details |

### Phase 4 - Security & Polish

| # | Deliverable | Description |
|---|-------------|-------------|
| 19 | Input validation | All fields length-checked and validated server-side |
| 20 | Error handling | Friendly messages to customers, detailed logs privately |
| 21 | TypeScript & lint | Full TypeScript coverage, zero lint warnings |
| 22 | Build verification | Production build passes cleanly |

## ITEMIZED PRICING

| # | Item | Category | Amount (TZS) |
|---|------|----------|--------------|
| 1 | Frontend website development | Phase 1 | 350,000 |
| 2 | Supabase database & backend integration | Phase 2 | 200,000 |
| 3 | Admin dashboard & order management | Phase 3 | 200,000 |
| 4 | Security, rate limiting & validation | Phase 4 | 75,000 |
| 5 | Vercel deployment, GitHub setup & domain config | Deployment | 50,000 |
| 6 | Technical documentation & handoff | Documentation | 25,000 |

| | **SUBTOTAL** | | **900,000 TZS** |
| | **DISCOUNT** | | **0 TZS** |
| | **TOTAL DUE** | | **900,000 TZS** |

> **Total Agreed Price: 900,000 TZS (Nine Hundred Thousand Tanzanian Shillings)**

## TECHNOLOGY STACK

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.3.6 (App Router) |
| Language | TypeScript |
| Frontend | React 19.2.8 |
| Styling | Tailwind CSS 4 |
| Backend / Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Order processing | Server-side API routes with rate limiting |

## ENVIRONMENT VARIABLES REQUIRED FOR LIVE SITE

| Variable | Purpose | Prefix |
|----------|---------|--------|
| NEXT_PUBLIC_WHATSAPP_NUMBER | WhatsApp number on all buttons | NEXT_PUBLIC_ |
| NEXT_PUBLIC_PHONE_NUMBER | Customer-facing phone number | NEXT_PUBLIC_ |
| NEXT_PUBLIC_BUSINESS_NAME | Business name displayed | NEXT_PUBLIC_ |
| NEXT_PUBLIC_CURRENCY | Currency code (TZS) | NEXT_PUBLIC_ |
| SUPABASE_URL | Supabase project URL | (server-only) |
| SUPABASE_ANON_KEY | Supabase anon key | (server-only) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase admin key | (server-only - never expose) |

## DELIVERABLES

- Source code (Git repository on GitHub)
- Production-ready build (Next.js)
- Database schema (supabase/schema.sql)
- Admin setup guide (supabase/admin-account.md)
- Business owner guide (README.md)
- Environment template (.env.local.example)

## PAYMENT TERMS

| Term | Detail |
|------|--------|
| Total due | 900,000 TZS |
| Payment method | Mobile Money (M-Pesa / Tigo Pesa / Airtel Money) or Bank Transfer |
| Due date | Upon project delivery / milestone agreement |
| Currency | TZS (Tanzanian Shilling) |

## SIGNATURES

| | |
|---|---|
| **Prepared by** | WalkTech - Web Development |
| **Date** | 25 September 2026 |
| **Approved by** | ________________________ |
| **Date** | ________________________ |

*Generated from the Andres Sportsweartz project. Code is on GitHub at https://github.com/walktech03-star/andres-sportsweartz.*
