# Chala Le Gouter Antillais

Premium bilingual (FR / EN) restaurant website + lightweight e-commerce stack for **Chala Le Gouter Antillais**, a Caribbean / Antillean restaurant in Montréal, Québec.

- **Public site:** menu, about, catering, reviews, contact, cart, hosted Stripe checkout, order confirmation
- **Owner console:** Supabase Auth login + realtime orders dashboard + menu CRUD + order history

---

## Tech Stack

| Layer | Stack |
|------|------|
| Frontend | React 19, React Router 7, Tailwind CSS 3, Shadcn/UI, lucide-react |
| Backend  | FastAPI, httpx, Stripe SDK, Motor (MongoDB), python-dotenv |
| Database | **Supabase** (Postgres + Realtime + Auth) for orders & menu_items, **MongoDB** for contact messages |
| Payments | Stripe Hosted Checkout + webhook |
| Hosting  | Designed for Emergent / any Node + Python host |

---

## Repository Layout

```
.
├── backend/                       # FastAPI app
│   ├── server.py                  # All API routes
│   ├── requirements.txt
│   ├── tests/                     # pytest suite
│   └── .env.example
├── frontend/                      # React app (CRA + craco)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.js
│   │   ├── restaurant.config.js   # Single source of truth for restaurant info
│   │   ├── translations.js        # FR / EN strings
│   │   ├── menuData.js            # Static fallback menu (used when DB empty)
│   │   ├── lib/supabase.js        # Browser Supabase client
│   │   ├── context/
│   │   │   ├── LanguageContext.js # Bilingual FR/EN toggle (localStorage)
│   │   │   └── CartContext.js     # Cart state + localStorage persistence
│   │   ├── components/
│   │   │   ├── Navbar.jsx, Footer.jsx
│   │   │   ├── CartDrawer.jsx, FloatingCart.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ui/                # Shadcn/UI primitives
│   │   └── pages/
│   │       ├── Home.jsx, Menu.jsx, About.jsx, Catering.jsx, Reviews.jsx, Contact.jsx
│   │       ├── Checkout.jsx, OrderConfirmation.jsx
│   │       ├── Login.jsx
│   │       └── Dashboard.jsx, DashboardOrders.jsx, DashboardMenu.jsx, DashboardHistory.jsx
│   └── .env.example
├── supabase_migrations.sql        # Idempotent schema for orders + menu_items + Realtime
└── README.md
```

---

## Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Hero, popular dishes, why-us, about snippet, reviews, catering CTA, map+contact |
| `/menu` | Categories + item cards with prices and **Add to Cart** |
| `/about` | Brand story + values + mission |
| `/catering` | Event types + features + inquiry form |
| `/reviews` | Ratings + testimonials |
| `/contact` | Map + hours + contact form |
| `/checkout` | Customer form + order summary + Stripe redirect |
| `/order-confirmation?session_id=…` *or* `?order_id=…` | Success state |

### Owner-only (Supabase Auth)
| Route | Description |
|-------|-------------|
| `/login` | Email + password (Supabase) |
| `/dashboard` | Live orders (Realtime + audio ping) |
| `/dashboard/menu` | Menu CRUD |
| `/dashboard/history` | Last 200 orders, status filters |

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/health` | Health + feature flags (`supabase_configured`, `stripe_configured`) |
| POST   | `/api/contact` | Save contact form message (MongoDB) |
| GET    | `/api/contact` | List messages (admin) |
| POST   | `/api/checkout/create-session` | Save order → Supabase, optionally create Stripe Session |
| POST   | `/api/webhooks/stripe` | Handle `checkout.session.completed` → flip status to `in_progress` |
| GET    | `/api/orders/{order_id}` | Fetch order by id |
| GET    | `/api/orders/by-session/{session_id}` | Fetch order by Stripe session id |

---

## Environment Variables

Copy `.env.example` → `.env` in both `frontend/` and `backend/`, then fill in your values.

### `frontend/.env`
```
REACT_APP_BACKEND_URL=
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_STRIPE_PUBLISHABLE_KEY=
```

### `backend/.env`
```
MONGO_URL=
DB_NAME=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=
```

> **Never commit real `.env` files.** They are listed in `.gitignore`.

---

## First-Time Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and paste/run the entire `supabase_migrations.sql` file (idempotent).
3. **Authentication → Users → Add user** for the owner login (email + password).
4. Copy the **Project URL**, **anon key**, and **service_role key** into the env files.

### 2. Stripe
1. Get test keys from <https://dashboard.stripe.com/apikeys>.
2. Add the secret key to `backend/.env` as `STRIPE_SECRET_KEY`.
3. Add the publishable key to `frontend/.env` as `REACT_APP_STRIPE_PUBLISHABLE_KEY`.
4. Create a webhook at <https://dashboard.stripe.com/webhooks> pointing at:
   `{REACT_APP_BACKEND_URL}/api/webhooks/stripe`
   subscribing to `checkout.session.completed`.
5. Copy the webhook signing secret into `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

### 3. Install & run

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend**
```bash
cd frontend
yarn install
yarn start
```

The frontend talks to the backend through `REACT_APP_BACKEND_URL` (all API routes are prefixed with `/api`).

---

## Cart Flow

1. User adds items on `/menu` → `CartContext` stores them in `localStorage` (key `chala_cart`).
2. CartDrawer / FloatingCart show the running total and a **Proceed to Checkout** button.
3. `/checkout` posts to `POST /api/checkout/create-session`:
   - Backend writes the order to Supabase (`status='new'`).
   - If Stripe keys are configured → returns `checkout_url`, frontend redirects to Stripe.
   - If Stripe is **not** configured → returns `{stripe_configured:false, order_id}`, frontend redirects to `/order-confirmation?order_id=…`.
4. After Stripe payment, Stripe webhook flips the order to `in_progress` and stores the `payment_intent_id`.
5. User lands on `/order-confirmation?session_id=…` → frontend polls `GET /api/orders/by-session/{id}` and renders the receipt.

---

## Owner Dashboard

`/dashboard` subscribes to `postgres_changes` on the `orders` table and:

- plays a short audio ping on every new INSERT
- shows order cards with one-click status flow:
  `new → in_progress → completed` (or cancelled)
- Sub-tabs:
  - **Menu** — full CRUD on `menu_items`. Items here override the static fallback menu.
  - **History** — last 200 orders with status filters.

---

## Bilingual

`LanguageContext` exposes `lang`, `switchLang(lang)`, and persists in `localStorage`. All user-facing copy lives in `translations.js` (FR + EN). The `<html lang>` attribute is updated on switch.

---

## Brand & Design

| Token | Hex |
|-------|-----|
| brand-orange   | `#D84315` |
| brand-green    | `#1B5E20` |
| brand-gold     | `#D4AF37` |
| brand-cream    | `#FAF8F5` |
| brand-black    | `#111111` |

Fonts: **Cormorant Garamond** (headings), **Outfit** (body).

All hard-coded restaurant info (address, phone, hours, Uber Eats URL, taxes, ETAs) lives in `frontend/src/restaurant.config.js`.

---

## Tests

```bash
cd backend
pytest -q
```

Backend tests cover: health flags, checkout validation (empty cart, delivery without address, invalid order_type), no-Stripe order persistence, order retrieval, and the existing `/api/contact` regression.

---

## License

Proprietary — © Chala Le Gouter Antillais.
