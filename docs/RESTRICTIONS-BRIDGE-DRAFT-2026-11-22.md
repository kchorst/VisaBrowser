# Travel-Prep restrictions bridge — nonproduction proposal (2026-11-22)

**Status:** Phase 2 architecture draft only; not deployed. Phase 1 still researching all destinations.

VisaBrowser remains the visa/ETA authority for its own passport-destination classifications. It may consume a verified, versioned subset from Travel-Prep: *border-relevant* warnings only (entry, transit, customs and departure), with destination-code matching and links to the country-specific Travel-Prep page. Do not expose generalized photography, driving, dress, or other in-country guidance as an entry prohibition.

The preliminary inventory has 275 destination identifiers, including 26 non-ISO special cases. Travel-Prep currently lists 196. Before activating any cross-application mapping, complete the destination parity review and verify exact legal jurisdiction and available deep-link formats. **Never match territories to parent countries automatically.**

## Proposed integration gates
- Pin the immutable SHA-256 of Travel-Prep's approved `visa-browser` audience snapshot and schema version. Travel-Prep exports only the approved border subset in that artifact. The audience is hashed with the approval metadata, destinations, and records. Do not point the loader or cache at the comprehensive `travel-prep` artifact.
- Only pass records with `status=verified` or `conditional`, `visabrowser_alert=true`, and at least one relevance flag of `entry`, `transit`, `customs`, or `departure`.
- Require checked date, legal scope and official source; label route-dependent and airline-specific restrictions.
- Require every source check date to be on or before the snapshot approval date, including when reading an offline copy. Later checks require a newly approved snapshot. A scheduled rule can still take effect after approval.
- Show brief VisaBrowser warnings that do not affect visa category ranking or "No Issues" classifications unless independently reviewed in VisaBrowser's entry rules.
- Do not render draft, unverified, conflicting, or incomplete research records.
- Do not insert country rules until Phase 1 conclusions and Phase 2 UI review are approved.
- Verify mobile, offline, territory deep links and cross-app version consistency before any release.

See `site/restrictions-bridge.js` for a *pure filter* that is not yet imported into the application, plus `tests/restrictions-bridge.test.js`.

## Offline and destination states

The draft loader treats invalid endpoints, missing pins, incompatible
audiences, failed digest verification, and unavailable network/cache as
unavailable approved data. It considers a cache copy only for the same URL
and exact approved pin. Older draft caches without the hashed audience field
cannot supply notices. Show the approval date and version when presenting a
verified offline result.

Use `getSnapshotBorderNoticeResult` in any future presentation. It distinguishes
unavailable data, an absent destination, an included destination with no
matching notices, and matching notices. An empty list does not establish
legal clearance. Keep the visa outcome separate. If Travel-Prep cannot resolve
a code to an exact, reviewed profile, link to destination search and show a
preparation coverage message. Keep passport and itinerary controls focused
when refreshing notices, announce updates politely, and use specific authority
link names. Real-device layout, screen-reader output, and service-worker
interaction remain pending for the future UI.
