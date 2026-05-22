import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { Stat } from "@/components/stat";
import { formatDate, formatINR } from "@/lib/format";
import type { Disbursement } from "@/lib/types";

// A single disbursement row: giver -> recipient, money breakdown, status.
export function DisbursementRow({ d }: { d: Disbursement }) {
  return (
    <Link
      href={`/disbursement/${d.id}`}
      className="block rounded-xl border border-border bg-card p-3.5 active:bg-muted"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">
          {d.giver} <span className="text-muted-foreground">→</span>{" "}
          {d.recipient}
        </p>
        <StatusPill status={d.status} />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <Stat label="Given" value={formatINR(d.amountGiven)} />
        <Stat label="Spent" value={formatINR(d.amountSpent)} />
        <Stat label="Remainder" value={formatINR(d.remainder)} emphasise />
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">
        {formatDate(d.givenDate)}
      </p>
    </Link>
  );
}
