# Spec-slug 404 audit

## A. Broken internal links (0)

None. Every spec URL written in the codebase resolves.


## B. Generic slugs that 404 despite an equivalent spec (9 URLs, 8 distinct from→to pairs)

| programme | requested slug (404s) | university actually serves | display name | unis |
|---|---|---|---|---|
| bca | `computer-applications` | `computer-applications-data-science` | Computer Applications – Data Science | 2 |
| mba | `finance-marketing` | `finance-marketing-human-resources-operations-strategy-contact-university-for-specialisation-structure` | Finance Marketing Human Resources Operations Strategy Contact University For Specialisation Structure | 1 |
| bba | `data-analytics` | `business-analytics-specialization-with-data-focuse` | Business Analytics specialization with data-focuse | 1 |
| bca | `data-science` | `computer-applications-data-science` | Computer Applications – Data Science | 1 |
| bca | `general-computer-applications` | `general-computer-applications-contact-university-for-specialisation` | General Computer Applications Contact University For Specialisation | 1 |
| bca | `computer-applications` | `general-computer-applications-contact-university-for-specialisation` | General Computer Applications Contact University For Specialisation | 1 |
| mcom | `general-commerce-and-management` | `general-commerce-taxation` | General Commerce (Taxation | 1 |
| mcom | `general-commerce` | `general-commerce-taxation` | General Commerce (Taxation | 1 |

### Full URL list

/universities/chandigarh-university-online/bba/data-analytics  ->  /universities/chandigarh-university-online/bba/business-analytics-specialization-with-data-focuse
/universities/amity-university-online/bca/computer-applications  ->  /universities/amity-university-online/bca/computer-applications-data-science
/universities/gla-university-online/bca/computer-applications  ->  /universities/gla-university-online/bca/computer-applications-data-science
/universities/gla-university-online/bca/data-science  ->  /universities/gla-university-online/bca/computer-applications-data-science
/universities/mats-university-online/bca/computer-applications  ->  /universities/mats-university-online/bca/general-computer-applications-contact-university-for-specialisation
/universities/mats-university-online/bca/general-computer-applications  ->  /universities/mats-university-online/bca/general-computer-applications-contact-university-for-specialisation
/universities/mats-university-online/mba/finance-marketing  ->  /universities/mats-university-online/mba/finance-marketing-human-resources-operations-strategy-contact-university-for-specialisation-structure
/universities/kurukshetra-university-online/mcom/general-commerce  ->  /universities/kurukshetra-university-online/mcom/general-commerce-taxation
/universities/kurukshetra-university-online/mcom/general-commerce-and-management  ->  /universities/kurukshetra-university-online/mcom/general-commerce-taxation
