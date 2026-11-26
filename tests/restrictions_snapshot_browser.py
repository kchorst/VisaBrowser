"""Exercise the draft restrictions loader with real browser Cache Storage."""

import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
FIXTURE_PATH = "tests/fixtures/approved-restrictions-snapshot.json"


class FixtureHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b"<!doctype html><title>Draft restrictions browser test</title>")
        else:
            super().do_GET()


def run():
    version = json.loads((ROOT / FIXTURE_PATH).read_text())["datasetVersion"]
    with ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(FixtureHandler, directory=ROOT)
    ) as server:
        worker = Thread(target=server.serve_forever, daemon=True)
        worker.start()
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch()
                context = browser.new_context(**playwright.devices["Pixel 7"])
                page = context.new_page()
                page.goto(f"http://127.0.0.1:{server.server_port}/")
                page.evaluate(
                    """async ({ path, version }) => {
                        const { loadRestrictionsSnapshot, getSnapshotBorderNotices } =
                            await import('/site/restrictions-snapshot.js');
                        const url = new URL(path, window.location).href;
                        const cache = await caches.open('synthetic-restrictions-test');
                        window.readRestrictions = async (approvedVersion = version) => {
                            const snapshot = await loadRestrictionsSnapshot({
                                url, cache, approvedVersion,
                            });
                            return {
                                state: snapshot.state,
                                territory: getSnapshotBorderNotices(snapshot, 'TEST-TERRITORY')
                                    .map(({ id }) => id),
                                mainland: getSnapshotBorderNotices(snapshot, 'TEST-MAINLAND')
                                    .map(({ id }) => id),
                            };
                        };
                    }""",
                    {"path": FIXTURE_PATH, "version": version},
                )
                expected = {"territory": ["synthetic-territory-customs"], "mainland": []}
                assert page.evaluate("readRestrictions()") == {"state": "online", **expected}
                context.set_offline(True)
                cached = page.evaluate("readRestrictions()")
                assert cached == {"state": "offline", **expected}, cached
                assert page.evaluate(
                    "readRestrictions('sha256-' + '0'.repeat(64))"
                ) == {"state": "unavailable", "territory": [], "mainland": []}
                context.close()
                browser.close()
        finally:
            server.shutdown()
            worker.join()


if __name__ == "__main__":
    run()
