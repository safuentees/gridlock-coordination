# WAPA July 2026 works catalog and normalizer

This independently accepted source contains both named works in the July 7, 2026 WAPA release: Feeder 13 Bypass (explicit overhead transmission) and Ridge Road/Cabrita Point redundancy (explicit distribution). The affected-feeder outage lists are not project rows. The two records are complete for this release, not for the territory or the historical recovery program.

Original: coordinator `inputs/originals/F27-vi-wapa/2026-07-07-transmission-distribution-release.html`; SHA256 `e14e88a3082ddc037390e1e599df1e38031e29244068f3866abfcb02e610ce67`. The reviewed factual catalog retains only the named-work facts, source locators and dated schedule. It excludes contacts, page scripts and boilerplate. The normalizer pins the original checksum and does not interpret or execute source instructions.

```sh
python3 scripts/ingest/coverage/vi-wapa-upgrades/extract.py \
  --input '/absolute/path/inputs/originals/F27-vi-wapa/2026-07-07-transmission-distribution-release.html' \
  --output-dir app/src/data/real/coverage/vi-wapa-upgrades \
  --scope full --generated-at 2026-09-30T11:00:00+00:00
```

Ledger: two imported, zero excluded/pending/failed/located; one transmission and one capital context, both planned. Publication and lifecycle source-edition date are July 7, 2026. Scheduled remaining work does not establish completion today. The July 13/14 outage nights are shared, unassigned schedule evidence with kind unknown; neither becomes an individual energization/completion date or construction interval. Primary comparison dates remain unknown.

Preserve source suffixes `2026-07-07:release:project-01` / `project-02`, with internal ID prefix `vi-wapa-upgrades:`. Similar old recovery names do not establish matching engineering identities. Owners, voltage, centers/geometry, construction starts/windows and parents remain unknown. WAPA is reporting/operator context only; named affected areas are not location geometry.

Source-only Dataset2 uses compact JSON: 10,333 compact / 13,202 formatted UTF-8 bytes including final newline. Matching manifest/ledger/payload sizes are emitted alongside it. The source is full immediately, while the separate recovery source remains a four-record sample until provider connection. Original HTML remains ignored; no public redistribution license is asserted. No worker checks ran; coordinator owns provider integration and milestone checking.
