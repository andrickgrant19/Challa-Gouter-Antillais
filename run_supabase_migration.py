#!/usr/bin/env python3
"""Run Supabase schema migration via PostgREST + Supabase Python client."""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / "backend" / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# Supabase Python client cannot run arbitrary DDL; use psycopg via the
# direct postgres connection embedded in the Supabase project URL.
# We instead use the Supabase REST/RPC + manual psql via httpx to the
# PostgREST endpoint. Easiest path: use psycopg2 with the project DB URL.
# Since we don't have the DB password here, fallback to executing each
# SQL statement via the supabase-py rpc by creating a one-off SQL function.
# However, the cleanest approach uses the Supabase Management API which
# requires another token.
#
# Practical approach: use httpx to POST to /rest/v1/rpc/exec_sql after
# we create that function. Since we can't even create that function
# without DDL access, we use direct PostgREST schema introspection only.
#
# Instead, we use psycopg with the direct database URL composed from
# the project ref and the service role key won't work. We need the DB
# password.
#
# WORKAROUND: Use the supabase-py client with table operations instead
# of raw SQL. Create the tables via raw HTTP using the Supabase Studio
# PgMeta API which DOES accept the service_role JWT for some endpoints.
import httpx

sql = (ROOT / "supabase_migrations.sql").read_text()

# Try the pg-meta /pg/query endpoint which Supabase Studio uses.
# This endpoint is internal but accepts service_role key auth.
endpoints = [
    f"{SUPABASE_URL}/pg/query",
    f"{SUPABASE_URL}/api/platform/pg-meta/default/query",
]

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

for ep in endpoints:
    try:
        r = httpx.post(ep, headers=headers, json={"query": sql}, timeout=30)
        print(f"[{ep}] status={r.status_code} body={r.text[:300]}")
        if r.status_code < 400:
            print("Migration succeeded.")
            sys.exit(0)
    except Exception as e:
        print(f"[{ep}] error={e}")

print("\nDirect SQL execution failed. Fallback: please run /app/supabase_migrations.sql in Supabase Dashboard → SQL Editor manually.")
sys.exit(1)
