import httpx, os, re
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent.parent / ".env.local")
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Get Supabase slugs
r = httpx.get(f"{url}/rest/v1/universities",
    headers={"apikey": key, "Authorization": f"Bearer {key}"},
    params={"select": "slug,name", "limit": 200})
sb = {u["slug"]: u["name"] for u in r.json()}

# Get data.ts slugs
data = open(Path(__file__).parent.parent / "lib" / "data.ts", encoding="utf-8").read()
ids = re.findall(r"id: '([^']+)'", data)
data_set = set(ids)
sb_set = set(sb.keys())

print("=== In Supabase but NOT in data.ts (verify links will 404) ===")
mismatches = sorted(sb_set - data_set)
for s in mismatches:
    print(f"  {s}  ->  {sb[s]}")
print(f"\nTotal: {len(mismatches)}")

print("\n=== In data.ts but NOT in Supabase ===")
missing = sorted(data_set - sb_set)
for s in missing:
    print(f"  {s}")
print(f"\nTotal: {len(missing)}")

# Build slug mapping: supabase_slug -> data_slug (by fuzzy matching)
print("\n=== Suggested slug mapping (supabase -> data.ts) ===")
def norm(s):
    return s.lower().replace("-online","").replace("-"," ").strip()

for sb_slug in mismatches:
    sb_norm = norm(sb_slug)
    best = None
    best_score = 0
    for d_slug in missing:
        d_norm = norm(d_slug)
        # simple overlap
        common = len(set(sb_norm.split()) & set(d_norm.split()))
        if common > best_score:
            best_score = common
            best = d_slug
    if best and best_score >= 2:
        print(f'  "{sb_slug}": "{best}",')
