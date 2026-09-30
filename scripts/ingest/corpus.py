#!/usr/bin/env python3
"""Normalize public project listings and link the supplied seed locations by ID."""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re

from pypdf import PdfReader

from seed import (
    DOMINION_FILE, GEORGIA_FILE, TABLE_ROW, compact, date_value,
    dominion_record, ingest_seed, source, stable_id,
)

GEORGIA_FIRST_PAGE = 177
GEORGIA_LAST_PAGE = 190


def voltages(name: str) -> list[float]:
    # Retain every voltage explicitly written in the name, including 230/115kV.
    groups = re.findall(r"(\d+(?:\.\d+)?(?:\s*[-/]\s*\d+(?:\.\d+)?)*)\s*kV", name, re.I)
    return list(dict.fromkeys(float(value) for group in groups for value in re.findall(r"\d+(?:\.\d+)?", group)))


def project(record: dict, utility: str, reference: dict, seeds: dict) -> dict:
    identifier = stable_id(utility, record["sourceId"])
    seed = seeds.get(identifier)
    notes = record.pop("notes", [])
    if seed:
        notes += seed["notes"]
    return {
        "id": identifier, "utilityId": utility, **record,
        "voltageKv": voltages(record["name"]), "buildWindow": None,
        "location": seed["location"] if seed else None,
        "sources": [reference] + [ref for ref in seed["sources"] if ref["file"] == "Projects_Overlaps.xlsx"] if seed else [reference],
        "notes": notes,
    }


def ingest_corpus(inputs: Path, generated_at: str) -> tuple[dict, dict]:
    seeds = {record["id"]: record for record in ingest_seed(inputs, generated_at)["projects"]}
    projects = []
    dominion = PdfReader(inputs / "Project Listings" / "Dominion Energy" / DOMINION_FILE)
    if len(dominion.pages) != 44:
        raise ValueError("Dominion source edition changed; expected 44 project pages")
    for page, pdf_page in enumerate(dominion.pages, start=1):
        text = pdf_page.extract_text() or ""
        if f"Project {page} of 44" not in text:
            raise ValueError(f"Dominion physical page {page} lacks the expected project header")
        record = dominion_record(text)
        if page == 40:
            record["notes"].append("Source estimated total is $1,100,000 despite the filing's $2M-and-above title; the listed project is retained.")
        projects.append(project(record, "desc", source(DOMINION_FILE, f"physical page {page}, Project ID {record['sourceId']}"), seeds))

    georgia = PdfReader(inputs / "Project Listings" / "Georgia Power" / GEORGIA_FILE)
    page_counts = {}
    for page in range(GEORGIA_FIRST_PAGE, GEORGIA_LAST_PAGE + 1):
        text = georgia.pages[page - 1].extract_text() or ""
        if "PUBLIC DISCLOSURE" not in text or "Project Name Need Date" not in text:
            raise ValueError(f"Georgia physical page {page} is not the expected public Table 2 page")
        # Count visible row starts independently of the row parser so a malformed
        # row cannot disappear silently from a successful ingestion.
        row_starts = re.findall(r"(?m)^\s*\d{3}\s+20\d{2}\s+\d{4,6}\s+", text)
        rows = TABLE_ROW.findall(text)
        if len(rows) != len(row_starts):
            raise ValueError(f"Georgia physical page {page}: parsed {len(rows)} of {len(row_starts)} row starts")
        page_counts[str(page)] = len(rows)
        for _, _, native_id, name, need_date, sponsor in rows:
            record = {
                "sourceId": native_id, "sponsor": sponsor, "name": compact(name),
                "description": "", "status": None,
                "date": {"value": date_value(need_date), "precision": "day", "kind": "need", "label": "Need date"},
                "notes": ["Estimated costs are redacted in the source."],
            }
            projects.append(project(record, "gpc", source(GEORGIA_FILE, f"physical page {page}, Table 2, TEAMS {native_id}"), seeds))
    if sum(page_counts.values()) != 208:
        raise ValueError(f"Georgia source edition changed; expected 208 active Table 2 rows, received {sum(page_counts.values())}")
    identifiers = [record["id"] for record in projects]
    if len(set(identifiers)) != len(identifiers):
        raise ValueError("Duplicate native source identities; do not silently merge source rows")
    if not seeds.keys() <= set(identifiers):
        raise ValueError("One or more seed identities were not found in the complete listings")

    located = sum(record["location"] is not None for record in projects)
    notes = [
        "44 Dominion projects and 208 active Georgia Table 2 projects; ten workbook examples linked by native identity without duplication.",
        f"{located} unverified workbook locations; {len(projects) - located} projects have unknown locations and remain in the inventory.",
        "Dawson (Dominion page 34) has separate phase dates retained in its notes; no single date or construction interval was inferred.",
        "Georgia costs are redacted. Cancelled-project tables and restricted project details were not extracted.",
        "Georgia need dates and Dominion planned in-service dates are historical plan snapshots, not current completion claims.",
    ]
    dataset = {
        "schemaVersion": 1, "mode": "real", "title": "Dominion and Georgia planning inventories",
        "generatedAt": generated_at, "projects": projects,
        "coverage": {"processed": len(projects), "skipped": 0, "failed": 0, "notes": notes},
    }
    summary = {
        "generatedAt": generated_at,
        "scope": "44 Dominion listing pages and Georgia public-disclosure active Table 2 only",
        "processed": len(projects), "skipped": 0, "failed": 0,
        "linkedSeedRecords": len(seeds), "locatedRecords": located,
        "unlocatedRecords": len(projects) - located,
        "sources": [
            {"file": DOMINION_FILE, "physicalPages": "1-44", "processed": 44, "skipped": 0, "failed": 0},
            {"file": GEORGIA_FILE, "physicalPages": "177-190", "table": "Table 2", "processed": 208, "skipped": 0, "failed": 0, "rowsPerPage": page_counts},
        ],
        "georgiaSponsors": dict(sorted(Counter(record["sponsor"] for record in projects if record["utilityId"] == "gpc").items())),
        "parsingExceptions": [{"id": "desc-6859", "page": 34, "handling": "Multiple phase dates retained verbatim in notes; date.value is null and buildWindow is null."}],
        "excludedSections": ["Georgia cancelled-project tables", "Georgia restricted project details", "private opportunity materials"],
        "notes": notes,
    }
    return dataset, summary


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inputs", type=Path, required=True, help="Preserved Sperry-Tech-Challenge input directory")
    parser.add_argument("--output", type=Path, default=Path("app/src/data/real/dataset.json"))
    parser.add_argument("--summary", type=Path, default=Path("app/src/data/real/ingestion-summary.json"))
    parser.add_argument("--generated-at", default=datetime.now(timezone.utc).isoformat(timespec="seconds"))
    args = parser.parse_args()
    dataset, summary = ingest_corpus(args.inputs, args.generated_at)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.summary.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(dataset, indent=2, ensure_ascii=False) + "\n")
    args.summary.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {summary['processed']} real records: {summary['locatedRecords']} located, {summary['unlocatedRecords']} unlocated, {summary['failed']} failed")


if __name__ == "__main__":
    main()
