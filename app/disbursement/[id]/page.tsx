"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  deleteDisbursements,
  fetchDisbursements,
  updateDisbursement,
} from "@/lib/client";
import { formatDate, formatINR, normalise } from "@/lib/format";
import type { Disbursement } from "@/lib/types";

type Form = {
  allocator: string;
  amountAllocated: string;
  giver: string;
  recipient: string;
  amountGiven: string;
  givenDate: string;
  amountSpent: string;
  notes: string;
};

function toForm(d: Disbursement): Form {
  return {
    allocator: d.allocator,
    amountAllocated: String(d.amountAllocated),
    giver: d.giver,
    recipient: d.recipient,
    amountGiven: String(d.amountGiven),
    givenDate: d.givenDate.slice(0, 10),
    amountSpent: String(d.amountSpent),
    notes: d.notes ?? "",
  };
}

export default function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const recordId = Number(id);
  const router = useRouter();

  const [record, setRecord] = useState<Disbursement | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingReturn, setTogglingReturn] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const records = await fetchDisbursements();
      const found = records.map(normalise).find((d) => d.id === recordId);
      if (!found) {
        setError("This disbursement no longer exists.");
        return;
      }
      setRecord(found);
      setForm(toForm(found));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    }
  }, [recordId]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key: keyof Form) => (value: string) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form || saving) return;

    if (!form.allocator.trim()) {
      toast.error("Allocator is required.");
      return;
    }
    if (!form.giver.trim() || !form.recipient.trim()) {
      toast.error("Giver and recipient are required.");
      return;
    }
    const amountAllocated = Number(form.amountAllocated);
    const amountGiven = Number(form.amountGiven);
    const amountSpent = Number(form.amountSpent);
    if (!isFinite(amountAllocated) || amountAllocated < 0) {
      toast.error("Enter a valid amount allocated.");
      return;
    }
    if (!isFinite(amountGiven) || amountGiven < 0) {
      toast.error("Enter a valid amount given.");
      return;
    }
    if (!isFinite(amountSpent) || amountSpent < 0) {
      toast.error("Enter a valid amount spent.");
      return;
    }

    setSaving(true);
    try {
      await updateDisbursement({
        id: recordId,
        allocator: form.allocator.trim(),
        giver: form.giver.trim(),
        recipient: form.recipient.trim(),
        amount_allocated: amountAllocated,
        amount_given: amountGiven,
        given_date: form.givenDate,
        amount_spent: amountSpent,
        notes: form.notes.trim() || null,
      });
      toast.success("Changes saved.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleReturned() {
    if (!record || togglingReturn) return;
    const next = !record.remainderReturned;
    setTogglingReturn(true);
    try {
      await updateDisbursement({ id: recordId, remainder_returned: next });
      toast.success(
        next ? "Marked as returned to giver." : "Marked as not returned.",
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setTogglingReturn(false);
    }
  }

  async function onDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteDisbursements([recordId]);
      toast.success("Disbursement deleted.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
      setDeleting(false);
    }
  }

  // --- Loading / error states -------------------------------------------
  if (error) {
    return (
      <>
        <AppHeader title="Disbursement" backHref="/" />
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium">Couldn’t open this disbursement</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={load}>
            Try again
          </Button>
        </div>
      </>
    );
  }

  if (!record || !form) {
    return (
      <>
        <AppHeader title="Disbursement" backHref="/" />
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </>
    );
  }

  // Live remainder reflects the value currently typed into the form.
  const liveRemainder =
    (Number(form.amountGiven) || 0) - (Number(form.amountSpent) || 0);

  return (
    <>
      <AppHeader title="Disbursement" backHref="/" />

      <main className="flex-1 px-4 py-4">
        {/* Summary card */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 text-sm font-medium">
              {record.allocator}{" "}
              <span className="text-muted-foreground">→</span> {record.giver}{" "}
              <span className="text-muted-foreground">→</span>{" "}
              {record.recipient}
            </p>
            <StatusPill status={record.status} remainder={record.remainder} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Allocated" value={formatINR(record.amountAllocated)} />
            <Stat label="Given" value={formatINR(record.amountGiven)} />
            <Stat label="Spent" value={formatINR(record.amountSpent)} />
            <Stat
              label="Remainder"
              value={formatINR(liveRemainder)}
              emphasise
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Given on {formatDate(record.givenDate)}
            {record.returnedAt
              ? ` · Returned on ${formatDate(record.returnedAt)}`
              : ""}
          </p>
        </section>

        {/* Remainder-returned toggle */}
        <button
          type="button"
          onClick={onToggleReturned}
          disabled={togglingReturn}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left active:bg-muted disabled:opacity-60"
        >
          <span>
            <span className="block text-sm font-medium">
              Remainder returned to giver
            </span>
            <span className="block text-xs text-muted-foreground">
              {record.remainderReturned
                ? "Unspent cash has been returned."
                : "Mark when unspent cash is handed back."}
            </span>
          </span>
          <span
            className={
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border " +
              (record.remainderReturned
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-border bg-background")
            }
          >
            {record.remainderReturned ? <Check className="h-4 w-4" /> : null}
          </span>
        </button>

        {/* Edit form */}
        <form onSubmit={onSave} className="mt-4 space-y-4">
          <h2 className="text-sm font-semibold">Edit details</h2>

          <Field label="Amount spent so far (₹)">
            <Input
              value={form.amountSpent}
              onChange={(e) => set("amountSpent")(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Separator />

          <Field label="Allocator">
            <Input
              value={form.allocator}
              onChange={(e) => set("allocator")(e.target.value)}
              autoComplete="off"
              className="h-12"
            />
          </Field>

          <Field label="Amount allocated (₹)">
            <Input
              value={form.amountAllocated}
              onChange={(e) => set("amountAllocated")(e.target.value)}
              inputMode="decimal"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Field label="Giver">
            <Input
              value={form.giver}
              onChange={(e) => set("giver")(e.target.value)}
              autoComplete="off"
              className="h-12"
            />
          </Field>

          <Field label="Recipient">
            <Input
              value={form.recipient}
              onChange={(e) => set("recipient")(e.target.value)}
              autoComplete="off"
              className="h-12"
            />
          </Field>

          <Field label="Amount given (₹)">
            <Input
              value={form.amountGiven}
              onChange={(e) => set("amountGiven")(e.target.value)}
              inputMode="decimal"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Field label="Given date">
            <Input
              type="date"
              value={form.givenDate}
              onChange={(e) => set("givenDate")(e.target.value)}
              className="h-12"
            />
          </Field>

          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Optional"
              rows={3}
            />
          </Field>

          <Button
            type="submit"
            disabled={saving}
            className="h-12 w-full text-base"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="mt-3 h-12 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete disbursement
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this disbursement?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the record for {record.giver} →{" "}
                {record.recipient}. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasise,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={
          emphasise
            ? "text-sm font-semibold tabular-nums"
            : "text-sm font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}
