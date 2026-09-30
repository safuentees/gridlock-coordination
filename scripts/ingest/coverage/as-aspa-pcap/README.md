# ASPA PCAP action adapter

The catalog paraphrases the six published ASPA action units in the March 21, 2024 cover-revised plan. Four exclusions prevent parent/storage/vehicle/charging inflation; two retained funding requests preserve unknown fields. IDs are published action labels, not engineering asset identifiers. Territory-wide current scope remains missing.

Preserve the public PDF under ignored `inputs/originals/F27-as-aspa/`. The adapter pins its SHA-256 before normalization. It uses Python standard library only:

```sh
python3 scripts/ingest/coverage/as-aspa-pcap/normalize.py --original-dir inputs/originals/F27-as-aspa --output-dir app/src/data/real/coverage/as-aspa-pcap --scope sample --generated-at 2026-09-30T10:45:00Z
```

Connect Action 1.C before changing `--scope` to `full`; full adds Action 1.A and clears the one pending retained action. All original prose/contact details stay outside Git. No inferred dates, geometry, voltage, ownership or coordination benefits. Dataset, manifest, disposition ledger, source quality and exact payload measurements are emitted together.
