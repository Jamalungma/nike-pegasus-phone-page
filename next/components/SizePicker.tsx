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

  const soldOutMessage = (r: SizeRow) => `Size M ${r.size_us_men} is out of stock.`;

  function pick(r: SizeRow) {
    if (r.stock_status === "sold_out") {
      // aria-disabled (not `disabled`): stays tappable so it can explain itself,
      // but it can never become selected.
      setMessage(soldOutMessage(r));
      return;
    }
    setSelected(r.sku);
    setMessage(
      `${r.size_label} · EU ${r.size_eu}` +
        (r.stock_status === "low_stock" ? ` · Only ${r.stock_quantity} left` : "")
    );
  }

  function ariaLabel(r: SizeRow) {
    if (r.stock_status === "sold_out") return `Size M ${r.size_us_men}, out of stock`;
    if (r.stock_status === "low_stock") return `Size M ${r.size_us_men}, only ${r.stock_quantity} left`;
    return `Size M ${r.size_us_men}`;
  }

  return (
    <>
      <div className="sizes__grid" role="group" aria-labelledby="sizes-title">
        {rows.map((r) => (
          <button
            key={r.sku}
            type="button"
            className="size"
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
      <p className="sizes__status" role="status" aria-live="polite">
        {message}
      </p>
    </>
  );
}
