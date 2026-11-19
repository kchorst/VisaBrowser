import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from verification_queue import build, classify_rule


class VerificationQueueTests(unittest.TestCase):
    def test_all_passports_and_unique_destinations_scanned(self):
        rows, missing, stats = build()
        self.assertEqual(stats["passport_profiles"], 207)
        self.assertEqual(stats["source_files_loaded"], 202)
        self.assertEqual(stats["unique_rule_pairs"], 46929)
        self.assertEqual(len(rows), 46929)
        self.assertEqual(len(missing), 5)
        self.assertEqual(len({(r["passport"], r["destination"]) for r in rows}), len(rows))
        self.assertEqual(sum(stats["priority_counts"].values()), len(rows))

    def test_known_official_finding_is_prioritized(self):
        rows, _, _ = build()
        by_id = {(r["passport"], r["destination"]): r for r in rows}
        for pair in [("KW", "NZ"), ("BNO", "GB"), ("CG", "KE")]:
            self.assertIn(pair, by_id)
            self.assertEqual(by_id[pair]["priority"], "P0")
            self.assertIn("official-evidence", by_id[pair]["reason_codes"])
        self.assertIn("free-electronic-authority-label",
                      by_id[("US", "GB")]["reason_codes"])
        self.assertIn("free-with-entry-steps",
                      by_id[("US", "MX")]["reason_codes"])

    def test_rank_is_conservative_and_deduplicated(self):
        src = {"lastSuccess": "2026-11-17", "url": "https://en.wikipedia.org/wiki/X"}
        rule = {
            "options": ["free"],
            "sourceText": "Electronic Travel Authorisation",
            "flags": ["Electronic travel authorization"],
            "notes": ["Fee is USD 40, valid until 2027"],
        }
        priority, score, flags = classify_rule("ZZ", "YY", src, rule)
        self.assertEqual(priority, "P1")
        self.assertEqual(len(flags), len(set(flags)))
        self.assertIn("fee-needs-current-verification", flags)
        self.assertIn("time-sensitive-description", flags)


if __name__ == "__main__":
    unittest.main()
