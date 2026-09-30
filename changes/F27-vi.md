# F27-VI source inventories

- Added separate pinned factual catalogs/normalizers and Dataset2 outputs for historical recovery and the dated July 2026 WAPA works, preserving qualified sourceId suffixes.
- Six diagnostic records were connected by the coordinator at f7b4f81 before full recovery generation. Their IDs and values are preserved; the dated release data remains unchanged.
- Recovery is complete for the accepted report scope: 24 = 19 imported + 5 completed exclusions, zero pending/failed/located. Imported classes: one transmission and eighteen capital context. Lifecycles: fourteen planned, three historically under construction and two unknown.
- Dated works remain a separate complete two-record source: one transmission and one capital context, both planned. Together the two declared scopes reconcile 26 source units to 21 imported and five excluded; unresolved cross-source identity prevents interpreting this as 21 unique engineering projects or a current territory-wide inventory.
- Preserved historical versus snapshot-observed dates, invalid target unknown and procurement/outage meanings. All owners/voltage/geometry/windows remain unknown; originals are unchanged and ignored.
- Recovery payload: 56,395 compact / 72,381 formatted bytes. Dated works unchanged: 10,333 / 13,202 bytes, including final newlines.
- Source generation only; no worker tests/build/visual checks or shared edits. Coordinator owns integration/checking.
