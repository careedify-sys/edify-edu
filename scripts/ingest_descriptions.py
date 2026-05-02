import os, sys, json
from pathlib import Path

try:
    from dotenv import load_dotenv
    import httpx
except ImportError:
    print("Install: pip install python-dotenv httpx")
    sys.exit(1)

load_dotenv(Path(__file__).parent.parent / ".env.local")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

REST_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}

JSON_PATH = Path(__file__).parent.parent / "data" / "university_descriptions.json"
if not JSON_PATH.exists():
    print(f"ERROR: {JSON_PATH} not found")
    sys.exit(1)

with open(JSON_PATH, encoding='utf-8') as f:
    data = json.load(f)

descriptions = data["descriptions"]
print(f"Found {len(descriptions)} descriptions to ingest")

client = httpx.Client(timeout=30)

slug_remaps = {
    "amity-online": ["amity-university-online", "amity-university-rajasthan-online"],
}

updated_count = 0
not_found_count = 0
for d in descriptions:
    slug = d["slug"]
    target_slugs = slug_remaps.get(slug, [slug])

    for target_slug in target_slugs:
        r = client.get(
            f"{REST_URL}/universities",
            headers=HEADERS,
            params={"select": "id,name", "slug": f"eq.{target_slug}"},
        )
        existing = r.json() if r.status_code < 400 else []

        if not existing:
            print(f"  NOT FOUND: {target_slug}")
            not_found_count += 1
            continue

        r2 = client.patch(
            f"{REST_URL}/universities",
            headers=HEADERS,
            params={"slug": f"eq.{target_slug}"},
            json={
                "description": d["about"],
                "known_for": d["known_for"],
                "history_summary": d["online_context"],
            },
        )
        if r2.status_code >= 400:
            print(f"  ERROR updating {target_slug}: {r2.status_code} {r2.text[:100]}")
        else:
            print(f"  Updated: {existing[0]['name']}")
            updated_count += 1

print()
print(f"Updated: {updated_count}")
print(f"Not found: {not_found_count}")
print()
print("Done. Refresh /verify/[slug] pages to see descriptions.")
client.close()
