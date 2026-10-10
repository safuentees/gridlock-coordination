# README screenshots

Actual desktop screenshots captured from the running application on October 9, 2026 (America/New_York), using application revision `3dd40f0` and a fresh, isolated browser session.

## Capture settings

- Viewport: 1440 × 960 CSS pixels; PNG, light theme.
- Data mode: **Source data**, with the bundled collection and automatic geographic processing completed.
- Basemap: **Standard** (Leaflet/OpenStreetMap); attribution remains visible in map captures.
- No imported source revisions, geographic corrections, or synthetic data.
- The saved-review example contains public candidate evidence and no analyst names or private notes.
- Images are unedited viewport captures. They illustrate these workflows, not a comprehensive browser or mobile audit.

## Images and reproduction

Start the app using the root [README](../../README.md#quick-start), then open it in a fresh browser profile at the viewport above. Allow source loading and geographic processing to finish.

| Image | Capture state |
| --- | --- |
| `home.png` | **Home**, with the active source summary visible |
| `explore.png` | **Explore**, default scenario, **Candidates**, no search or filters, initial fitted map |
| `comparison.png` | Select **Jasper–Okatie / McIntosh–Purrysburg** (candidate #2), keep **Evidence** open, allow the map to fit selection |
| `saved-reviews.png` | Choose **Save selected**, then **Saved reviews**; leave the example unreviewed and the investigation fields empty |
| `data-readiness.png` | Close the review dialog; open **Data readiness → Geographic coverage**, with the first record selected and its **Evidence** visible |

Save temporary browser captures under `output/playwright/` (ignored). Copy only the five reviewed PNGs into this directory. Preserve map attribution and visible limitations, and update README captions and counts when the source bundle changes.

The browser smoke check reached the screens above and observed one missing-favicon request (HTTP 404); it did not observe an application exception. The production build and `app/scripts/check-core.ts` passed. These checks do not establish complete data accuracy, storage restoration, or experimental-map behavior.
