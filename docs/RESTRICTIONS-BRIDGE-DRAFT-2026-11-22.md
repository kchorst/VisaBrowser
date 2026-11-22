# Travel-Prep restrictions bridge — nonproduction proposal (2026-11-22)

**Status:** Phase 2 architecture draft only; not deployed. Phase 1 still researching all destinations.

VisaBrowser remains the visa/ETA authority for its own passport-destination classifications. It may consume a verified, versioned subset from Travel-Prep: *border-relevant* warnings only (entry, transit, customs and departure), with destination-code matching and links to the country-specific Travel-Prep page. Do not expose generalized photography, driving, dress, or other in-country guidance as an entry prohibition.

The preliminary inventory has 275 destination identifiers, including 26 non-ISO special cases. Travel-Prep currently lists 196. Before activating any cross-application mapping, complete the destination parity review and verify exact legal jurisdiction and available deep-link formats. **Never match territories to parent countries automatically.**

## Proposed integration gates
- Pin an immutable Travel-Prep release-data hash and schema version.
- Only pass records with `status=verified` or `conditional`, `visabrowser_alert=true`, and at least one relevance flag of `entry`, `transit`, `customs`, or `departure`.
- Require checked date, legal scope and official source; label route-dependent and airline-specific restrictions.
- Show brief VisaBrowser warnings that do not affect visa category ranking or "No Issues" classifications unless independently reviewed in VisaBrowser's entry rules.
- Do not render draft, unverified, conflicting, or incomplete research records.
- Do not insert country rules until Phase 1 conclusions and Phase 2 UI review are approved.
- Verify mobile, offline, territory deep links and cross-app version consistency before any release.

See `site/restrictions-bridge.js` for a *pure filter* that is not yet imported into the application, plus `tests/restrictions-bridge.test.js`.
