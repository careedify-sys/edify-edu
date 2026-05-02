import json

MANIFEST = "C:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/lib/data/programs-manifest.json"

with open(MANIFEST, 'r', encoding='utf-8') as f:
    data = json.load(f)

UNI = "amrita-vishwa-vidyapeetham-online"

# Slugs to DELETE (duplicates/legacy)
DELETE = {"environmental-social-and-governance-esg", "operations", "international-finance-and-accounting-acca"}

# Spec names for final canonical slugs
SPEC_NAMES = {
    "artificial-intelligence": "Artificial Intelligence",
    "business-analytics": "Business Analytics",
    "esg": "Environmental, Social and Governance (ESG)",
    "finance": "Finance",
    "fintech": "FinTech",
    "general-management": "General Management",
    "human-resource-management": "Human Resource Management",
    "international-finance-accounting": "International Finance and Accounting",
    "marketing": "Marketing",
    "operations-management": "Operations Management",
}

new_manifest = []
general_mgmt_added = False

for entry in data:
    if entry.get("university_slug") == UNI and entry.get("program") == "mba":
        slug = entry.get("spec_slug", "")
        # Drop deprecated slugs
        if slug in DELETE:
            print(f"  DELETED: {slug}")
            continue
        # Update spec_name if we have it
        if slug in SPEC_NAMES:
            entry["spec_name"] = SPEC_NAMES[slug]
            print(f"  UPDATED: {slug} -> {SPEC_NAMES[slug]}")
        new_manifest.append(entry)
    else:
        new_manifest.append(entry)

# Check if general-management already exists
existing_slugs = [e["spec_slug"] for e in new_manifest if e.get("university_slug") == UNI and e.get("program") == "mba"]
print(f"Existing after cleanup: {existing_slugs}")

if "general-management" not in existing_slugs:
    # Find position to insert (after last Amrita MBA entry)
    insert_idx = None
    for i, e in enumerate(new_manifest):
        if e.get("university_slug") == UNI and e.get("program") == "mba":
            insert_idx = i
    if insert_idx is not None:
        new_manifest.insert(insert_idx + 1, {
            "university_slug": UNI,
            "program": "mba",
            "spec_slug": "general-management",
            "spec_name": "General Management"
        })
        print("  ADDED: general-management")

# Also rename international-finance-and-accounting-acca if it survived (shouldn't, but safety check)
for e in new_manifest:
    if e.get("university_slug") == UNI and e.get("spec_slug") == "international-finance-and-accounting-acca":
        e["spec_slug"] = "international-finance-accounting"
        e["spec_name"] = "International Finance and Accounting"
        print("  RENAMED: international-finance-and-accounting-acca -> international-finance-accounting")

with open(MANIFEST, 'w', encoding='utf-8') as f:
    json.dump(new_manifest, f, indent=2, ensure_ascii=False)

# Verify final state
final = [e for e in new_manifest if e.get("university_slug") == UNI and e.get("program") == "mba"]
print(f"\nFinal Amrita MBA entries ({len(final)}):")
for e in final:
    print(f"  {e['spec_slug']!r:45s} -> {e['spec_name']!r}")
