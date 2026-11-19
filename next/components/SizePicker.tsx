"use client";

import { useState } from "react";
import type { SizeRow } from "@/lib/sizes";

interface Props {
  rows: SizeRow[];
  /** Set when the data could not be loaded; shown in the reserved status line. */
  error?: string;
}

export default function SizePicker({ rows, error }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState(error ?? "");
  // True after the add button is pressed for the current size; reset when the size changes
  const [added, setAdded] = useState(false);

  const selectedRow = rows.find((r) => r.sku === selected) ?? null;

  const soldOutMessage = (r: SizeRow) => `Size M ${r.size_us_men} is sold out.`;

  function pick(r: SizeRow) {
    if (r.stock_status === "sold_out") {
      // aria-disabled (not `disabled`): stays tappable so it can explain itself,
      // but it can never become selected.
      setMessage(soldOutMessage(r));
      return;
    }
    setSelected(r.sku);
    setAdded(false);
    setMessage(
      `${r.size_label} · EU ${r.size_eu}` +
        (r.stock_status === "low_stock" ? ` · Only ${r.stock_quantity} left` : "")
    );
  }

  // There is no cart yet: this only confirms the pick. Hook a real add-to-bag call in here.
  function addToBag() {
    if (!selectedRow) return;
    setAdded(true);
    setMessage(`Added to bag: ${selectedRow.size_label} · EU ${selectedRow.size_eu}`);
  }

  function ariaLabel(r: SizeRow) {
    // Same words as the visible key ("sold out"), so screen readers say what sighted users see
    if (r.stock_status === "sold_out") return `Size M ${r.size_us_men}, sold out`;
    if (r.stock_status === "low_stock") return `Size M ${r.size_us_men}, only ${r.stock_quantity} left`;
    return `Size M ${r.size_us_men}`;
  }

  return (
    <>
      <div className="sizes__grid" data-testid="size-grid" role="group" aria-labelledby="sizes-title">
        {rows.map((r) => (
          <button
            key={r.sku}
            type="button"
            className="size"
            // The speed check reads sold-out buttons separately from the rest
            data-testid={r.stock_status === "sold_out" ? "size-button-sold-out" : "size-button"}
            aria-pressed={selected === r.sku}
            aria-disabled={r.stock_status === "sold_out" ? true : undefined}
            aria-label={ariaLabel(r)}
            onClick={() => pick(r)}
            // Keyboard users hear the out-of-stock message when focus lands here
            onFocus={() => {
              if (r.stock_status === "sold_out") setMessage(soldOutMessage(r));
            }}
          >
            {String(r.size_us_men)}
          </button>
        ))}
      </div>
      {/* One-line key: explains the strike without relying on the picture alone */}
      <p className="sizes__key">
        <span className="sizes__key-swatch" aria-hidden="true" />
        Crossed out = sold out
      </p>
      <p className="sizes__status" role="status" aria-live="polite">
        {message}
      </p>
      {/* Server-rendered (disabled) so it takes its space from first paint: no layout shift.
          Real `disabled`: it only turns on once an in-stock size is picked. */}
      <button
        type="button"
        className="add"
        data-testid="add-to-bag"
        disabled={!selectedRow}
        onClick={addToBag}
      >
        {!selectedRow
          ? "Select a size"
          : added
            ? "Added to bag ✓"
            : `Add M ${selectedRow.size_us_men} to bag`}
      </button>
    </>
  );
}
