const DATA_URL = 'pegasus_size_stock_2026-12-08.json';

/* ---------- Gallery dots ---------- */
(function () {
  const track = document.getElementById('track');
  const dotsEl = document.getElementById('dots');
  const status = document.getElementById('gallery-status');
  const slides = Array.from(track.querySelectorAll('.gallery__slide'));

  slides.forEach(() => dotsEl.appendChild(Object.assign(document.createElement('span'), { className: 'dot' })));
  const dots = Array.from(dotsEl.children);

  function setActive(i) {
    dots.forEach((d, n) => d.setAttribute('aria-current', n === i ? 'true' : 'false'));
    status.textContent = 'Photo ' + (i + 1) + ' of ' + slides.length;
  }
  setActive(0);

  // Active slide = nearest to the current scroll position
  let current = 0;
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== current && i >= 0 && i < slides.length) {
      current = i;
      setActive(i);
    }
  }, { passive: true });
})();

/* ---------- Product info + sizes, all from the JSON ---------- */
(async function () {
  const grid = document.getElementById('size-grid');
  const status = document.getElementById('size-status');

  let rows;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    rows = await res.json();
  } catch (err) {
    // Message goes into the reserved status line, so nothing shifts
    status.textContent = 'Sizes could not be loaded. Please refresh.';
    return;
  }

  // Never generate sizes: render the rows exactly as given, by display_order
  rows.sort((a, b) => a.display_order - b.display_order);

  // Name, colorway and price are identical on every row: take the first
  const first = rows[0];
  document.getElementById('product-name').textContent = first.product_name;
  document.getElementById('colorway').textContent = first.colorway;
  document.getElementById('price').textContent = '$' + first.price.toFixed(2);

  const fullLabel = (r) => r.size_label + ' · EU ' + r.size_eu;
  let selected = null;

  rows.forEach((r) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'size';
    btn.textContent = String(r.size_us_men);          // e.g. "9.5"; long label goes to the status line
    btn.dataset.sku = r.sku;
    btn.setAttribute('aria-pressed', 'false');

    if (r.stock_status === 'sold_out') {
      // aria-disabled (not `disabled`) so it stays tappable/focusable
      // and can show the message. It can never be selected.
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-label', 'Size M ' + r.size_us_men + ', out of stock');
    } else if (r.stock_status === 'low_stock') {
      btn.setAttribute('aria-label', 'Size M ' + r.size_us_men + ', only ' + r.stock_quantity + ' left');
    } else {
      btn.setAttribute('aria-label', 'Size M ' + r.size_us_men);
    }
    btn._row = r;
    grid.appendChild(btn);
  });

  function soldOutMessage(r) {
    return 'Size M ' + r.size_us_men + ' is out of stock.';
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.size');
    if (!btn) return;
    const r = btn._row;

    if (r.stock_status === 'sold_out') {
      status.textContent = soldOutMessage(r);
      return;
    }
    if (selected) selected.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-pressed', 'true');
    selected = btn;

    status.textContent = fullLabel(r) +
      (r.stock_status === 'low_stock' ? ' · Only ' + r.stock_quantity + ' left' : '');
  });

  // Keyboard users hear the message when a sold-out size gets focus
  grid.addEventListener('focusin', (e) => {
    const btn = e.target.closest('.size');
    if (btn && btn._row.stock_status === 'sold_out') {
      status.textContent = soldOutMessage(btn._row);
    }
  });
})();
