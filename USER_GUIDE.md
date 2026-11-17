# VisaBrowser v0.3.0 User Guide

## Start and update on Windows

Extract the ZIP and double-click **Start-VisaBrowser.bat**. Leave its window open while using VisaBrowser. You can also run `py -3 scripts/local.py` from PowerShell in the extracted folder.

Use **Download latest** in the footer for a new app release. For newer published visa data in the current app, double-click **Update-Visa-Data.bat**, then stop and restart **Start-VisaBrowser.bat**. A successful data refresh updates the displayed data date. The app version changes when you start a newer release. Keep the same browser and local address to retain saved passengers and comparisons.

## Set up your group

1. Open **Passengers** and select **Add passenger**.
2. Enter a name and choose the passport the traveler will use. For someone with dual citizenship, choose the passport for this trip.
3. To add a visa or residence document, use **Add visa or permit**. An optional label can distinguish two different documents from the same issuer. Under **Edit**, the saved rows show their current issuer and type. Use **Clear answers** or **Reset entry answers** to reconsider earlier answers.
4. Select **Save passenger**. Use the checkbox by each name to choose the current group. **Clear selection** keeps everyone available. Check the selected count, then choose **Countries** or **Multi-search**.

## Compare destinations

Open **Multi-search** to check a shortlist. Type names separated by commas into **Destinations to compare**, for example `Brazil, USA, Japan`, and select **Check destinations**. You’ll see each selected passenger’s status for each matched destination. Names and destination codes are accepted. Put a name that contains a comma in double quotes, or use its code. Choose **View details** for actions and sources, or **Clear list** to start over. The **Multi-search** breadcrumb in a destination returns to the same list. Switching top-level tabs clears it.

Under **Countries**, use **Search and filter**. Leave **Search destinations** empty to browse all groups, or type a country or territory. Use **Filter by visa result** to filter for visa-free, no conventional advance visa, or pending results. Open a destination to see each traveler’s status, any action they need to take, and source notes.

| Result | What it means |
| --- | --- |
| **Visa-free for everyone** | The app found no visa requirement for the group. A traveler may still need an electronic travel authorization, registration, or other preparation. |
| **E-visa or visa on arrival for everyone** | Every traveler has one or both of those routes available in the data. Open the destination to see who must apply before travel and who has an option on arrival. |
| **1 issue**, **2 issues**, and higher | The number counts travelers flagged by the app. A mix of visa-free travelers and travelers needing an e-visa or visa on arrival can appear here. Read each traveler’s row to distinguish those cases from an advance visa requirement or entry ban. |
| **Pending verification** | The app explains which rule or answer needs checking. Use the search terms provided and the official guidance link when available. A pending passenger keeps the group out of favorable results. |
| **Existing visa covers this trip** | The app found a route using the existing travel document and the details you confirmed. |
| **Citizen entry** | This traveler is entering on their own country’s passport. The other travelers’ requirements still apply. |

Choose **Open Travel-Prep** at the bottom of the result to open the same destination in a new tab. TravelPrep displays a notice if it has no profile for that destination.

An asterisk marks a condition shown in the traveler’s result. **Update delayed** shows a source that could not be refreshed and the last successful refresh date, when available.

The shortlist also shows known stay limits, preparation steps, and conditions such as a waiver’s published end date. If a waiver needs a passport or itinerary detail, open **View details** to answer the question. A waiver past its last confirmed date displays **Pending verification** until the current rule can be confirmed.

## Save and revisit a destination

Choose **Save destination** on a result page. Under **Saved destinations**, choose **Open** to revisit it. Use **Recalculate** to check against the latest data available to the app, or **Edit** under **Saved passengers** to change a traveler for that saved comparison. Saved groups are separate from the current passenger list.

Passengers and saved destinations are stored in the current browser. The local preview and the GitHub Pages site each have their own saved data.

Before booking, check current entry and transit requirements with the relevant immigration authority, embassy, or consulate. The app’s **Source notes** and **Wikipedia source** links explain the data behind each comparison.

## Source dates and travel notes

GitHub Actions is configured to try refreshing the mapped Wikipedia articles every Tuesday at 10:23 UTC once weekly refresh is enabled. Published updates reach the local Windows copy after **Update-Visa-Data.bat** succeeds and you restart. Check **Wikipedia source** for the relevant passport’s last successful refresh. Destination notes can also highlight itinerary details, such as the East Africa Tourist Visa or identification checks on ferries to Zanzibar.

## Use VisaBrowser offline

1. Open VisaBrowser while connected and select **Save offline** beside the version.
2. Wait for **Saved offline**. The date below the header identifies the saved dataset. The complete download lets you use passports you haven’t opened before on this browser and device.
3. Reopen the app online or reconnect while it is open to check for **Update available**. Select it to download the replacement. An interrupted update leaves the previous complete download available.

An **Offline** message means the app is using cached data. When a source is overdue, an otherwise favorable result may show **Pending verification**. Check the dataset date before relying on an offline result. Opening official sources and following the Travel-Prep link require a connection.

You can use the offline feature from the HTTPS hosted site or from the local server described in the README. Browser storage limits or clearing site data can remove offline downloads.
