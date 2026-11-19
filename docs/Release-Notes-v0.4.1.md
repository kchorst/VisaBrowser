# VisaBrowser v0.4.1 — Release Notes

Released implementation of the approved [v0.4.0 mobile-first UX specification](VisaBrowser-UX-Spec-v0.4.0.md).

## Primary use

Open **https://kchorst.github.io/VisaBrowser/** on a mobile device or desktop browser. The Windows local package is optional and uses a local HTTP server.

## Included workflows

- Add, edit, select, and remove traveler profiles; optionally record existing visas and residence permits.
- The dashboard prioritizes **Check Group Req** for mixed-passport groups and **View Country** otherwise.
- Search a single destination, browse live-filtered categories with actual counts, or build an ordered multi-country itinerary.
- Compare one traveler or a mixed group with conservative status classifications and clearly marked pending checks.
- Copy or share country and itinerary reports, including the full disclaimer and country-specific Travel-Prep links.
- Explicitly save a destination or itinerary; rename, reopen and delete saved searches; refresh only with confirmation. Failed refreshes leave the previous saved snapshot intact.
- Keep the general travel disclaimer collapsed at the bottom of result screens while exposing important destination-specific warnings inline.

## Quality gates

- Node unit tests for visa rules, classification, group safety and reviewed exception cases.
- Python source, import and data-validation tests.
- Headless mobile Chromium acceptance tests including the shipped-data Japan, US/Canada mixed-passport, Visa-Free browse, France/Italy/Croatia itinerary and saved-search workflows, plus synthetic failure cases.
- Deployment workflow validates GitHub Pages and publishes a Windows ZIP under the new `v0.4.1` tag.

**Acceptance limitation:** simulated mobile/browser tests do not replace an end user's actual Windows or mobile-device testing.

## Known limitations

- Visa requirements are informational and must be independently verified with destination authorities.
- Data depends on the coverage, freshness and accuracy of imported source material; unresolved and outdated cases are shown as needing review.
- Browser-stored profiles and saved searches are local to each origin and browser profile and are not synced between devices.
- An offline pack must first be explicitly downloaded online for offline comparisons.
- Travel-Prep deep links are best-effort and may not identify every territory.
