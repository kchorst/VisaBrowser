# VisaBrowser UX Redesign Specification v0.4.0
Date: 2026-11-18
Status: Approved design baseline

## Product
Mobile-browser-first visa and tourist entry comparison for one traveler or groups. GitHub Pages is the primary deployment; Windows local server is optional. Existing Wikipedia-derived passport rule snapshots and cautious pending-verification logic remain; never promise entry.

## Traveler setup
First run: name/initials, passport-issuing country, optional existing visas/residence permits; Add Another and Continue. No passport expiry date input. Profiles auto-persist in local browser storage. Allow edit/delete (confirmation) and optional additional passports without crowding the initial form. A compact editable traveler summary appears on the dashboard. Changes affecting eligibility mark dependent saved searches Needs Refresh, without silently replacing results.

## Dashboard
Four focused actions: View Country, Browse Countries, Check Group Req, Search Multiple. Check Group Req is primary for mixed passport nationalities; View Country primary otherwise. Secondary Saved Searches button and discreet Travel-Prep link. One prominent primary action, neutral secondary controls.

## View Country
Searchable destination picker; selecting a destination immediately shows results. One traveler: personal result. Group: per-traveler sections and collapsible Group Summary; mixed group defaults individual sections visible, group summary collapsed. Provide Copy, native Share, Save Search, and destination Travel-Prep link.

## Browse Countries
All countries initially; searchable names and filters: Visa-Free, eVisa/Authorization, Visa Required, Needs Review. Alphabetical list; actual category counts. Group classification uses the most restrictive traveler and highlights uncertainty. Preserve filter, expansion and scroll on Back.

## Check Group Req
Group Summary expanded by default, categories collapsed with counts. Selecting a destination shows group and individual requirements. Back restores prior list and scroll.

## Rating safety
NO ISSUES only if every selected traveler has no known visa or authorization obstacle and no eligibility reliance on an existing foreign visa/residence permit; unresolved, stale, conditional, or missing information prevents NO ISSUES. No claim of passport compliance without collecting expiration or blank-page information. Every destination's passport validity/blank-page requirements should be shown when known. Status is guidance, not admission clearance.

## Search Multiple
Autocomplete destination selection with removable chips; one Search button; preserve entered itinerary order; up/down reorder; Clear All with confirmation. Result sections collapsed initially with concise country/group status, expanding to per-traveler details and country Travel-Prep link. Preserve unsaved in-session state when navigating.

## Saved Searches
Only traveler profiles persist automatically. Searches/results persist only on explicit Save Search, with suggested editable destination/date name. Prompt Save/Discard/Cancel on in-app navigation away from unsaved results. Save list newest first, rename/delete with confirmation. Reopen saved snapshot with checked date; refresh confirms replacement, checks current available data, highlights differences, and replaces old snapshot only on success. Refresh failure leaves original. No history. Mark Needs Refresh after relevant traveler edits or after 30 days. No export/import in v0.4.0. Browser storage is device/browser scoped.

## Share
Copy and native Share follow search scope: one traveler, one country, group, or itinerary. Include result, checked date, VisaBrowser attribution, country-specific Travel-Prep destination links, and full travel disclaimer.

## Travel-Prep
Open in a new tab. Attempt direct country/territory deep link; fall back to Travel-Prep's country selector when destination cannot be resolved. Do not invent destination mappings; accept user reports of gaps.

## Travel disclaimer
Collapsed by default at bottom of every results screen, titled “Important Travel Requirements & Disclaimer”, expandable/collapsible. Full text is always included in Copy/Share. Remind travelers to verify current rules with destination immigration/consular authorities, including passport validity, blank pages, visas and supporting documentation, vaccines/health, prior-country visits, permitted duration, fees, transit and admission discretion. Critical destination-specific warnings remain visible outside collapsed text. Do not link directly to official government websites in the redesigned result UI.

## Quality gates
Automated tests for group safety, persistence, navigation, multi-search order, refresh failure, share scope and disclaimer; responsive/mobile keyboard, touch target, focus and back navigation audit; preserve offline support and data licensing; synchronize version, README and User Guide; run Windows end-user acceptance after release. Do not claim Windows/device verification from automated tests alone.
