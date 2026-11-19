# VisaBrowser v0.4.9

**[Launch VisaBrowser on your phone or computer](https://kchorst.github.io/VisaBrowser/)**

VisaBrowser is a mobile-first browser app for comparing tourist entry requirements for one traveler or a group with different passports. **The hosted browser link is the primary product**; no download, account, or installation is required. A secondary, optional Windows local-server package is available for people who prefer to run a copy on their own machine.

## Quick start

1. Open **[VisaBrowser](https://kchorst.github.io/VisaBrowser/)** in the browser on your phone, tablet or PC.
2. On the first screen, enter the **first traveler's name or initials and passport country** directly in the visible form. Optionally expand **Existing visas or residence permits**. Save the first traveler; then add another traveler below the traveler list or choose **Continue**.
3. On the dashboard choose **View Country**, **Browse Countries**, **Check Group Req**, or **Search Multiple**. Mixed-passport groups see **Check Group Req** first.
4. Review each person's result. A cautious **NO ISSUES** flag means no known visa or authorization obstacle was found in the available rules, **not** that entry or passport compliance is guaranteed. Open the collapsed disclaimer at the bottom of each result.

**Itinerary country cards** have a visible Show/Hide visa requirements hint and a separate always-visible Travel-Prep link for each destination, including saved searches. The title links Home; new screens start at the top, while returning to a filtered Browse/Group country list restores your previous position. The two Congos are labeled **Congo (Democratic Republic of the Congo)** and **Congo (Republic of the Congo)**, with their former names retained as search aliases.

**Reviewed entry-classification corrections (v0.4.6):** visas and electronic entry permissions are separate from additional entry paperwork; visa-free destinations with a known requirement appear in their own **Visa-Free · Entry Steps Required** group rather than as unexplained visa restrictions. Officially reviewed cases include Kuwait passport New Zealand visa-waiver suspension (from 12 Nov 2026), current UK ETA passport eligibility and £20 application cost, US passport Mexico route-specific FMM documentation, temporary Korea K-ETA exemption and e-Arrival card, Australian ETA subclass 601 visa, and New Zealand NZeTA. These are targeted, cited overrides, **not** blanket corrections to 46,929 imported records. Unverified nationalities remain pending rather than receiving invented entry guarantees. A masthead click routes Home through the unsaved-result Save/Discard confirmation. See [official-source audit issue](https://github.com/kchorst/VisaBrowser/issues/18).

**v0.4.8** adds reviewed tourist health and entry notices, source links and an in-app update prompt. See the [tourist entry audit](docs/verification/P1-REVIEW-COMPLETION-2026-11-19.md).

**v0.4.7 official-source corrections** cover the UK visitor visa and ETA exemption for British National (Overseas) passports and 13 Kenyan eTA exemption records. Kenya’s displayed exemption period is separate from the stay granted at the border. See the [all-passport audit](docs/verification/PHASE1-PHASE2-2026-11-19.md).

**Lists and counts:** Browse Countries and Check Group Req start with country lists hidden, displaying each category's real count and a clearly labeled **Show countries** button. Other collections—travelers, saved searches, itinerary destinations and result groups—also show their item counts and **Show/Hide** controls. Lists of more than five items start collapsed; shorter lists appear expanded to keep immediate actions discoverable. The **Hide** control works on every list.

**Search Multiple** accepts a comma-separated itinerary in one entry, including a pasted list such as `Mozambique, Brazil, Cape Verde, Portugal, China`. Recognized destinations appear automatically in travel order, and **Search Requirements** compares the list. Unknown names remain in the field for correction. You can also select a single destination from suggestions or press Enter.

**View Country** supports a searchable destination picker; **Browse Countries** filters by visa-free, eVisa/authorization, visa required or needs review; **Check Group Req** uses the most restrictive group status; **Search Multiple** builds an ordered itinerary with editable country chips. Results can be copied or shared with destination-specific links to [Travel-Prep](https://kchorst.github.io/Travel-Prep/).

**Direct country links from other apps:** `https://kchorst.github.io/VisaBrowser/#country=JP` opens Japan's result. Replace `JP` with the uppercase ISO destination code; lowercase codes also work. Unknown codes open the destination picker with a notice. Existing `#destination/JP/view` links remain supported. A linked result uses travelers already selected in that browser. **On a first visit with no travelers, VisaBrowser retains the linked destination, displays the first-traveler form with “Destination: [country],” and automatically shows that country's requirements once the name and passport are saved.** If existing travelers are all deselected, the app prompts the user to select travelers.

Travelers persist in local browser storage. **Search results persist only when you explicitly choose Save Search**. Saved single destinations and itineraries retain their original snapshots; refreshing results is a confirmed, all-or-nothing action. A relevant traveler-profile change or an older result produces **Needs Refresh**. Saved data is not synchronized between browsers, devices or the optional local server.

For screens, examples and limitations, see the [User Guide](USER_GUIDE.md) and the approved [v0.4.0 UX specification](docs/VisaBrowser-UX-Spec-v0.4.0.md).

## Data confidence and offline use

VisaBrowser uses Wikipedia-derived visa tables plus carefully reviewed exception rules. A **Pending verification** result indicates that missing, stale, conditional or conflicting information needs checking. Country-specific conditions remain visible even when the general travel disclaimer is collapsed.

Use **Save offline** in the app to download a full local visa-data pack for use without a connection. Choose **Offline data update available** to update that pack. Choose **Update VisaBrowser** when an app update is ready. The data date appears in the header. Offline or stale data is **not a substitute for confirmation with immigration authorities**.

## Optional Windows local-server package

The hosted browser link above is recommended. For the local copy, use the latest **[GitHub Release](https://github.com/kchorst/VisaBrowser/releases/latest)** and download `VisaBrowser-Windows.zip`.

1. Extract the ZIP and open the `VisaBrowser` folder.
2. Double-click **Start-VisaBrowser.bat**. Python 3.9+ is required. The local server opens `http://localhost:8000` in your browser.
3. Leave the command window open while using the app; close it to stop the server.

PowerShell alternative: `py -3 scripts/local.py`. The `Update-Visa-Data.bat` script updates locally published visa data. Use the same localhost address, port and browser profile across local updates to retain that copy's saved records. The hosted app has separate browser storage.

The command/status window displayed by Windows belongs to the **optional local server**. It is **not required** when using the hosted VisaBrowser link on a phone or PC.

## Developer tests and release

`npm test` runs Node rule and UX-safety tests. `python -m unittest discover -s tests -p 'test_*.py'` runs Python source/import tests. `python scripts/validate.py` validates generated data. `python tests/browser_acceptance.py` runs mobile-emulated Chromium workflows and requires Playwright with Chromium installed.

GitHub Actions validates all these steps before publishing the site and release package. The workflow can optionally refresh mapped Wikipedia sources on its weekly schedule (configured by `VISABROWSER_ENABLE_REFRESH`). The release ZIP contains the same site as the deployed browser app.

**Real-device Windows and mobile acceptance remains separate from CI.** Browser-emulated QA and automated tests do not establish success on every actual device.

## License and source attribution

Software: [PolyForm Noncommercial License 1.0.0](LICENSE.md). Wikipedia-derived rules in `site/data/`: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Source links and snapshot metadata are preserved in the published data files. Always verify current visa, authorization, passport, health, transit and entry rules with appropriate authorities before traveling.
