"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AddButton } from "@/components/add-button";
import { RefreshButton } from "@/components/refresh-button";
import { TotalsCards } from "@/components/totals-cards";
import { ViewTabs } from "@/components/view-tabs";
import { Stat } from "@/components/stat";
import { EmptyState, ErrorState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisbursements } from "@/lib/use-disbursements";
import {
  computeTotals,
  groupByAllocator,
  type AllocatorSummary,
} from "@/lib/aggregate";
import { formatINR } from "@/lib/format";

export default function OverviewPage() {
  const { items, error, refreshing, reload } = useDisbursements();

  const totals = useMemo(() => computeTotals(items ?? []), [items]);
  const allocators = useMemo(() => groupByAllocator(items ?? []), [items]);

  const loading = items === null && !error;

  return (
    <>
      <AppHeader
        title="Petty Cash"
        action={
          <RefreshButton
            onClick={() => reload(true)}
            spinning={refreshing}
            disabled={refreshing || items === null}
          />
        }
      />

      <main className="flex-1 space-y-4 px-4 pb-28 pt-4">
        <ViewTabs />

        <TotalsCards totals={totals} loading={loading} />

        <section className="space-y-2">
          <h2 className="px-1 text-sm font-semibold">Allocators</h2>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[112px] w-full rounded-xl" />
            ))
          ) : error ? (
            <ErrorState message={error} onRetry={() => reload(true)} />
          ) : allocators.length === 0 ? (
            <EmptyState
              title="No disbursements yet"
              hint="Tap “Add” to record the first cash disbursement."
            />
          ) : (
            allocators.map((a) => <AllocatorCard key={a.name} a={a} />)
          )}
        </section>
      </main>

      <AddButton />
    </>
  );
}

function AllocatorCard({ a }: { a: AllocatorSummary }) {
  return (
    <Link
      href={`/allocator/${encodeURIComponent(a.name)}`}
      className="block rounded-xl border border-border bg-card p-4 active:bg-muted"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{a.name}</p>
          <p className="text-xs text-muted-foreground">
            {a.count} {a.count === 1 ? "disbursement" : "disbursements"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Allocated
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatINR(a.totals.allocated)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <Stat label="Handed Off" value={formatINR(a.totals.handedOff)} />
        <Stat label="Spent" value={formatINR(a.totals.spent)} />
        <Stat
          label="Outstanding"
          value={formatINR(a.totals.outstanding)}
          emphasise
        />
      </div>
    </Link>
  );
}
