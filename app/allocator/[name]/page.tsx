"use client";

import { use, useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { RefreshButton } from "@/components/refresh-button";
import { TotalsCards } from "@/components/totals-cards";
import { MonthSection } from "@/components/month-section";
import { EmptyState, ErrorState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisbursements } from "@/lib/use-disbursements";
import { computeTotals, groupByMonth } from "@/lib/aggregate";

export default function AllocatorPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const allocatorName = decodeURIComponent(name);
  const { items, error, refreshing, reload } = useDisbursements();

  // Records for this allocator — matches the key used by groupByAllocator.
  const mine = useMemo(
    () =>
      (items ?? []).filter(
        (d) => (d.allocator.trim() || "Unknown") === allocatorName,
      ),
    [items, allocatorName],
  );
  const totals = useMemo(() => computeTotals(mine), [mine]);
  const months = useMemo(() => groupByMonth(mine), [mine]);

  const loading = items === null && !error;

  return (
    <>
      <AppHeader
        title={allocatorName}
        backHref="/"
        action={
          <RefreshButton
            onClick={() => reload(true)}
            spinning={refreshing}
            disabled={refreshing || items === null}
          />
        }
      />

      <main className="flex-1 space-y-4 px-4 pb-10 pt-4">
        <TotalsCards totals={totals} loading={loading} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => reload(true)} />
        ) : mine.length === 0 ? (
          <EmptyState
            title="No disbursements"
            hint="Nothing recorded for this allocator."
          />
        ) : (
          <div className="space-y-4">
            {months.map((m) => (
              <MonthSection key={m.key} group={m} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
