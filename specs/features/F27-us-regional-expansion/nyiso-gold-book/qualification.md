# NYISO Gold Book — public-input blocker

The **2026 Gold Book exists**, but its complete public Section VII could not be acquired through ordinary access in this pass. This is a precise missing-input outcome, not an accepted inventory or a six-record sample. The public pass ran **11:53:07–11:56:45 UTC on September 30, 2026 (3m 38s)**, within the fifteen-minute bound. No producer or application changes were made.

## What is established

NYISO's [May 29, 2026 planning presentation](https://www.iso-ne.com/static-assets/documents/100035/2026-05-29_ipsac_a02.3_nyiso_updates_on_comprehensive_system_planning_process.pdf), printed/PDF slide 14, identifies the 2026 Gold Book and its Section VII local transmission-plan content. The actual PDF hyperlink supplies the [UUID-bearing official report URL](https://www.nyiso.com/documents/20142/2226333/2026-Gold-Book-Public.pdf/a8fd42fe-5a8c-88cb-5052-f93dfd6423b8), rather than a guessed filename. This confirms the edition and a section-level scope, not the complete set of proposed-facility rows.

The [New York PSC's June 12, 2026 ruling in Case 26-E-0196](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B30A9BC9E-0000-CC16-BB77-8FA1D20967F3%7D&DocTitle=Declaratory+Ruling+on+Transfer+Transaction), printed/PDF page 12 footnote 15, independently cites the report as issued April 2026 and links the [bare public PDF](https://www.nyiso.com/documents/20142/2226333/2026-Gold-Book-Public.pdf). The ruling's generation/ownership discussion is unrelated to this inventory and is not used as project evidence. These sources do not establish the report's precise publication day, its Section VII as-of date or the absence of later revisions.

Original supporting PDFs are preserved unchanged in ignored `inputs/originals/F27-nyiso-gold-book/`:

| Artifact | Bytes | SHA-256 | Meaning |
| --- | ---: | --- | --- |
| `2026-05-29_nyiso-cspp-update.pdf` | 586,567 | `828013ca3341068481d783ce92cf265902a41c312add2f8894c94dda72b6b0d3` | NYISO presentation, not Gold Book |
| `nypsc-26-E-0196-declaratory-ruling.pdf` | 98,675 | `7493bedff1a49cda758fe6d079ff76d7b3cf613d5fbb9a490e402c81e9e71c74` | PSC bibliographic corroboration, not Gold Book |

## Access result and limits

The web tool returned a JavaScript/robot-verification page for the bare and exact 2026 PDF links, the [cited 2025 fallback](https://www.nyiso.com/documents/20142/2226333/2025-Gold-Book-Public.pdf/088438e1-02f1-5316-211b-dbca17c01b4b), and the [Gold Book resources index](https://www.nyiso.com/gold-book-resources). Ordinary downloads of the three report URLs returned **zero-byte text/html responses, not PDF files**. `acquisition.json` and separately named `.response.html` bodies preserve those outcomes in ignored inputs. Their empty-body SHA-256 is not a source-report hash. `access-observations.txt` is an agent-authored tool-result account, not original publisher HTML.

A bounded search of NYISO, NYSRC, ISO New England and public New York government sources yielded official references and older/partial material, but no ordinarily downloadable complete 2026 or 2025 report. The NYSRC load-forecast presentation does not contain the proposed-facility table. Older 2022/2024 tables and search snippets were not promoted to current rows. No credentials, challenge-solving, hidden access endpoint, browser automation, restricted/CEII material, map-image interpretation or geocoding was used.

**Unknown is not zero:** declared row count, retention/exclusion counts, queue/component identities, owner meanings, source as-of and six diagnostic records remain unverified. `sample.json` deliberately has null counts and an empty diagnostics array. No statewide, downstate/Long Island or non-National-Grid coverage increment is claimed.

## Exact input needed and pending contract

Acquire a complete ordinarily accessible official **2026 Gold Book public PDF**, or a complete public Section VII extract containing the cover/edition/as-of, every proposed-facility table page, repeated headers, owner definitions and all table footnotes. A source copy must provide real bytes for a report hash. The complete 2025 edition can be reconsidered only as a clearly historical fallback; it cannot be described as latest after the 2026 corroboration.

Once that input is available, qualification must resolve:

- Every proposed row and recently in-service/removed entry, with a finite full reconciliation and six cited diagnostics.
- Queue/reference identifiers versus facility components; explicit locator identities where necessary and unmerged overlap with the imported National Grid plan.
- The exact transmission-owner column and abbreviation/ownership definitions. Multiple entities stay unresolved unless an accepted contract represents their meaning.
- Firm/non-firm planning categories versus actual construction, report-as-of versus proposed seasons/years, and no fabricated day dates or construction intervals.
- Operating/design kV versus MW/MVA/thermal ratings, physical work versus retirement/context, and any native geometry's role/CRS/accuracy. Named terminals and maps never supply coordinates.

These are unresolved requirements, not a field-mapping proposal inferred from earlier editions. **Accept the recorded source-access gap only; do not dispatch production yet.** Coordinator acceptance and a connected real sample still precede any full adapter. No worker build/tests/typecheck or visual checks were run.
