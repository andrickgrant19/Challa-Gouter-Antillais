"""
Re-categorize menu_items in Supabase using rules supplied by the user.
Idempotent: safe to re-run.

Rules (priority order):
  1. starts with "Repas pour 4" / "Fritay pour" / "Fritay griot" / "Fritay poulet" / "Fritay dinde" -> "Repas Familiale"
  2. contains "poisson" -> "Poisson"
  3. contains "legume"  -> "Végétarien"
  4. contains "griot"   -> "Griot"
  5. contains "poulet"  -> "Poulet"
  6. contains "dinde"   -> "Dinde"
"""
import os
import sys
import unicodedata
from pathlib import Path
from dotenv import load_dotenv
import httpx

load_dotenv(Path(__file__).resolve().parent / "backend" / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SR = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

H = {
    "apikey": SR,
    "Authorization": f"Bearer {SR}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def categorize(name: str) -> str:
    plain = strip_accents(name).lower().strip()
    family_prefixes = (
        "repas pour 4",
        "fritay pour",
        "fritay griot",
        "fritay poulet",
        "fritay dinde",
    )
    if any(plain.startswith(p) for p in family_prefixes):
        return "Repas Familiale"
    if "poisson" in plain:
        return "Poisson"
    if "legume" in plain:
        return "Végétarien"
    if "griot" in plain:
        return "Griot"
    if "poulet" in plain:
        return "Poulet"
    if "dinde" in plain:
        return "Dinde"
    return "Autres"


def main():
    items = httpx.get(f"{SUPABASE_URL}/rest/v1/menu_items?select=id,name,category", headers=H, timeout=20).json()
    print(f"Loaded {len(items)} items")
    by_target = {}
    updates = []
    for it in items:
        target = categorize(it["name"])
        by_target.setdefault(target, []).append(it["name"])
        if it["category"] != target:
            updates.append((it["id"], it["name"], it["category"], target))

    print("\n--- Categorization plan ---")
    for cat, names in sorted(by_target.items()):
        print(f"  {cat} ({len(names)})")
        for n in names:
            print(f"    - {n}")
    print(f"\n{len(updates)} item(s) need updating.")

    failed = 0
    for (item_id, name, old_cat, new_cat) in updates:
        r = httpx.patch(
            f"{SUPABASE_URL}/rest/v1/menu_items?id=eq.{item_id}",
            headers=H,
            json={"category": new_cat},
            timeout=20,
        )
        ok = r.status_code < 400
        marker = "OK" if ok else f"FAIL {r.status_code}"
        print(f"  [{marker}] {name}  :  {old_cat}  ->  {new_cat}")
        if not ok:
            failed += 1
            print(f"        body: {r.text[:200]}")
    print(f"\nDone. {len(updates) - failed}/{len(updates)} updated successfully.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
