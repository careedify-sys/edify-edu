# Worklist 2: duplicate site records and their URL surface

Four pairs of site IDs resolve to a single UGC row, so the same real university
is in `lib/data.ts` twice. Retiring one side means redirecting every URL it owns.

`keep` is proposed as the record holding the sitemap presence, because that is the
side with the earned search surface. Both sides are yours to overrule.
to overrule. Note the two counts are different things: **sitemap** is presence in
`valid-urls.json`, while **renders** is what actually returns 200, because
`generateStaticParams` emits every record whether or not the sitemap lists it.
A retired record needs a redirect for everything in the renders column, plus the
spec pages that hang off each programme hub.

## main #29

| Record | Renders | In sitemap | Programmes | NAAC | Proposed |
|---|---|---|---|---|---|
| `sgt-university-online` | 33 | 32 | MBA, B.Com, BBA, BCA, MCA | A+ | **keep** |
| `shree-guru-gobind-singh-tricentenary-university-online` | 6 | 0 | B.Com, BBA, BCA, MBA, MCA | A+ | retire |

Redirects needed: **6**

```
/universities/shree-guru-gobind-singh-tricentenary-university-online  ->  /universities/sgt-university-online
/universities/shree-guru-gobind-singh-tricentenary-university-online/bba  ->  /universities/sgt-university-online/bba
/universities/shree-guru-gobind-singh-tricentenary-university-online/bca  ->  /universities/sgt-university-online/bca
/universities/shree-guru-gobind-singh-tricentenary-university-online/bcom  ->  /universities/sgt-university-online/bcom
/universities/shree-guru-gobind-singh-tricentenary-university-online/mba  ->  /universities/sgt-university-online/mba
/universities/shree-guru-gobind-singh-tricentenary-university-online/mca  ->  /universities/sgt-university-online/mca
```

## main #92

| Record | Renders | In sitemap | Programmes | NAAC | Proposed |
|---|---|---|---|---|---|
| `vit-university-online` | 29 | 29 | MBA, MCA, MSc | A++ | **keep** |
| `vit-vellore-online` | 1 | 0 | MSc | A++ | retire |

Redirects needed: **1**

```
/universities/vit-vellore-online  ->  /universities/vit-university-online
```

## main #84

| Record | Renders | In sitemap | Programmes | NAAC | Proposed |
|---|---|---|---|---|---|
| `sastra-university-online` | 6 | 6 | MBA | A++ | **keep** |
| `shanmugha-arts-science-technology-research-online` | 8 | 0 | B.Com, BBA, BCA, MA, M.Com, MBA, MCA | A+ | retire |

> Merge note: the retired side carries **B.Com, BBA, BCA, MA, M.Com, MCA**, which `sastra-university-online` does not list. Take the union of programmes, filtered by what the UGC row actually grants.

Redirects needed: **8**

```
/universities/shanmugha-arts-science-technology-research-online  ->  /universities/sastra-university-online
/universities/shanmugha-arts-science-technology-research-online/bba  ->  /universities/sastra-university-online/bba   (TARGET DOES NOT RENDER, redirect to the keep root instead)
/universities/shanmugha-arts-science-technology-research-online/bca  ->  /universities/sastra-university-online/bca   (TARGET DOES NOT RENDER, redirect to the keep root instead)
/universities/shanmugha-arts-science-technology-research-online/bcom  ->  /universities/sastra-university-online/bcom   (TARGET DOES NOT RENDER, redirect to the keep root instead)
/universities/shanmugha-arts-science-technology-research-online/ma  ->  /universities/sastra-university-online/ma   (TARGET DOES NOT RENDER, redirect to the keep root instead)
/universities/shanmugha-arts-science-technology-research-online/mba  ->  /universities/sastra-university-online/mba
/universities/shanmugha-arts-science-technology-research-online/mca  ->  /universities/sastra-university-online/mca   (TARGET DOES NOT RENDER, redirect to the keep root instead)
/universities/shanmugha-arts-science-technology-research-online/mcom  ->  /universities/sastra-university-online/mcom   (TARGET DOES NOT RENDER, redirect to the keep root instead)
```

## main #62

| Record | Renders | In sitemap | Programmes | NAAC | Proposed |
|---|---|---|---|---|---|
| `kalinga-institute-industrial-technology-online` | 29 | 29 | BA, B.Com, MA, M.Com | A++ | **keep** |
| `kiit-university-online` | 2 | 0 | M.Com, B.Com, MA | A++ | retire |

Redirects needed: **2**

```
/universities/kiit-university-online  ->  /universities/kalinga-institute-industrial-technology-online
/universities/kiit-university-online/mcom  ->  /universities/kalinga-institute-industrial-technology-online/mcom
```
