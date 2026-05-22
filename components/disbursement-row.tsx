"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { StatusPill } from "@/components/status-pill";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDisbursement } from "@/lib/client";
import { formatDate, formatINR } from "@/lib/format";
import type { Disbursement } from "@/lib/types";

// A single disbursement card: tap the top to open detail/edit; if the
// remainder is not yet returned, an inline field records how much came back.
export function DisbursementRow({
  d,
  onUpdated,
}: {
  d: Disbursement;
  onUpdated: () => void;
}) {
  // Default to the current remainder — the likely amount handed back.
  const [returned, setReturned] = useState(String(d.remainder));
  const [saving, setSaving] = useState(false);

  async function onRecordReturn() {
    if (saving) return;
    const amount = Number(returned);
    if (
      !returned.trim() ||
      !isFinite(amount) ||
      amount < 0 ||
      amount > d.amountGiven
    ) {
      toast.error(
        `Returned must be between ₹0 and ${formatINR(d.amountGiven)}.`,
      );
      return;
    }
    setSaving(true);
    try {
      // Whatever was not returned counts as spent.
      await updateDisbursement({
        id: d.id,
        amount_spent: d.amountGiven - amount,
        remainder_returned: true,
      });
      toast.success(`Recorded ${formatINR(amount)} returned to ${d.giver}.`);
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <Link
        href={`/disbursement/${d.id}`}
        className="block p-3.5 active:bg-muted"
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

      {!d.remainderReturned && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              Returned ₹
            </span>
            <Input
              value={returned}
              onChange={(e) => setReturned(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              aria-label={`Amount returned by ${d.recipient}`}
              className="h-10 flex-1 text-sm tabular-nums"
            />
            <Button
              type="button"
              size="sm"
              onClick={onRecordReturn}
              disabled={saving}
              className="h-10 shrink-0"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Marks the remainder returned; the rest counts as spent.
          </p>
        </div>
      )}
    </div>
  );
}
