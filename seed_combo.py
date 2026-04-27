"""Seed combo_* tables in Supabase via PostgREST.

Strategy:
- We can't run DDL via REST. The user will run supabase_migrations.sql in Studio.
- After that, this script seeds the tables idempotently using POST with on_conflict.
"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv
import httpx

load_dotenv(Path(__file__).resolve().parent / "backend" / ".env")
URL = os.environ["SUPABASE_URL"].rstrip("/")
SR  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
H = {
    "apikey": SR,
    "Authorization": f"Bearer {SR}",
    "Content-Type": "application/json",
    "Prefer": "resolution=ignore-duplicates,return=minimal",
}

PROTEINS = [
    {"name":"Griot",        "name_en":"Griot",        "price":25.95, "display_order":1},
    {"name":"Poulet",       "name_en":"Chicken",      "price":25.95, "display_order":2},
    {"name":"Dinde",        "name_en":"Turkey",       "price":27.95, "display_order":3},
    {"name":"Poisson Frit", "name_en":"Fried Fish",   "price":26.95, "display_order":4},
    {"name":"Légume",       "name_en":"Vegetarian",   "price":27.95, "display_order":5},
]

SIDES = [
    {"name":"Riz Blanc",       "name_en":"White Rice",     "price_modifier":0,    "side_type":"base", "display_order":1},
    {"name":"Riz Collé",       "name_en":"Sticky Rice",    "price_modifier":0,    "side_type":"base", "display_order":2},
    {"name":"Riz Djondjon",    "name_en":"Djondjon Rice",  "price_modifier":2.00, "side_type":"base", "display_order":3},
    {"name":"Salade",          "name_en":"Salad",          "price_modifier":0,    "side_type":"side", "display_order":1},
    {"name":"Macaroni",        "name_en":"Macaroni",       "price_modifier":0,    "side_type":"side", "display_order":2},
    {"name":"Banane Plantain", "name_en":"Plantain",       "price_modifier":0,    "side_type":"side", "display_order":3},
    {"name":"Aucun",           "name_en":"None",           "price_modifier":0,    "side_type":"side", "display_order":99},
]

EXTRAS = [
    {"name":"Extra Viande",          "name_en":"Extra Meat",  "price":5.00, "display_order":1},
    {"name":"Extra Riz",             "name_en":"Extra Rice",  "price":2.50, "display_order":2},
    {"name":"Sauce Supplémentaire",  "name_en":"Extra Sauce", "price":1.50, "display_order":3},
    {"name":"Banane Plantain",       "name_en":"Plantain",    "price":2.00, "display_order":4},
    {"name":"Pikliz",                "name_en":"Pikliz",      "price":1.50, "display_order":5},
]


def seed(table, rows):
    r = httpx.post(
        f"{URL}/rest/v1/{table}?on_conflict=name",
        headers=H,
        json=rows,
        timeout=30,
    )
    print(f"[{table}] {r.status_code} {r.text[:120]}")
    return r.status_code < 400


def check_tables_exist():
    """Return True if all three tables are reachable."""
    for t in ("combo_proteins", "combo_sides", "combo_extras"):
        r = httpx.get(f"{URL}/rest/v1/{t}?limit=1", headers=H, timeout=15)
        if r.status_code != 200:
            print(f"  [{t}] status={r.status_code} body={r.text[:200]}")
            return False
    return True


def main():
    if not check_tables_exist():
        print("\n❌ Tables not found. Run /app/supabase_migrations.sql in Supabase SQL Editor first.")
        return 1
    ok = True
    ok &= seed("combo_proteins", PROTEINS)
    ok &= seed("combo_sides",    SIDES)
    ok &= seed("combo_extras",   EXTRAS)
    print("\n✅ Seed complete." if ok else "\n⚠️ Seed had errors.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
