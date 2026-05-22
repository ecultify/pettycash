// Client-side aggregation of disbursement records into totals and groups.
// All totals are derived here from the records list — no extra endpoints.
import type { Disbursement } from "./types";

export type Totals = {
  allocated: number; // sum of amount_allocated
  handedOff: number; // sum of amount_given
  spent: number; // sum of amount_spent
  outstanding: number; // sum of (given - spent) for un-returned records, >= 0
};

// Outstanding cash for one record: 0 once the remainder is returned,
// otherwise the unspent portion clamped to >= 0.
export function outstandingOf(d: Disbursement): number {
  if (d.remainderReturned) return 0;
  return Math.max(0, d.amountGiven - d.amountSpent);
}

export function computeTotals(items: Disbursement[]): Totals {
  return items.reduce<Totals>(
    (t, d) => ({
      allocated: t.allocated + d.amountAllocated,
      handedOff: t.handedOff + d.amountGiven,
      spent: t.spent + d.amountSpent,
      outstanding: t.outstanding + outstandingOf(d),
    }),
    { allocated: 0, handedOff: 0, spent: 0, outstanding: 0 },
  );
}

export type AllocatorSummary = {
  name: string;
  totals: Totals;
  count: number;
};

// One summary per distinct allocator, sorted by total allocated (desc).
export function groupByAllocator(items: Disbursement[]): AllocatorSummary[] {
  const map = new Map<string, Disbursement[]>();
  for (const d of items) {
    const key = d.allocator.trim() || "Unknown";
    const arr = map.get(key);
    if (arr) arr.push(d);
    else map.set(key, [d]);
  }
  return [...map.entries()]
    .map(([name, list]) => ({
      name,
      totals: computeTotals(list),
      count: list.length,
    }))
    .sort((a, b) => b.totals.allocated - a.totals.allocated);
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// "2026-05-22 14:30:00" -> "2026-05"
export function monthKey(givenDate: string): string {
  return givenDate.slice(0, 7);
}

// "2026-05" -> "May 2026"
export function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const name = MONTH_NAMES[Number(month) - 1] ?? month;
  return `${name} ${year}`;
}

export type MonthGroup = {
  key: string; // "2026-05"
  label: string; // "May 2026"
  items: Disbursement[]; // newest given_date first
  totals: Totals;
};

// Group records by year+month of given_date, newest month first.
export function groupByMonth(items: Disbursement[]): MonthGroup[] {
  const map = new Map<string, Disbursement[]>();
  for (const d of items) {
    const key = monthKey(d.givenDate);
    const arr = map.get(key);
    if (arr) arr.push(d);
    else map.set(key, [d]);
  }
  return [...map.entries()]
    .map(([key, list]) => ({
      key,
      label: monthLabel(key),
      items: [...list].sort((a, b) => b.givenDate.localeCompare(a.givenDate)),
      totals: computeTotals(list),
    }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

// Distinct, sorted values of a name field — used for input suggestions.
export function distinctNames(
  items: Disbursement[],
  field: "allocator" | "giver" | "recipient",
): string[] {
  const set = new Set<string>();
  for (const d of items) {
    const value = d[field].trim();
    if (value) set.add(value);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
