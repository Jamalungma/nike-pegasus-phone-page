import { readFile } from "node:fs/promises";
import path from "node:path";

export type StockStatus = "in_stock" | "low_stock" | "sold_out";

export interface SizeRow {
  sku: string;
  product_name: string;
  colorway: string;
  price: number;
  size_label: string;
  size_us_men: number;
  size_eu: string;
  display_order: number;
  stock_status: StockStatus;
  stock_quantity: number;
}

export type SizeData =
  | { ok: true; rows: SizeRow[] }
  | { ok: false; error: string };

// The JSON is the single source of truth: nothing about sizes is hardcoded.
const DATA_FILE = path.join(
  process.cwd(),
  "data",
  "pegasus_size_stock_2026-12-08.json"
);

/** Reads and validates the size file on the server. Never throws. */
export async function loadSizes(): Promise<SizeData> {
  try {
    const parsed: unknown = JSON.parse(await readFile(DATA_FILE, "utf8"));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("empty or not an array");
    }
    const rows = (parsed as SizeRow[])
      .slice()
      // Ascending display_order; the EU run has gaps, so never generate sizes.
      .sort((a, b) => a.display_order - b.display_order);
    return { ok: true, rows };
  } catch {
    return { ok: false, error: "Sizes could not be loaded. Please refresh." };
  }
}
