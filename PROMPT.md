# Prompt for Claude Code: Nike Pegasus 43 product page (Next.js)

Paste everything below the line into Claude Code, run from the root of this repo.
It is written so Claude Code can build the page with no other help, and so the
build can be re-run for the launch.

---

Build a working Next.js product page for the Nike Pegasus 43. It is a mobile-first
page: 375px wide is the baseline, and it scales up cleanly. A plain HTML version
already exists in this repo (`index.html`, `styles.css`, `script.js`); use it as the
visual and behavioural reference, but build the real thing in Next.js.

## 1. Stack and where things go

- Next.js, App Router, TypeScript, plain CSS (a global stylesheet or CSS modules).
  No UI libraries, no Tailwind, no animation libraries.
- Create the project in a new folder `next/` at the repo root. Do not touch the
  existing static files.
- The product page is the home route (`/`).
- Sizes are rendered on the server from the JSON (a server component that reads or
  imports it). Interactive parts (photo gallery, size selection) are small client
  components.
- Copy `images/*.svg` (side, sole, back, top, on-foot) into `next/public/images/`.
  They are placeholders; use them as the 5 gallery photos, in that order.

## 2. The data file

- File: `nike_pegasus_size_stock_b2ebb9fac7f74d6a8bb3432d7642176f.json` (repo root,
  26 rows). Copy it into the Next.js project (for example `next/data/`). Do not
  hardcode, generate or invent sizes or stock.
- Fields used per row: `size_label` ("M 9 / W 10.5"), `size_us_men` (number),
  `size_us_women`, `size_eu` (string), `display_order` (1 to 26),
  `stock_status` ("in_stock" | "low_stock" | "sold_out"), `stock_quantity`,
  `product_name`, `colorway`, `price`.
- Render rows in ascending `display_order`. The EU sizes are not a clean half-step
  run (37, 41.5, 43.5 and 46.5 are skipped), so never build sizes with a loop.
- `product_name`, `colorway` and `price` are identical on every row. Take them from
  the first row: "Nike Pegasus 43", "Black/White-Volt", 140.00 (shown as `$140.00`).
  There is no old price and no discount, so do not show either.
- Ignore `launch_date` on the page (all rows are 2026-12-10). No "launch" note.
- Expected counts, to check yourself: 26 sizes, 4 sold out (M 3.5, M 10, M 15.5,
  M 16), 5 low stock (M 4, M 9, M 9.5, M 11, M 15), 17 in stock.
  Low stock means `stock_quantity` of 5 or fewer.

## 3. Page parts, in this order, at 375px

Side padding is 16px (343px content width) on every text section. No horizontal
scroll at 375px.

1. **Photo gallery.** Full width, fixed `aspect-ratio: 4 / 5`, so 375 x 469px, grey
   placeholder background so the space is reserved before images load. Every image
   has `width` and `height` attributes and descriptive `alt`. One photo per view,
   swipeable with CSS `scroll-snap-type: x mandatory`. Dot indicators overlaid inside
   the photo, 12px up from the bottom (they add no height). Dots update from the
   scroll position (`scrollLeft / clientWidth`, rounded). Add visually hidden text
   "Photo 2 of 5" in an `aria-live="polite"` region. First image
   `loading="eager"` plus `fetchpriority="high"`; the rest `loading="lazy"`.
2. **Name, colorway, price, rating.** About 156px tall in total. `<h1>` product
   name (22px, 28px line height), colorway line (24px, muted), price large and bold
   (24px, 32px line height). Rating link `★ 4.7 (128)` is static placeholder text
   (the data has no rating), 44px tall, anchors to the reviews section. Every row has
   a reserved height so nothing shifts.
3. **Sizes.** Header row 44px: heading "Size (US men's)" and a "Size guide" link (44px
   tap target). Then the grid (rules below), then the status line.
4. **Tech copy.** Four collapsed accordion rows (`<details>`): Details, Materials,
   Care, Delivery & Returns. Each summary row is 56px tall. Placeholder text inside.
5. **Reviews.** Placeholder section with `id="reviews"`: heading, a 96px summary
   placeholder, a 200px list placeholder.

Approximate total page height at 375px: 1,550px.

## 4. Size button rules (the part that must be exact)

- All 26 sizes in a CSS grid of **6 equal columns**, `gap: 8px`,
  `justify-items: center`. Each size always keeps its own cell.
- Every button is exactly **44px x 44px** (`width`, `height`, `min-width`,
  `min-height`) in every state: available, low stock, sold out, selected.
  Nothing is ever hidden, shrunk, wrapped or reordered.
- The grid is 5 rows: 5 x 44 + 4 x 8 = **252px** tall. Give it `min-height: 252px`.
- A button shows only the US men's number (`size_us_men`, e.g. `9.5`, `4`).
  Long text never goes inside a button.
- Tapping a size shows its full label in the status line under the grid:
  `M 9 / W 10.5 · EU 42.5` (from `size_label` and `size_eu`).
- The status line has a reserved `height: 24px`, `margin-top: 8px`, one line
  (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`),
  `role="status"` and `aria-live="polite"`. Text appearing there must not move
  anything.
- **Sold out (4 sizes):** use `aria-disabled="true"`, NOT the `disabled` attribute,
  so the button stays tappable and focusable and can show a message. Greyed text,
  light grey background, and a diagonal strike across the button so the state does
  not rely on colour alone. `aria-label="Size M 10, out of stock"`. Tapping or
  focusing one shows `Size M 10 is out of stock.` in the status line. It can never
  become selected.
- **Low stock (5 sizes):** fully selectable. `aria-label="Size M 9, only 3 left"`.
  When selected, the status line shows the full label plus ` · Only 3 left`
  (using `stock_quantity`).
- **Selected:** a clear 2px outline, bold text, `aria-pressed="true"`. Only one size
  can be selected at a time.
- Buttons: `type="button"`, 15px text, 1px border, 8px radius,
  `touch-action: manipulation`, visible `:focus-visible` outline.
- If the data cannot be loaded or parsed, show a message inside the reserved status
  area instead of an empty grid.

## 5. Other rules

- Touch targets at least 44px, body text at least 16px.
- Define colours, spacing and font sizes as CSS variables.
- Respect `prefers-reduced-motion`.
- Layout shift must be zero: space for the gallery, the text rows, the size grid and
  the status line is reserved up front.
- Clean code, with a comment wherever behaviour isn't obvious.

## 6. Deliver and hand back

Before you report, you must have run and seen pass:

1. `npm install`
2. `npm run build` with no errors.
3. `npm run dev`, then confirm in a browser (or with `curl`) that `/` returns the
   page with all 26 size buttons. Then stop the dev server. Leave nothing running.

Report back in plain text, short, in this order:

1. **PATH:** the project folder and the exact command and URL to run it.
2. **FILES:** each file you created or changed, one line saying what it does.
3. **375px CHECK:** measured at a 375px-wide viewport: gallery size (expect
   375 x 469), name/price block height (about 156), size grid height (expect 252),
   the size of all 26 buttons (expect 44 x 44), sold-out count (expect 4),
   low-stock count (expect 5), horizontal scroll (expect none), total page height.
4. **LAYOUT SHIFT:** two lines on how the gallery and the size grid avoid it.
5. **DEVIATIONS:** anything you did differently from this prompt, and why.
   If nothing, write "none".
6. **NOT DONE / NOT VERIFIED:** anything you could not test (a real phone, screen
   readers, and so on). Do not claim a check you didn't run.

Do not paste whole files into the report.
