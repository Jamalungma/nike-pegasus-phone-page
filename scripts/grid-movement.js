// Measures how far the size grid (.sizes__grid, the data-testid="size-grid" element) moves from navigation until 2.5 s after load,
// under the profile's Slow 4G + 4x CPU phone settings (375x812 @3x, mobile). Budget: 0 px.
// Usage (needs: npm i playwright && npx playwright install chromium):
//   node scripts/grid-movement.js https://nike-pegasus-phone-page.vercel.app/
// Selectors: the page's own classes (.sizes__grid, .size, .price). Runs 3 times.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const results = [];
  for (let run = 1; run <= 3; run++) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    // Slow 4G as the profile's DevTools values: 562.5 ms latency, 1474.56 / 675 Kbps, 4x CPU
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 1474.56 * 1024 / 8, uploadThroughput: 675 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__tops = []; window.__shifts = [];
      new PerformanceObserver(l => l.getEntries().forEach(e => window.__shifts.push({ v: e.value, t: Math.round(e.startTime), src: (e.sources || []).map(s => (s.node && (s.node.className || s.node.nodeName)) + ' ' + Math.round(s.previousRect.y) + '->' + Math.round(s.currentRect.y)) }))).observe({ type: 'layout-shift', buffered: true });
      const tick = () => {
        const g = document.querySelector('.sizes__grid');
        if (g) window.__tops.push(Math.round(g.getBoundingClientRect().top + window.scrollY));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.goto(process.argv[2], { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => {
      const t = window.__tops; const btns = [...document.querySelectorAll('.size')];
      const min = Math.min(...btns.map(b => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)));
      const moves = t.slice(1).reduce((s, v, i) => s + Math.abs(v - t[i]), 0);
      return { samples: t.length, firstTop: t[0], lastTop: t[t.length - 1], minTop: Math.min(...t), maxTop: Math.max(...t), totalMovement: moves, shifts: window.__shifts, buttons: btns.length, smallestButton: min, price: document.querySelector('.price')?.textContent };
    });
    results.push(r);
    await ctx.close();
  }
  console.log(JSON.stringify(results, null, 1));
  await browser.close();
})();
