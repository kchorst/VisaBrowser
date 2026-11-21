# VisaBrowser v0.4.11 — User Guide

In v0.4.7, the UK result reflects the visitor visa and ETA exemption for British National (Overseas) passports. For the reviewed Kenyan results, the stay line shows the eTA exemption window and reminds travelers to confirm the permitted stay on arrival.

## Open the app on a phone or computer

**[Open VisaBrowser](https://kchorst.github.io/VisaBrowser/)** in any modern mobile or desktop browser. It is designed primarily for use as a hosted website on your phone. No Windows installation is required for that version. The optional Windows local package is described below.

## 1. Set up travelers

On the first visit, the **Your first traveler** form is visible immediately. Enter a name or initials and choose the passport country; no opening dialog is needed. Expand **Existing visas or residence permits (optional)** only when applicable. Select **Save first traveler**. Your traveler then appears on the **Travelers** screen, with **Add Another Traveler** underneath and **Continue** after the list. The Add Another action is not shown before the first person is saved.

The **Travelers** screen lets you change names, passport countries, and saved visas/permits or remove a traveler with confirmation. Checkboxes choose which travelers are included in the next search. The app does **not** ask for passport expiration dates: you must verify each traveler's validity and blank pages yourself.

Travelers are saved automatically in this browser's local storage. Different devices, browsers and local-server addresses do not share profiles.

## 2. Select a dashboard action

There are four ways to browse requirements:

- **View Country** — type part of one destination's name and select it to open that country's requirements immediately.
- **Browse Countries** — search destinations alphabetically and filter by **Visa-Free**, **eVisa / Authorization**, **Visa Required**, or **Needs Review**. Each section displays an actual country count; country lists begin hidden with a real item count next to each category. Choose **Show countries** to expand or **Hide countries** to collapse. Traveler lists, saved searches, itinerary destinations, and grouped results also have counts and **Show/Hide** controls. Long lists (more than five items) begin collapsed; shorter lists begin expanded.
- **Check Group Req** — compare all selected travelers using the most restrictive group classification. Group country lists start collapsed. When you open a country from this screen, the Group Summary starts expanded.
- **Search Multiple** — enter or paste multiple countries separated by commas (for example, *Mozambique, Brazil, Cape Verde, Portugal, China*) or select an individual country from the autocomplete list. Recognized destinations become ordered chips automatically; unknown entries stay in the text field for correction. Use **Up**, **Down**, or **Remove** to arrange the trip. Choose **Search Requirements** to compare all destinations. The results appear below as collapsed country summaries. Tap a result section to expand each traveler's details.

For mixed-passport groups, **Check Group Req** appears first. Otherwise **View Country** appears first. **Edit travelers** on the dashboard returns to the traveler list.

### Expand itinerary cards and open Travel-Prep

The top of the app links to Travel-Prep. **Visa dataset** shows when the current snapshot was generated, alongside the next scheduled Tuesday refresh. If that date passes before a fresh dataset arrives, the app marks the update overdue. An **Audit logged** date belongs to the individual finding or warning. It appears in traveler results and copied or shared reports.

Each destination card in **Search Multiple** and a reopened **Saved Search** has a clearly labeled **Show visa requirements** disclosure, which changes to **Hide visa requirements** after expansion. A separate **Travel-Prep ↗** link is always visible on the card, even while VisaBrowser requirements are collapsed; it opens that exact country in a new tab. Longer collections of destinations remain behind a counted Show/Hide control.

The two countries sometimes called "Congo" are explicitly distinguished as **Congo (Democratic Republic of the Congo)** and **Congo (Republic of the Congo)**. Older terms such as "Congo - Kinshasa" still work in destination search, and old automatically named saved searches display their clearer country names.

The **VisaBrowser** title at the top of the website links to Home. A new screen begins at the top, while returning from a country detail to its Browse Countries or Check Group Req list restores the earlier list position and filter. Saved itinerary headings wrap normally and show their check date separately.

### Open a specific destination from another app

Use the same country-code deep-link convention as Travel-Prep: `https://kchorst.github.io/VisaBrowser/#country=JP` for Japan. Use a supported ISO destination code in place of `JP`; existing `#destination/JP/view` links also work. VisaBrowser uses travelers selected in this browser. **On a first visit, a country link retains the destination and shows “Destination: Japan” above the first-traveler form. Once you save the first name and passport, the linked country's result opens immediately, without another country selection.** If existing travelers are deselected, select one to compare. Unknown codes return to the country picker with a notice.

### Visa-free travel versus entry paperwork

VisaBrowser distinguishes **Visa-Free · No additional steps identified** from **Visa-Free · Entry Steps Required**, **Electronic Visa / Visa on Arrival**, **Visa Required**, and **Needs Review**. A visa-free route may still require an ETA, arrival card, FMM form, health document, or other action. Such steps appear separately from the visa classification, and do not qualify for the strict **NO ISSUES** badge. When a passport's electronic-authorization eligibility is not officially verified, VisaBrowser retains **Needs Review** rather than inventing authorization eligibility.

Reviewed exceptions include New Zealand's temporary Kuwait-passport visa-waiver suspension, the current UK ETA nationality list/£20 fee, and US-passport tourist routes for Mexico, South Korea, Australia, and New Zealand. These are **specific reviewed rules**: a current source-date on an imported Wikipedia rule is not proof that every destination's entry requirements are current. In the expanded traveler detail, links marked **Official entry requirements** or application-specific links open an immigration authority's website for independent confirmation.

Clicking the VisaBrowser masthead navigates Home. If a country result or multi-country result has not been saved, choose **Save Search** or **Discard** in the confirmation dialog to complete the navigation; **Cancel** stays on the current results.

## 3. Interpret results carefully

Each country's result lists the requirements found for each selected traveler. Conditions, visa or authorization actions, known stay limits, fees when provided, and warnings appear inline. The mixed-group summary is expandable. Some outcomes depend on answers about a previously held visa, permit or special eligibility.

**NO ISSUES** is deliberately conservative: the available rules found no known visa or authorization obstacle for **every** selected traveler. It does *not* verify passport expiry, blank pages, health, transit requirements, entry eligibility, or grant admission.

| Category | Interpretation |
| --- | --- |
| **Visa-Free** | The group has an unqualified visa-free classification in the available rules, without outstanding prerequisites identified by the classifier. |
| **eVisa / Authorization** | At least one traveler needs an electronic visa, authorization, arrival visa or related action, and no traveler has a stricter visa requirement in the current classification. |
| **Visa Required** | One or more travelers need an advance visa or permission or face a documented restriction. |
| **Needs Review** | A source, exception, eligibility condition or other detail remains uncertain; do not assume visa-free travel. |

The country lists use the most restrictive traveler, not an average. A status may change when a traveler changes their passport, visa or residence permit, or when fresh published rules become available.

### Tourist documents and itinerary checks

Open a country result or expand a destination in a multi-country itinerary. The traveler cards show any reviewed onward ticket, arrival form, transit, and health requirements with source links. Check each entry after a side trip. For supported visas, compare **Number of entries**, **Visa validity**, and **Permitted stay** with the actual visa grant.

A requirement can depend on where you are coming from, how long you were there, your connections, or whether you need to collect bags and clear immigration. Use the displayed trigger to check your route. VisaBrowser does not collect the traveler’s full route or determine whether they can board. When a reviewed source leaves a question open, use the linked authority to confirm it. Date-limited notices describe rules known when the draft was prepared, so verify the current rule for the date of travel.

At the bottom of every results screen, **Important Travel Requirements & Disclaimer** is collapsed by default. Expand it for the full reminder about passport validity, blank pages, visas and documents, health/vaccines, travel history, allowed stays, fees, transit and immigration discretion. Critical country-specific conditions remain visible above it.

For destination preparation, choose **Open in Travel-Prep**. The link opens Travel-Prep in a separate tab for that specific country where supported.

## 4. Copy or share a result

On a country result, select **Copy** to copy the current country and group report, or **Share** to use a mobile device's share sheet when supported. **Copy Itinerary** and **Share Itinerary** include the selected countries in travel order.

Shared reports include the travelers and their results, date checked, VisaBrowser attribution, country-specific Travel-Prep links and the complete disclaimer—even when the on-screen disclaimer was collapsed.

## 5. Save and reopen comparisons

Search results are **not** saved automatically. Choose **Save destination** for a single-country result or **Save Search** for a multi-country itinerary. A suggested name can be edited, such as *Europe Trip 2027*.

When leaving unsaved results inside the app, a prompt offers **Save Search**, **Discard** or **Cancel**. Closing a browser tab is different: browsers do not support reliable custom Save/Discard/Cancel prompts on closing, so explicitly save anything important.

Choose **Saved Searches** from the dashboard to view saved records newest first. You can **Open**, **Rename** and **Delete** (with confirmation). Opening a saved comparison shows **the original saved result**, not a silently recalculated answer, together with its checked date.

**Refresh Results** asks permission before replacing the saved snapshot. A refresh checks all the required current rule sources and replaces the result only if successful; on failure the original saved result remains intact. The app reports changed requirements. A saved search is labeled **Needs Refresh** if it is over 30 days old or relevant details in the live traveler profile have changed. Searches have no version history.

Because storage is local to the current browser/profile, clearing website data or switching devices can remove saved searches. v0.4.0 does not provide cloud synchronization or import/export.

## 6. Use the app offline

While online, select **Save offline** near the VisaBrowser version to download the full set of passport rules for this device. Wait until the status reads **Saved offline**. When a newer pack is published, **Offline data update available** lets you replace it.

When **VisaBrowser update available** appears, choose the bright emerald **Update VisaBrowser** button to reload with the new app version. You can save or discard an open comparison first. If you still use v0.4.7, close all VisaBrowser tabs and any installed app window, then reopen while online to load the current version.

An interrupted offline update preserves the previous complete pack. Always check the displayed data date and do not treat outdated or unavailable sources as travel clearance. Links to Travel-Prep or external sites require a connection.

## 7. Optional Windows local version

Only use these steps if you prefer a local server instead of the hosted website.

1. Download **VisaBrowser-Windows.zip** from [GitHub Releases](https://github.com/kchorst/VisaBrowser/releases/latest) and extract all files.
2. Open the extracted `VisaBrowser` folder and double-click **Start-VisaBrowser.bat**.
3. Leave the command/status window open while browsing `http://localhost:8000`; stopping the command window stops the local server.
4. To update local visa data, run **Update-Visa-Data.bat** and restart the local server. To update the application itself, download a new release ZIP.

The local server requires Python 3.9+ and can also be started from PowerShell with `py -3 scripts/local.py`. Keep the local address/port and browser profile unchanged if you want to retain that local copy's saved profiles and results. Local data and hosted website data are separate.

## Travel safety and limitations

VisaBrowser is a planning aid, not an immigration authority. Before booking and again before departure, verify **every traveler's current rules** with the destination's consular or immigration authorities and applicable airlines. Confirm all relevant passports, visas and other documents, prior-country visits, vaccine/health rules, transit connections and maximum stay. Entry is always subject to immigration officials' final discretion.

The visa data is compiled from Wikipedia-derived sources and reviewed exceptions; its source and refresh metadata is included in the published data files. See [README](README.md) for licensing and developer validation details.
