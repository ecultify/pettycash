"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DisbursementRow } from "@/components/disbursement-row";
import { Stat } from "@/components/stat";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import type { MonthGroup } from "@/lib/aggregate";

// A collapsible month group: header bar with subtotals, then disbursement rows.
export function MonthSection({
  group,
  defaultOpen = true,
  onUpdated,
}: {
  group: MonthGroup;
  defaultOpen?: boolean;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{group.label}</span>
          <span className="block text-xs text-muted-foreground">
            {group.items.length}{" "}
            {group.items.length === 1 ? "disbursement" : "disbursements"}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="text-right">
            <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Outstanding
            </span>
            <span className="block text-sm font-semibold tabular-nums">
              {formatINR(group.totals.outstanding)}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <>
          <div className="grid grid-cols-4 gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
            <Stat label="Allocated" value={formatINR(group.totals.allocated)} />
            <Stat label="Handed" value={formatINR(group.totals.handedOff)} />
            <Stat label="Spent" value={formatINR(group.totals.spent)} />
            <Stat
              label="Out"
              value={formatINR(group.totals.outstanding)}
              emphasise
            />
          </div>
          {group.items.map((d) => (
            <DisbursementRow key={d.id} d={d} onUpdated={onUpdated} />
          ))}
        </>
      )}
    </section>
  );
}
