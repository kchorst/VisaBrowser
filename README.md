# VisaBrowser v0.3.0

VisaBrowser compares tourist entry requirements for a group of travelers. Use **Countries** to search and filter a destination or **Multi-search** to check a list at once.

## Run locally on Windows

1. Download the ZIP and choose **Extract All**. Open the extracted `VisaBrowser` folder.
2. Double-click **Start-VisaBrowser.bat**. It requires Python 3.9 or later and opens [http://localhost:8000](http://localhost:8000) in your default browser.
3. Keep the command window open while you use VisaBrowser. Press **Ctrl+C** or close the window to stop it.

To start from PowerShell, open it in the extracted folder and run:

```powershell
py -3 scripts/local.py
```

If Windows does not recognize `py`, use `python scripts/local.py`. To serve only the bundled visa data with Python’s standard server, run `py -3 -m http.server 8000 --bind 127.0.0.1 --directory site` and open the same address yourself.

Keep using the same browser profile and address, including the port, to retain passenger profiles and saved comparisons across ZIP upgrades. Browser data for the hosted site is separate.

## Download updates

- **App release.** Use [Download latest](https://github.com/kchorst/VisaBrowser/releases/latest) and choose **VisaBrowser-Windows.zip**. Extract it to a new folder, close the older VisaBrowser tabs and stop its local server, then start the new copy. The header shows the version packaged with that release. Downloading a copy does not change its version.
- **Local visa data.** In your existing folder, double-click **Update-Visa-Data.bat**, or run `py -3 scripts/local.py --update`. Restart with **Start-VisaBrowser.bat** afterward. A successful update changes the visa-data date while keeping the app version. An interrupted download leaves the previous dataset available. This updater uses the published GitHub Pages data after the site is deployed.
- **Browser offline copy.** Use **Save offline** in the app. **Update available** refreshes that browser’s copy of the visa dataset served by the current site. On the local app, update the local files first. See the [User Guide](USER_GUIDE.md) for details.

## Wikipedia source refresh

The ZIP includes a dated snapshot adapted from mapped Wikipedia pages on visa requirements by nationality. The app reads these bundled or downloaded files. It does not make live Wikipedia requests while you search.

When the repository variable `VISABROWSER_ENABLE_REFRESH` is set to `true`, GitHub Actions attempts a refresh on Tuesdays at **10:23 UTC**. A maintainer can also run **Validate and deploy VisaBrowser** manually with **Fetch Wikipedia rule data before deploying** enabled. Each successful import replaces the previous passport rules after checks for missing rows, classifications, and notes. An unsuccessful passport import keeps its previous usable rules and is marked **Update delayed**. A source older than 14 days can cause an otherwise favorable result to show **Pending verification**. Open **Wikipedia source** on a result to see its last successful refresh date. Reviewed exceptions can supplement the Wikipedia table.

## First GitHub release

1. Add this folder to `kchorst/VisaBrowser`. In repository settings, choose **GitHub Actions** under **Pages → Build and deployment**.
2. Run **Validate and deploy VisaBrowser** on the default branch. Enable `VISABROWSER_ENABLE_REFRESH` in repository Actions variables when you want the weekly refresh to begin.
3. Push tag `v0.3.0` on the release commit. After validation passes, Actions creates the GitHub Release and attaches **VisaBrowser-Windows.zip**. Confirm the asset and the hosted page are available before sharing their links.

## License

VisaBrowser software uses the [PolyForm Noncommercial License 1.0.0](LICENSE.md). Wikipedia-derived material in `site/data/` is adapted under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The original article links are in `site/data/index.json` and the relevant passport files. The import converts Wikipedia tables into structured rules and extracts or summarizes source notes.

See the [User Guide](USER_GUIDE.md) for comparing passengers, saving destinations, and choosing which data to use offline.
