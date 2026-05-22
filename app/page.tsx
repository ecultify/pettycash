"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { StatusPill } from "@/components/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchDisbursements } from "@/lib/client";
import { formatDate, formatINR, normalise } from "@/lib/format";
import type { Disbursement } from "@/lib/types";

export default function HomePage() {
  const [items, setItems] = useState<Disbursement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const records = await fetchDisbursements();
      const list = records
        .map(normalise)
        .sort((a, b) => b.givenDate.localeCompare(a.givenDate));
      setItems(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load.";
      setError(message);
      if (isRefresh) toast.error(message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const list = items ?? [];
    return {
      disbursed: list.reduce((s, d) => s + d.amountGiven, 0),
      spent: list.reduce((s, d) => s + d.amountSpent, 0),
      outstanding: list
        .filter((d) => !d.remainderReturned)
        .reduce((s, d) => s + d.remainder, 0),
    };
  }, [items]);

  return (
    <>
      <AppHeader
        title="Petty Cash"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh"
            onClick={() => load(true)}
            disabled={refreshing || items === null}
            className="h-10 w-10"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
          </Button>
        }
      />

      <main className="flex-1 px-4 pb-28 pt-4">
        {/* Summary strip */}
        <section className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-3">
          <SummaryCell
            label="Disbursed"
            value={totals.disbursed}
            loading={items === null}
          />
          <SummaryCell
            label="Spent"
            value={totals.spent}
            loading={items === null}
          />
          <SummaryCell
            label="Outstanding"
            value={totals.outstanding}
            loading={items === null}
            emphasise
          />
        </section>

        {/* List */}
        <section className="mt-4 space-y-2">
          {items === null && !error ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
            ))
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(true)} />
          ) : items && items.length === 0 ? (
            <EmptyState />
          ) : (
            items?.map((d) => <DisbursementRow key={d.id} d={d} />)
          )}
        </section>
      </main>

      {/* Floating Add button */}
      <Link
        href="/add"
        className="fixed bottom-6 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-black/20 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        Add
      </Link>
    </>
  );
}

function SummaryCell({
  label,
  value,
  loading,
  emphasise,
}: {
  label: string;
  value: number;
  loading: boolean;
  emphasise?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-5 w-16" />
      ) : (
        <span
          className={
            emphasise
              ? "text-base font-semibold tabular-nums"
              : "text-base font-medium tabular-nums"
          }
        >
          {formatINR(value)}
        </span>
      )}
    </div>
  );
}

function DisbursementRow({ d }: { d: Disbursement }) {
  return (
    <Link
      href={`/disbursement/${d.id}`}
      className="block rounded-xl border border-border bg-card p-3.5 active:bg-muted"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {d.allocator} <span className="text-muted-foreground">→</span>{" "}
          {d.giver} <span className="text-muted-foreground">→</span>{" "}
          {d.recipient}
        </p>
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {formatINR(d.amountGiven)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {formatDate(d.givenDate)}
        </span>
        <StatusPill status={d.status} remainder={d.remainder} />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="text-sm font-medium">No disbursements yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Tap “Add” to record the first cash disbursement.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <p className="text-sm font-medium">Couldn’t load disbursements</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
