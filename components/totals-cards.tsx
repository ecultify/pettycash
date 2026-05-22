import { formatINR } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { Totals } from "@/lib/aggregate";

// The four headline totals: Allocated / Handed Off / Spent / Outstanding.
export function TotalsCards({
  totals,
  loading,
}: {
  totals: Totals;
  loading?: boolean;
}) {
  const cells: { label: string; value: number; emphasise?: boolean }[] = [
    { label: "Allocated", value: totals.allocated },
    { label: "Handed Off", value: totals.handedOff },
    { label: "Spent", value: totals.spent },
    { label: "Outstanding", value: totals.outstanding, emphasise: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border bg-card p-3"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {c.label}
          </p>
          {loading ? (
            <Skeleton className="mt-1.5 h-6 w-20" />
          ) : (
            <p
              className={
                c.emphasise
                  ? "mt-1 text-lg font-semibold tabular-nums"
                  : "mt-1 text-lg font-medium tabular-nums"
              }
            >
              {formatINR(c.value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
