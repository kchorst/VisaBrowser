# VisaBrowser v0.4.0

**[Open VisaBrowser on your phone](https://kchorst.github.io/VisaBrowser/)**

VisaBrowser compares tourist entry requirements for travelers with different passports. It runs in your mobile or desktop browser.

## Get started

1. Add traveler names and passport countries (and optional existing visas or permits).
2. Open the mobile dashboard to **View Country**, **Browse Countries**, **Check Group Req**, or **Search Multiple**.
3. Review each traveler’s result and the expandable travel disclaimer; check official requirements before travel.

The [v0.4.0 UX redesign specification](docs/VisaBrowser-UX-Spec-v0.4.0.md) tracks the complete approved design. The current release begins its implementation; features not yet implemented are not represented as complete.

Select **Save offline** to make the visa data available on this device when you’re offline. When **Update available** appears, select it to refresh that copy. See the [User Guide](USER_GUIDE.md) for more detail.

## Visa data and updates

The date shown in VisaBrowser identifies the data snapshot. Open **Wikipedia source** on a result to see when that passport's source last refreshed. Reviewed exceptions can supplement the Wikipedia table. Check official immigration guidance before traveling.

Once scheduled refreshes are enabled, GitHub Actions attempts to refresh the mapped Wikipedia sources on Tuesdays at **10:23 UTC**. The app uses the published snapshot when you search. If a passport's source fails to refresh, VisaBrowser keeps the previous usable rules and shows **Update delayed**. A source older than 14 days can cause an otherwise favorable result to show **Pending verification**.

## Run locally on Windows

For a self-hosted copy, open [GitHub Releases](https://github.com/kchorst/VisaBrowser/releases/latest) and download **VisaBrowser-Windows.zip** when available.

1. Download the ZIP and choose **Extract All**. Open the extracted `VisaBrowser` folder.
2. Double-click **Start-VisaBrowser.bat**. It requires Python 3.9 or later and opens [http://localhost:8000](http://localhost:8000) in your default browser.
3. Keep the command window open while you use VisaBrowser. Press **Ctrl+C** or close the window to stop it.

To start from PowerShell, open it in the extracted folder and run:

```powershell
py -3 scripts/local.py
```

If Windows does not recognize `py`, use `python scripts/local.py`. To serve only the bundled visa data with Python’s standard server, run `py -3 -m http.server 8000 --bind 127.0.0.1 --directory site` and open the same address yourself.

Keep using the same browser profile and address, including the port, to retain passenger profiles and saved comparisons across ZIP upgrades. Browser data for the hosted site is separate.

To refresh the local visa data, run **Update-Visa-Data.bat** or `py -3 scripts/local.py --update`, then restart **Start-VisaBrowser.bat**. A successful refresh updates the visa-data date. An interrupted download leaves the previous dataset available. To update the app version, download a newer release, close the old VisaBrowser tabs, stop its server, and start the new copy.

## Maintainer setup

1. In repository settings, choose **GitHub Actions** under **Pages → Build and deployment**.
2. Run **Validate and deploy VisaBrowser** on `main`. Select **Fetch Wikipedia rule data before deploying** for a manual refresh. Set the repository Actions variable `VISABROWSER_ENABLE_REFRESH` to `true` to enable the weekly schedule.
3. Push a version tag on the release commit. After validation passes, Actions creates the GitHub Release and attaches **VisaBrowser-Windows.zip**.

## License

VisaBrowser software uses the [PolyForm Noncommercial License 1.0.0](LICENSE.md). Wikipedia-derived material in `site/data/` is adapted under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The original article links are in `site/data/index.json` and the relevant passport files. The import converts Wikipedia tables into structured rules and extracts or summarizes source notes.
