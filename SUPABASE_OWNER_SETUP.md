# Owner Dashboard — Auth Setup Guide

This dashboard uses **Supabase Auth (email + password)**. Anyone NOT in the owner allowlist will be blocked from `/dashboard`, even if they have a valid Supabase account.

## 1. Create the owner account in Supabase

1. Open your project at <https://supabase.com/dashboard>.
2. Sidebar → **Authentication → Users**.
3. Click **Add user → Create new user**.
4. Fill in:
   - **Email**: e.g. `owner@chala.ca`
   - **Password**: choose a strong password (≥ 12 chars)
   - **Auto Confirm User**: ✅ check (otherwise they'll need to click an email link)
5. Click **Create user**.

> Tip: Repeat for any co-owner / manager you want to grant dashboard access to.

## 2. Add the email allowlist to your environment

The frontend reads `REACT_APP_OWNER_EMAILS` (comma-separated, lowercase recommended) and only lets those emails into the dashboard.

### Local dev (`/app/frontend/.env`)

```
REACT_APP_OWNER_EMAILS=owner@chala.ca,manager@chala.ca
```

Then restart the frontend: `sudo supervisorctl restart frontend`.

### Vercel (production)

1. Vercel project → **Settings → Environment Variables**.
2. Add `REACT_APP_OWNER_EMAILS` with the same comma-separated list.
3. Apply to **Production / Preview / Development**.
4. **Redeploy** — CRA inlines env vars at build time, so a redeploy is mandatory after any change.

> If `REACT_APP_OWNER_EMAILS` is empty/unset, the dashboard falls back to "any authenticated Supabase user is allowed" (legacy behavior). For production, always set the allowlist.

## 3. Test the flow

1. Visit `/login`.
2. Sign in with the owner email + password from step 1.
3. You should land on `/dashboard`.
4. Sign out (top-right). Try logging in with a non-owner Supabase account → you should see **"This account is not authorized to access the dashboard."**

## 4. Resetting an owner password

- Supabase Dashboard → Authentication → Users → click the user → **"Send password recovery"** OR set a new password directly.

## 5. Files involved

- `/app/frontend/src/pages/Login.jsx` — login form + allowlist check
- `/app/frontend/src/components/ProtectedRoute.jsx` — route guard
- `/app/frontend/src/lib/ownerAuth.js` — `isOwnerAllowed()` helper
- `/app/frontend/.env` — `REACT_APP_OWNER_EMAILS`

## Security notes

- The allowlist is a **client-side UX gate**. The real database security is enforced by Supabase **Row Level Security (RLS) policies** in `/app/supabase_migrations.sql`.
- Public tables (menu, drinks, etc.) are readable by anyone (anon key).
- Write/admin operations should be restricted via RLS to authenticated users — see the migration file for current policies.
