# Chala Le Gouter Antillais — Product Requirements Document

## Overview
Premium bilingual (FR/EN) restaurant website + lightweight e-commerce stack for Chala Le Gouter Antillais, a Caribbean/Antillean restaurant in Montreal, Canada.

**URL**: https://antilles-kitchen.preview.emergentagent.com
**Last Updated**: 2026-04-27

---

## Business Info
- **Name**: Chala Le Gouter Antillais
- **Address**: 11866 Bd Rivière-des-Prairies, Montréal, QC H1C 1P9
- **Phone**: (514) 588-3708
- **Uber Eats**: https://www.ubereats.com/ca-fr/store/chala-le-gouter-antillais/5PogqSjLWTKTUIYfVPvYPw

All shared values now live in `/app/frontend/src/restaurant.config.js`.

---

## Architecture

### Frontend (React 19 + Tailwind 3 + React Router 7)
- Bilingual via `LanguageContext` + localStorage
- Cart state via `CartContext` + localStorage key `chala_cart`
- Supabase client at `/app/frontend/src/lib/supabase.js`
- Public chrome (Navbar/Footer/CartDrawer/FloatingCart) hidden on `/login` and `/dashboard/*`

### Backend (FastAPI)
- MongoDB (still used for `contact_messages`)
- Supabase (PostgreSQL + Realtime + Auth) for orders & menu_items
- Stripe Hosted Checkout (graceful no-config fallback)

### Database (Supabase)
- `orders` (id uuid, created_at, customer_*, delivery_address, order_type, notes, items jsonb, subtotal, status, stripe_session_id, stripe_payment_intent_id)
- `menu_items` (id uuid, name, description, price, category, image_url, is_available, display_order)
- Realtime enabled on `orders`
- See `/app/supabase_migrations.sql` (idempotent, safe to re-run)

### Brand
- brand-orange `#D84315`, brand-green `#1B5E20`, brand-gold `#D4AF37`, brand-cream `#FAF8F5`, brand-black `#111111`
- Cormorant Garamond (heading) + Outfit (body)

---

## Pages

### Public
| Route | Purpose |
|-------|---------|
| `/` | Hero, popular dishes, why-us, about snippet, reviews, catering CTA, map+contact |
| `/menu` | Categories + item cards with **prices** + **Add to Cart** (Supabase fallback to static) |
| `/about` | Brand story + values + mission + stats |
| `/catering` | Event types + features + inquiry form → /api/contact |
| `/reviews` | 4.9/5 rating + 6 testimonials + Google CTA |
| `/contact` | Address/phone/hours cards + Google Map + hours table + form |
| `/checkout` | Order summary + customer form (pickup/delivery toggle, address conditional) → Stripe (or saves order if Stripe disabled) |
| `/order-confirmation?session_id=...` or `?order_id=...` | Success state with customer info, order details, items, total |

### Owner-Only (Supabase Auth)
| Route | Purpose |
|-------|---------|
| `/login` | Email/password (Supabase). Redirects to `/dashboard` on success |
| `/dashboard` | Live orders list with Realtime subscription, sound ping on new INSERT, status flow new → in_progress → completed (or cancelled) |
| `/dashboard/menu` | CRUD on `menu_items` (add/edit/delete) |
| `/dashboard/history` | Last 200 orders, status filters |

---

## API Endpoints
- `GET /api/health` → `{status, supabase_configured, stripe_configured}`
- `POST /api/contact` (existing, MongoDB)
- `POST /api/checkout/create-session` → saves order to Supabase, optionally creates Stripe session
- `POST /api/webhooks/stripe` → updates order to `in_progress` + payment_intent_id
- `GET /api/orders/{order_id}`
- `GET /api/orders/by-session/{session_id}`

---

## Implemented (2026-04-27 — Maps fix + Owner-login link + Resend emails)
- [x] Contact `/contact`: replaced empty map block with the spec-exact iframe wrapped in `<a>` to Google Maps search. `pointer-events:none` on iframe → clicks bubble to parent anchor → opens Maps in new tab. Responsive (`h-[280px] md:h-[450px]`).
- [x] Footer: added discreet "Espace propriétaire" / "Owner Login" link below copyright (text-[11px], `text-white/30`, centered) → `/login`. Bilingual via `LanguageContext`.
- [x] Resend transactional emails wired up via new `/app/backend/emails.py`:
  - `send_customer_order_confirmation(order, lang)` — bilingual receipt with item table, ETA, brand orange #E07B39
  - `send_owner_order_notification(order)` — to `OWNER_EMAIL` with full order summary + dashboard CTA
  - `send_owner_catering_notification(req)` — to `OWNER_EMAIL` with event details + dashboard CTA
- [x] All 3 emails are FAIL-SOFT: `asyncio.create_task` + try/except inside `_send`. If `RESEND_API_KEY` or `OWNER_EMAIL` is unset, function logs a WARNING and returns without raising — order/catering submissions ALWAYS succeed regardless of email status.
- [x] `CheckoutRequest` now accepts optional `lang` field (default `"fr"`) — frontend Checkout passes current `LanguageContext.lang`.
- [x] Backend env: added `RESEND_API_KEY`, `OWNER_EMAIL`, `EMAIL_FROM`, `DASHBOARD_URL` to `.env` and `.env.example`.
- [x] `requirements.txt` += `resend>=2.0.0`.

## Implemented (2026-04-27 — Stale-deploy cleanup + Owner allowlist)
- [x] Deleted orphan `/app/frontend/src/components/ComboBuilder.jsx` (dead code that contained the old "n'est pas encore configurée" string and would short-circuit before any Supabase request when env vars weren't baked in at Vercel build time). Live site was rendering this stale build.
- [x] Added `REACT_APP_OWNER_EMAILS` (comma-separated) allowlist via new helper `/app/frontend/src/lib/ownerAuth.js` (`isOwnerAllowed`, `hasOwnerAllowlist`).
- [x] `Login.jsx` now signs the user out and shows "This account is not authorized to access the dashboard" if their email isn't in the allowlist.
- [x] `ProtectedRoute.jsx` enforces the allowlist on session restore + auth state changes.
- [x] If `REACT_APP_OWNER_EMAILS` is unset (legacy), behavior is unchanged: any authenticated Supabase user passes — non-breaking.
- [x] Documented owner setup flow in `/app/SUPABASE_OWNER_SETUP.md`.
- [x] Verified `/menu` renders 4 tabs + 5 protein cards + 3 base cards on preview, no setup warnings.

## Implemented (2026-04-25 — Phase 2 e-commerce)
- [x] Supabase wired up (URL + anon + service_role keys in env)
- [x] Cart system (CartContext + CartDrawer + FloatingCart + Navbar cart icon)
- [x] Menu page reads Supabase if available, fallback to static `menuData.js` with prices in CAD
- [x] Checkout page (form + summary + pickup/delivery + address conditional)
- [x] `POST /api/checkout/create-session` saves orders to Supabase, conditionally creates Stripe sessions
- [x] Stripe webhook handler (`POST /api/webhooks/stripe`) for `checkout.session.completed`
- [x] Order Confirmation page with **customer info block**, order items, total, ETA
- [x] Login page (Supabase email/password) with friendly error mapping
- [x] Protected `/dashboard` with Live Orders / Menu / History tabs
- [x] Realtime orders dashboard (audio ping on new orders)
- [x] Menu admin CRUD
- [x] `restaurant.config.js` wired into Navbar + Footer + Checkout + Confirmation
- [x] Backend tolerates missing `stripe_session_id` column; idempotent `/app/supabase_migrations.sql` provided

---

## Implemented (Phase 1 — 2025)
- [x] All public pages with full bilingual FR/EN
- [x] Sticky glassmorphism navbar
- [x] Scroll reveal animations
- [x] Mobile click-to-call floating button
- [x] Uber Eats deep link
- [x] Google Maps embed
- [x] Contact form → MongoDB
- [x] Premium design system

---

## Pending (handover items for the user)
1. **Push the latest code to GitHub** ("Save to GitHub" button in the chat) so Vercel rebuilds. The live site is showing an old "Cette section n'est pas encore configurée" message because the deployed bundle predates `MenuSections.jsx` and was built when `REACT_APP_SUPABASE_*` were still missing in Vercel.
2. **Create the owner user** in Supabase Dashboard → Authentication → Users (see `/app/SUPABASE_OWNER_SETUP.md`). Recommended: enable "Auto Confirm User".
3. **Add `REACT_APP_OWNER_EMAILS`** (comma-separated) to BOTH `/app/frontend/.env` AND your Vercel project Environment Variables → redeploy.
4. **Run `/app/supabase_migrations.sql`** in Supabase Dashboard → SQL Editor (idempotent — patches the missing `stripe_session_id` column and ensures `orders` is in the realtime publication).
5. **Add Stripe keys** to `/app/backend/.env`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - And `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...` to `/app/frontend/.env`
6. Configure the Stripe webhook to point at `{REACT_APP_BACKEND_URL}/api/webhooks/stripe` for the `checkout.session.completed` event.

---

## Backlog / P1 Features
- [ ] Email notification (Resend / SendGrid) on new order
- [ ] SMS via Twilio for delivery driver hand-off
- [ ] Sales tax (TPS/TVQ) calculation in checkout (config already has `taxRate`)
- [ ] Coupon / promo code field on checkout
- [ ] Online reservation system
- [ ] Social links (Instagram, Facebook)
- [ ] Real restaurant photos
- [ ] Live Google Reviews API integration
- [ ] WhatsApp contact button
- [ ] SEO sitemap generation
- [ ] Production-ready RLS policies on Supabase tables
