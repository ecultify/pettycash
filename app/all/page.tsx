"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AddButton } from "@/components/add-button";
import { RefreshButton } from "@/components/refresh-button";
import { TotalsCards } from "@/components/totals-cards";
import { ViewTabs } from "@/components/view-tabs";
import { MonthSection } from "@/components/month-section";
import { EmptyState, ErrorState } from "@/components/states";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisbursements } from "@/lib/use-disbursements";
import { computeTotals, distinctNames, groupByMonth } from "@/lib/aggregate";
import type { DisbursementStatus } from "@/lib/types";

type StatusFilter = "all" | DisbursementStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "returned", label: "Returned" },
  { value: "outstanding", label: "With recipient" },
  { value: "spent", label: "Fully spent" },
];

const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AllDisbursementsPage() {
  const { items, error, refreshing, reload } = useDisbursements();
  const [allocator, setAllocator] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const allocatorOptions = useMemo(
    () => distinctNames(items ?? [], "allocator"),
    [items],
  );

  // Apply allocator + status + search filters to the record list.
  const filtered = useMemo(() => {
    let list = items ?? [];
    if (allocator) {
      list = list.filter(
        (d) => (d.allocator.trim() || "Unknown") === allocator,
      );
    }
    if (status !== "all") {
      list = list.filter((d) => d.status === status);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.allocator.toLowerCase().includes(q) ||
          d.giver.toLowerCase().includes(q) ||
          d.recipient.toLowerCase().includes(q) ||
          (d.notes ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, allocator, status, search]);

  // Totals and month groups reflect the filtered set.
  const totals = useMemo(() => computeTotals(filtered), [filtered]);
  const months = useMemo(() => groupByMonth(filtered), [filtered]);

  const loading = items === null && !error;
  const filtersActive = allocator !== "" || status !== "all" || search !== "";

  return (
    <>
      <AppHeader
        title="All Disbursements"
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

        {/* Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search allocator, giver, recipient, notes"
              className="h-11 pl-9"
              inputMode="search"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Filter by allocator"
              value={allocator}
              onChange={(e) => setAllocator(e.target.value)}
              className={selectClass}
            >
              <option value="">All allocators</option>
              {allocatorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <TotalsCards totals={totals} loading={loading} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => reload(true)} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtersActive ? "No matches" : "No disbursements yet"}
            hint={
              filtersActive
                ? "Try adjusting the filters or search."
                : "Tap “Add” to record the first cash disbursement."
            }
          />
        ) : (
          <div className="space-y-4">
            {months.map((m) => (
              <MonthSection key={m.key} group={m} />
            ))}
          </div>
        )}
      </main>

      <AddButton />
    </>
  );
}
