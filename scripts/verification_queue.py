#!/usr/bin/env python3
"""Produce a reproducible, deduplicated passport–destination verification queue.

Risk scores are review priorities, NOT assertions that an immigration rule is
incorrect. Only an authority-backed evidence entry may establish a correction.

Usage:
    python scripts/verification_queue.py --output audit-output
Run from repository root; requires only the Python standard library.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "site" / "data"
ETA_LABEL = re.compile(
    r"^(?:eta(?:-il| uk)?|k-eta|nzeta|etias|evisitor|evisa waiver|"
    r"electronic(?:al)? (?:system for )?travel authori[sz](?:ation|ations|ed)|"
    r"electronic travel authority)$",
    re.I,
)
MONEY = re.compile(
    r"(?:£|€|\\$|\\b(?:USD|GBP|AUD|NZD|EUR|KES|NIS|CAD)\\s*)\\s*\\d+[.,]?\\d*|"
    r"\\b\\d+[.,]?\\d*\\s*(?:USD|GBP|AUD|NZD|EUR|KES|NIS|CAD)\\b",
    re.I,
)
TEMPORARY = re.compile(
    r"\\b(?:temporar(?:y|ily)|suspend(?:ed|sion)?|until|expires?|"
    r"extended|waiver ends?|valid through|as of|effective from|202[5-9])\\b",
    re.I,
)
PASSPORT = re.compile(
    r"\\b(?:biometric|identification number|travel document|refugee|"
    r"passport card|diplomatic|service passport|non-citizen passport)\\b", re.I
)
ROUTE = re.compile(
    r"\\b(?:airport|land border|port of entry|transit|cruise|"
    r"airside|multiple entry|residen(?:t|ce)|permit)\\b", re.I
)
CASE_IDS = {
    ("KW", "NZ"): ("published-waiver-suspension", 110),
    ("BNO", "GB"): ("uk-nationality-exemption", 108),
    ("CG", "KE"): ("kenya-eta-exemption", 107),
    ("US", "GB"): ("uk-eta-fee-and-eligibility", 95),
    ("US", "MX"): ("arrival-route-documentation", 95),
    ("US", "KR"): ("temporary-keta-waiver", 94),
    ("US", "AU"): ("australian-eta-is-visa", 94),
    ("US", "NZ"): ("nzeta-visa-waiver", 90),
}
FIELDS = [
    "priority", "score", "passport", "destination", "passport_name",
    "destination_name", "source_options", "source_label", "source_last_success",
    "reason_codes", "review_state", "source_url",
]


def classify_rule(passport: str, dest: str, source: dict, rule: dict):
    """Return at most one queue item for a unique passport/destination pair."""
    options = set(rule.get("options", []))
    source_label = rule.get("sourceText", "")
    notes = " ".join(str(x) for x in rule.get("notes", []))
    condition = str(rule.get("condition", ""))
    flags = rule.get("flags", [])
    merged = " ".join([source_label, condition, notes, *flags])
    reasons = []
    score = 0

    def flag(code: str, points: int):
        nonlocal score
        reasons.append(code)
        score = max(score, points)

    if "reason" in rule or not options:
        flag("unclassified-baseline", 75)
    if options and ("free" in options) and ETA_LABEL.fullmatch(source_label.strip()):
        flag("free-electronic-authority-label", 78)
    if "free" in options and (condition or flags):
        flag("free-with-entry-steps", 68)
    if "free" in options and any(re.search(r"visa required|visa on arrival|evisa", x, re.I)
                                  for x in [source_label]):
        flag("contradictory-visa-label", 85)
    if rule.get("unreviewedExceptions"):
        flag("unreviewed-document-exception", 62)
    if rule.get("exceptions"):
        flag("conditional-document-exception", 50)
    if MONEY.search(merged):
        flag("fee-needs-current-verification", 43)
    if TEMPORARY.search(merged):
        flag("time-sensitive-description", 55)
    if PASSPORT.search(merged):
        flag("special-passport-document", 52)
    if ROUTE.search(merged):
        flag("route-or-residency-condition", 47)
    if "advance" in options or "denied" in options or "permit" in options:
        flag("high-consequence-entry-restriction", 37)
    if score == 0:
        flag("baseline-spot-check", 10)

    if (passport, dest) in CASE_IDS:
        case, known = CASE_IDS[(passport, dest)]
        flag("official-evidence:" + case, known)
    # Secondary score distinguishes two candidates with the same highest risk,
    # without counting a pair twice.
    score += min(5, len(set(reasons)) - 1)
    priority = "P0" if score >= 100 else "P1" if score >= 70 else "P2" if score >= 40 else "P3"
    return priority, score, sorted(set(reasons))


def build():
    index = json.loads((DATA / "index.json").read_text(encoding="utf-8"))
    places = json.loads((DATA / "places.json").read_text(encoding="utf-8"))
    pending = []
    rows = []
    reasons = Counter()
    priority_counts = Counter()
    per_destination = Counter()
    per_passport = Counter()

    for passport in index["passports"]:
        source = index["sources"].get(passport, {})
        if not source.get("lastSuccess"):
            pending.append({
                "passport": passport,
                "name": places.get(passport, passport),
                "problem": source.get("error", "No verified source snapshot"),
                "priority": "P0",
            })
            continue
        shard = json.loads((DATA / "passports" / f"{passport}.json").read_text(encoding="utf-8"))
        for dest, rule in shard["rules"].items():
            prio, score, found = classify_rule(passport, dest, source, rule)
            priority_counts[prio] += 1
            reasons.update(found)
            if prio != "P3":
                per_destination[dest] += 1
                per_passport[passport] += 1
            rows.append({
                "priority": prio,
                "score": score,
                "passport": passport,
                "destination": dest,
                "passport_name": places.get(passport, passport),
                "destination_name": places.get(dest, dest),
                "source_options": ";".join(rule.get("options", [])),
                "source_label": rule.get("sourceText", ""),
                "source_last_success": source["lastSuccess"],
                "reason_codes": ";".join(found),
                "review_state": "official-reference-needed",
                "source_url": source.get("url", ""),
            })
    assert len({(r["passport"], r["destination"]) for r in rows}) == len(rows)
    rows.sort(key=lambda r: (-r["score"], r["passport"], r["destination"]))
    return rows, pending, {
        "snapshot_generated": index["generated"],
        "passport_profiles": len(index["passports"]),
        "source_files_loaded": len(index["passports"]) - len(pending),
        "destination_catalog_count": len(index["destinations"]),
        "unique_rule_pairs": len(rows),
        "priority_counts": dict(sorted(priority_counts.items())),
        "reason_counts": dict(reasons.most_common()),
        "unavailable_profiles": pending,
        "top_destinations_by_flagged_pairs": per_destination.most_common(30),
        "top_passports_by_flagged_pairs": per_passport.most_common(30),
        "warning": "Heuristic screening is NOT government verification. Priority labels refer to verification urgency.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "audit-output")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    rows, unavailable, stats = build()
    with (args.output / "verification-queue-all.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    with (args.output / "verification-queue-top500.csv").open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows[:500])
    (args.output / "verification-summary.json").write_text(
        json.dumps(stats, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(json.dumps({
        "passport_profiles": stats["passport_profiles"],
        "files": stats["source_files_loaded"],
        "rule_pairs": stats["unique_rule_pairs"],
        "priority_counts": stats["priority_counts"],
        "top_destinations": stats["top_destinations_by_flagged_pairs"][:12],
        "unavailable_profiles": [x["passport"] for x in unavailable],
    }, ensure_ascii=False))
    return stats


if __name__ == "__main__":
    main()
