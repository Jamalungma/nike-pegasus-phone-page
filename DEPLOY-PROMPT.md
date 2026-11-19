# Deploy to Vercel and run mobile Lighthouse on the live URL

Two parts: the prompt for Claude Code, and the exact commands that were actually run
to put this page live and score it. The commands were run directly in a Claude Code
session (not by handing the prompt to a separate agent), so this file records both.

## 1. The prompt

```text
Deploy the Nike Pegasus 43 page to Vercel, then run a mobile Lighthouse test on the live
vercel.app address and report the results against the speed budget. Do not change any
page code, and do not commit or push anything in this task.

REPO AND PROJECT
- Repo: the root of this repository (GitHub: Jamalungma/nike-pegasus-phone-page, branch main).
- The Next.js app is in the next/ subfolder, not the repo root. Deploy from inside next/.
  Framework: Next.js (auto-detected). Project name: nike-pegasus-phone-page.
- The size/stock data is read at build time from next/data/, so it needs no environment
  variables. Do not add any env vars or secrets.

DEPLOY
1. Use the Vercel CLI (npx vercel). Check whether I'm logged in (npx vercel whoami). If
   not, STOP and tell me to run `npx vercel login` myself. Never enter credentials or
   tokens for me.
2. Link the project from inside next/ (project name above), then deploy to production
   (npx vercel deploy --prod --yes). Confirm the build succeeds.
3. Report the exact production URL (https://....vercel.app). Fetch it with curl and
   confirm HTTP 200 and that the HTML has 26 size buttons (data-testid="size-button" and
   "size-button-sold-out" together = 26; on the 8 December snapshot that is 17 + 9), plus
   data-testid="size-grid", "main-photo" and "price".
4. If the URL returns a login or 401 page (Vercel deployment protection), STOP and tell
   me. Do not try to bypass it or change protection settings.

LIGHTHOUSE ON THE LIVE URL (settings from Web Platform Slow 4G Mobile Check Profile.yaml; set ALL)
- Mobile form factor, simulated throttling.
- Round trip 150 ms, throughput 1638.4 Kbps, CPU slowdown 4x.
- Screen: 375 x 812, device scale factor 3, mobile on.
- Performance category only. Use a Chromium from Playwright (install Lighthouse and
  Playwright in a scratch folder outside the repo if missing).
- Run it 3 times on the live production URL. Read the applied settings back from
  Lighthouse's own report to confirm they match.

GRID MOVEMENT ON THE LIVE URL
- Run scripts/grid-movement.js against the live URL (Slow 4G values: latency 562.5 ms,
  download 1474.56 Kbps, upload 675 Kbps; 4x CPU; 375 x 812 @3x mobile viewport). It
  loads the page 3 times, samples the size grid's top position every animation frame and
  watches layout shifts until 2.5 s after load.
- Report the total vertical movement of the grid in CSS px (budget: 0), every layout shift
  (time, element, amount), and the smallest width/height of all 26 size buttons (budget
  floor: 44).

HAND BACK (short, in this order)
1. URL: the live production URL, and the Vercel project name.
2. DEPLOY: build status, anything that failed or was skipped, and how you confirmed the 26
   buttons and the test ids on the live HTML.
3. SETTINGS APPLIED: the exact Lighthouse values you set and how you confirmed them.
4. RESULTS: per run, performance score, FCP, LCP, TBT, CLS, size-grid movement in px,
   smallest button.
5. BUDGET CHECK against speed-budget.json (90 / 0 / 44): pass, fail or "not measured".
6. NOT DONE / NOT VERIFIED: anything you could not do. Do not report a number you did
   not measure.
Do not leave any local server or browser running.
```

## 2. What was actually run

Login was done by the page owner (`npx vercel login`, in their own terminal); the CLI
said "Logged out" before that.

```bash
cd next

# link (creates the project; the GitHub-repo connect step failed, which does not matter
# for a CLI deploy). Writes a gitignored .env.local and .vercel/
npx vercel link --yes --project nike-pegasus-phone-page

# production deploy, aliased to https://nike-pegasus-phone-page.vercel.app
npx vercel deploy --prod --yes

# live HTML check: 26 size buttons and the five data-testid attributes
curl -s "https://nike-pegasus-phone-page.vercel.app/" | grep -o 'data-testid="[a-z-]*"' | sort | uniq -c
```

Lighthouse, 3 runs (run from a scratch folder with `lighthouse` and `playwright` installed;
`CHROME_PATH` pointed at Playwright's Chromium):

```bash
for n in 1 2 3; do
  npx lighthouse https://nike-pegasus-phone-page.vercel.app/ \
    --only-categories=performance \
    --form-factor=mobile \
    --throttling-method=simulate \
    --throttling.rttMs=150 \
    --throttling.throughputKbps=1638.4 \
    --throttling.cpuSlowdownMultiplier=4 \
    --screenEmulation.mobile \
    --screenEmulation.width=375 --screenEmulation.height=812 \
    --screenEmulation.deviceScaleFactor=3 \
    --output=json --output-path="live$n.json" \
    --chrome-flags="--headless=new --no-sandbox" --quiet
done
```

Grid movement, 3 loads:

```bash
node scripts/grid-movement.js https://nike-pegasus-phone-page.vercel.app/
```

Results are in [NOTES.md](NOTES.md): Lighthouse 100, 98, 100, CLS 0, size grid movement
0 px, smallest size button 44 px (8 December snapshot, live URL).
