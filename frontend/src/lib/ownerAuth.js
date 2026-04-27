// Owner email allowlist helper.
// Set REACT_APP_OWNER_EMAILS in your .env (comma-separated, e.g. "owner@chala.ca,manager@chala.ca").
// If left empty, any authenticated Supabase user is allowed (legacy behavior).
const raw = process.env.REACT_APP_OWNER_EMAILS || "";
const ALLOWED = raw
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isOwnerAllowed(email) {
  if (!email) return false;
  if (ALLOWED.length === 0) return true; // no allowlist configured → permissive
  return ALLOWED.includes(email.toLowerCase());
}

export function hasOwnerAllowlist() {
  return ALLOWED.length > 0;
}
