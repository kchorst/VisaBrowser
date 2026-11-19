# VisaBrowser v0.4.0 — User Guide

## Open the app on a phone or computer

**[Open VisaBrowser](https://kchorst.github.io/VisaBrowser/)** in any modern mobile or desktop browser. It is designed primarily for use as a hosted website on your phone. No Windows installation is required for that version. The optional Windows local package is described below.

## 1. Set up travelers

On your first visit, choose **Add Another Traveler**. Enter a name or initials and choose the passport-issuing country. Optionally add existing visas or residence permits if you want them considered when checking a destination. Select **Save passenger**, then **Add Another Traveler** or **Continue**.

The **Travelers** screen lets you change names, passport countries, and saved visas/permits or remove a traveler with confirmation. Checkboxes choose which travelers are included in the next search. The app does **not** ask for passport expiration dates: you must verify each traveler's validity and blank pages yourself.

Travelers are saved automatically in this browser's local storage. Different devices, browsers and local-server addresses do not share profiles.

## 2. Select a dashboard action

There are four ways to browse requirements:

- **View Country** — type part of one destination's name and select it to open that country's requirements immediately.
- **Browse Countries** — search destinations alphabetically and filter by **Visa-Free**, **eVisa / Authorization**, **Visa Required**, or **Needs Review**. Each section displays an actual country count; tap a section to expand or collapse it.
- **Check Group Req** — compare all selected travelers using the most restrictive group classification. Group country lists start collapsed. When you open a country from this screen, the Group Summary starts expanded.
- **Search Multiple** — enter countries individually, then use **Up**, **Down**, or **Remove** on the destination chips to arrange the trip. Select **Search** once to compare the complete itinerary. Tap a result section to expand each traveler's details.

For mixed-passport groups, **Check Group Req** appears first. Otherwise **View Country** appears first. **Edit travelers** on the dashboard returns to the traveler list.

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

While online, select **Save offline** near the VisaBrowser version to download the full set of passport rules for this device. Wait until the status reads **Saved offline**. When a newer pack is published, **Update available** lets you replace it.

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
