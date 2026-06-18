#!/usr/bin/env python3
"""
Softwallet v2 (سوفت واليت) — Database Setup Script
====================================================
Drops ALL 45 old South Wallet tables + 8 RPC functions.
Creates 21 fresh Softwallet tables with indexes, RLS, and seed data.

Requires: pip install requests psycopg2-binary
"""

import os
import sys
import json
import time
import requests
import psycopg2

# ─── Configuration ────────────────────────────────────────────
SUPABASE_URL = "https://nnywltnzjkpnhnapyvem.supabase.co"
PROJECT_REF = "nnywltnzjkpnhnapyvem"
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueXdsdG56amtwbmhuYXB5dmVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc5NzU4NywiZXhwIjoyMDk3MzczNTg3fQ.QR2ZahxMAiA4jwtppjw-xXwWY43l52anKjI_a6g4di8"

# All 21 new Softwallet tables
NEW_TABLES = [
    'members', 'transfers', 'alerts', 'service_orders',
    'deposit_tickets', 'cashout_tickets', 'bank_partners',
    'rate_config', 'promo_codes', 'campaign_codes',
    'hero_banners', 'service_categories', 'service_providers',
    'support_conversations', 'support_messages', 'platform_config',
    'activity_trail', 'escrow_deals', 'escrow_messages',
    'admin_notices', 'balance_movements'
]


def read_sql():
    with open(SCHEMA_FILE, 'r') as f:
        return f.read()


def try_management_api(sql):
    """Execute SQL via Supabase Management API (needs personal access token)."""
    token = os.environ.get('SUPABASE_ACCESS_TOKEN', '')
    if not token:
        return False, "No SUPABASE_ACCESS_TOKEN environment variable set"

    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/query"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    try:
        resp = requests.post(url, headers=headers, json={"query": sql}, timeout=180)
        if resp.status_code in (200, 201):
            data = resp.json()
            if data.get('error'):
                return False, f"SQL error: {data['error']}"
            return True, "Success via Management API"
        return False, f"HTTP {resp.status_code}: {resp.text[:200]}"
    except Exception as e:
        return False, str(e)


def try_direct_postgres(sql, password):
    """Connect via psycopg2 and execute SQL."""
    if not password:
        return False, "No database password provided"

    # Try the IPv6 direct connection first, then pooler
    conn_strings = [
        f"postgresql://postgres.{PROJECT_REF}:{password}@db.{PROJECT_REF}.supabase.co:5432/postgres?sslmode=require",
    ]
    # Add pooler endpoints for common regions
    for region in [
        "eu-central-1", "eu-west-1", "us-east-1", "us-west-1", "us-west-2",
        "ap-south-1", "ap-northeast-1", "ap-southeast-1", "sa-east-1",
        "me-south-1", "af-south-1", "ca-central-1",
    ]:
        conn_strings.append(
            f"postgresql://postgres.{PROJECT_REF}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres?sslmode=require"
        )

    for i, conn_str in enumerate(conn_strings):
        host = conn_str.split('@')[1].split(':')[0] if '@' in conn_str else '?'
        try:
            conn = psycopg2.connect(conn_str, connect_timeout=10)
            conn.autocommit = True
            cursor = conn.cursor()
            cursor.execute(sql)
            conn.close()
            return True, f"Success via {host}"
        except psycopg2.OperationalError as e:
            err = str(e).lower()
            if 'auth' in err or 'password' in err:
                return False, "Authentication failed — wrong database password"
            if i == 0:
                continue  # Try pooler endpoints
        except Exception:
            continue

    return False, "Could not reach any database endpoint"


def verify_tables():
    """Verify which tables exist via REST API."""
    headers = {"apikey": SERVICE_ROLE_KEY, "Authorization": f"Bearer {SERVICE_ROLE_KEY}"}
    found = []
    for table in NEW_TABLES:
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/{table}?select=id&limit=0",
                headers=headers, timeout=10
            )
            if resp.status_code == 200:
                found.append(table)
        except:
            pass
    return found


def main():
    sql = read_sql()

    print("=" * 64)
    print("  Softwallet v2 (سوفت واليت) — Database Setup")
    print("=" * 64)
    print(f"  SQL file:  {SCHEMA_FILE}")
    print(f"  SQL size:  {len(sql):,} chars")
    print(f"  Project:   {PROJECT_REF}")
    print()

    # Check if tables already exist (meaning setup was already done)
    existing = verify_tables()
    if existing:
        print(f"  ⚠ Found {len(existing)}/21 Softwallet tables already exist.")
        print(f"    Tables: {', '.join(existing)}")
        reply = input("    Re-run full setup (drop + recreate)? [y/N] ").strip().lower()
        if reply != 'y':
            print("  Aborted.")
            return

    success = False
    method = ""

    # Method 1: Management API
    print("[1/3] Trying Supabase Management API...")
    ok, msg = try_management_api(sql)
    if ok:
        success = True
        method = "Management API"
        print(f"  ✅ {msg}")
    else:
        print(f"  ⏭ Skipped: {msg}")
    print()

    # Method 2: Direct PostgreSQL
    if not success:
        print("[2/3] Trying direct PostgreSQL connection...")
        db_password = os.environ.get('DB_PASSWORD', '')
        ok, msg = try_direct_postgres(sql, db_password)
        if ok:
            success = True
            method = "Direct PostgreSQL"
            print(f"  ✅ {msg}")
        else:
            print(f"  ⏭ Skipped: {msg}")
    print()

    # Method 3: Manual
    if not success:
        print("[3/3] Manual execution required")
        print()
        print("  " + "─" * 60)
        print("  HOW TO EXECUTE THE SCHEMA:")
        print("  " + "─" * 60)
        print()
        print("  Option A — Supabase Dashboard (Recommended):")
        print(f"    1. Open https://supabase.com/dashboard/project/{PROJECT_REF}/sql")
        print(f"    2. Paste the contents of: {SCHEMA_FILE}")
        print("    3. Click ▶ Run (or Ctrl+Enter)")
        print()
        print("  Option B — Supabase CLI:")
        print("    1. npx supabase login")
        print(f"    2. npx supabase db execute --project-ref {PROJECT_REF} \\")
        print(f"       -f {SCHEMA_FILE}")
        print()
        print("  Option C — Management API (needs access token):")
        print("    1. Get token: https://supabase.com/dashboard/account/tokens")
        print("    2. export SUPABASE_ACCESS_TOKEN=<your-token>")
        print("    3. python3 setup_db.py")
        print()
        print("  Option D — Direct PostgreSQL (needs DB password):")
        print(f"    1. export DB_PASSWORD=<your-db-password>")
        print("    2. python3 setup_db.py")
        print()

    # Verify
    if success:
        print("Waiting for schema to propagate...")
        time.sleep(3)
        found = verify_tables()
        print(f"  Verification: {len(found)}/21 tables confirmed")
        if len(found) == 21:
            print("  🎉 All Softwallet tables created successfully!")
        else:
            missing = set(NEW_TABLES) - set(found)
            print(f"  Missing: {', '.join(sorted(missing))}")

    print()
    print(f"  Schema file: {SCHEMA_FILE}")


if __name__ == "__main__":
    main()