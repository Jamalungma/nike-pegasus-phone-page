# Notes: Nike Pegasus 43 phone page

Mobile product page for the Nike Pegasus 43 (style HV7521-001), built in Next.js.
Live: https://nike-pegasus-phone-page.vercel.app
Plain-HTML reference version is in the repo root (`index.html`, `styles.css`, `script.js`).

## What is in this repo

| Path | What it is |
|---|---|
| `next/` | The Next.js page that is checked (App Router, TypeScript, plain CSS). |
| `speed-budget.json` | The three required budget keys: 90 / 0 / 44. |
| `PROMPT.md` | The Claude Code prompt that builds the Next.js page. |
| `pegasus_size_stock_2026-12-08.json` | Size and stock data (26 rows, 8 December 2026 snapshot), the source for the size grid. |
| `NOTES.md` | This file: trace findings and the trace prompt. |

## speed-budget.json

```json
{
  "performance_score_min": 90,
  "size_grid_shift_px_max": 0,
  "size_button_min_px": 44
}
```

These are the profile's required values (Web Platform Slow 4G Mobile Check Profile).
44 is the floor and matches what the buttons render (exactly 44 x 44). A higher
value such as 48 would fail all 26 buttons until they are resized.

## Trace findings

Settings (the profile's `lighthouse_settings`, confirmed in Lighthouse's own report):
mobile, simulated throttling, 150 ms round trip, 1638.4 Kbps, 4x CPU slowdown,
375 x 812 at 3x pixel density. Tested on a local production build (`next start`).
Tools: Lighthouse CLI and a Playwright script (Chromium), not Chrome DevTools MCP.

| Check | Result | Budget |
|---|---|---|
| Lighthouse performance score | 100 on 3 runs, 100 again after the change (FCP 0.8 s, LCP 0.8 s, TBT 30 ms) | >= 90 |
| Cumulative layout shift | 0, no shifting elements | n/a |
| Size grid movement, first paint to fully loaded | 0 px in all runs (grid stayed at y = 669) | <= 0 |
| Smallest size button (all 26, sold-out included) | 44 px | >= 44 |

Grid movement was measured by sampling the grid's position every frame under the same
Slow 4G (562.5 ms latency, 1474.56 / 675 Kbps) and 4x CPU values, plus a layout-shift
observer. It found no shifts.

### Live check on Vercel

Live production URL: https://nike-pegasus-phone-page.vercel.app (deployed with the Vercel CLI
from `next/`, public, no login wall). The page uses the 8 December 2026 size and stock
snapshot (`pegasus_size_stock_2026-12-08.json`): 9 sold out (M 4.5, 6, 9, 10, 11.5, 14, 15,
15.5, 16), 7 low stock (M 3.5, 4, 5, 8.5, 13, 13.5, 14.5), 10 in stock. The served HTML
has 26 size buttons (`size-button` x17, `size-button-sold-out` x9), 7 "only N left"
labels, and the `size-grid`, `main-photo` and `price` test ids. Same profile settings as
above, 3 runs on the live address after the snapshot was deployed.

| Check | Live result (8 December snapshot) | Budget |
|---|---|---|
| Lighthouse performance score | 100, 98, 100 (FCP and LCP 0.9 to 1.0 s) | >= 90 |
| Cumulative layout shift | 0, no shifting elements, all 3 runs | n/a |
| Size grid movement, first paint to fully loaded | 0 px in all 3 runs, no layout shifts (grid at y = 669) | <= 0 |
| Smallest size button (all 26, sold-out included) | 44 px | >= 44 |

Run 2 scored 98 because total blocking time was 160 ms (80 and 90 ms on the others).
The LCP element was not recorded on the live runs. Grid movement was measured with the
same Playwright script as above (Slow 4G, 4x CPU, 375 x 812 at 3x).

The earlier local runs above, and a first live deploy (98, 100, 100, same 0 px movement),
used the earlier stock file (4 sold out, 5 low stock). The fixed 44 x 44 cells mean the
grid size does not depend on which sizes are sold out, and the re-run on the snapshot
confirms it.

### Late elements that could push the grid, and what stops each

This table is analysis from the code and CSS. The trace found nothing moving, so it did
not show any of these elements moving the grid; the protections were built in first.

| Element | How it could push the grid | Fix in this page |
|---|---|---|
| Main photo (`main-photo`) | An empty box until the image arrives would move everything below it about 469 px. | Fixed `aspect-ratio: 4 / 5` box with a grey background, and `width`/`height` on every image, so the 375 x 469 space exists before any image loads. |
| Price (`price`) | A price that arrives after first paint could change the row height. | Server-rendered in the HTML, and the row has a fixed height (32 px). Name (28 px) and colorway (24 px) rows are reserved the same way. |
| Price font | A web font swapping in late changes letter widths and line wrapping. | No web font: the page uses the system font stack. If one is added, use `next/font` (metric-adjusted fallback) and keep the fixed line height. |

The five `data-testid` attributes the check reads are on the page: `size-grid` (1),
`size-button` (17 in-stock and low-stock buttons on the 8 December snapshot),
`size-button-sold-out` (9), `main-photo` (1), `price` (1).

### Not tested

- Lighthouse's Slow 4G is a simulation (which is what the profile specifies), not a
  recording of a real slow connection. The first sections above are from a local
  production build; the live Vercel results are in their own section.
- A before-and-after: the protections were never switched off to see the grid move.
- A real phone or a real-device trace.
- Real photos. The gallery uses small SVG placeholders, so a re-trace is needed with
  the real, heavier images (use `next/image` with `priority` for the first one).
- Screen readers.

## Key Claude Code prompts

1. Build the page: see [`PROMPT.md`](PROMPT.md). It covers the stack, the size/stock
   JSON, the 375px layout, the size button rules and the hand-back format.
2. Record the phone trace (below). Run on a production build, with the profile's values.

```text
Record a phone performance trace of the Nike Pegasus 43 page and report what it shows
about the size grid. Do not change any page code in this task: record and measure only.

PAGE TO TRACE
- Use a production build, not the dev server: in the next/ folder run
  `npm run build && npm start` (port 3200). Trace http://localhost:3200/.

SETTINGS (from Web Platform Slow 4G Mobile Check Profile.yaml; set ALL before recording)
- Viewport: 375 x 812 CSS px, device pixel ratio 3, mobile on (touch on).
- Network: Slow 4G. Round trip 150 ms, throughput 1638.4 Kbps. For a real throttled
  browser: request latency 562.5 ms, download 1474.56 Kbps, upload 675 Kbps.
- CPU: 4x slowdown.
- Do not judge the size grid from a desktop trace or an unthrottled trace. Read the
  settings back and confirm they are applied before you record.

RECORD
1. Start a trace with a page reload, stop it when the page has finished loading.
2. Run it 3 times and report all three.

READ FROM THE TRACE
- Total CLS and every individual layout shift (time, size, element that moved).
- Total vertical movement of [data-testid="size-grid"] from first paint to fully
  loaded, in CSS px (budget: 0).
- LCP element and time (expected: [data-testid="main-photo"]).
- Whether the price ([data-testid="price"]) or its font arrives after first paint and
  moves the grid.
- Smallest width/height of every [data-testid="size-button"] and
  [data-testid="size-button-sold-out"] (budget floor: 44).
- The Lighthouse mobile performance score with the same settings.

HAND BACK (short, in this order)
1. SETTINGS APPLIED and how you confirmed them.
2. RESULTS per run: CLS, grid movement in px, LCP element and time, smallest button,
   Lighthouse score.
3. SHIFTS: each layout shift, what moved and why.
4. BUDGET CHECK against 90 / 0 / 44: pass, fail, or "not measured".
5. NOT DONE / NOT VERIFIED. Do not report a number you did not measure.
Do not leave any server running when you finish.
```
