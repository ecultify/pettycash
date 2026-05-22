"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { Combobox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDisbursement } from "@/lib/client";
import { useDisbursements } from "@/lib/use-disbursements";
import { distinctNames, distinctNotes } from "@/lib/aggregate";

function today() {
  // Local YYYY-MM-DD for the date input default.
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

// Validate an optional money field; returns the parsed number or undefined,
// or throws a message string when the value is present but invalid.
function optionalAmount(raw: string, label: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!isFinite(n) || n < 0) throw `Enter a valid ${label}.`;
  return n;
}

export default function AddPage() {
  const router = useRouter();
  const { items } = useDisbursements();

  const [allocator, setAllocator] = useState("");
  const [amountAllocated, setAmountAllocated] = useState("");
  const [giver, setGiver] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amountGiven, setAmountGiven] = useState("");
  const [givenDate, setGivenDate] = useState(today());
  const [amountSpent, setAmountSpent] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Suggestions drawn from existing records (free text is still allowed).
  const records = items ?? [];
  const allocatorNames = useMemo(
    () => distinctNames(records, "allocator"),
    [records],
  );
  const giverNames = useMemo(() => distinctNames(records, "giver"), [records]);
  const recipientNames = useMemo(
    () => distinctNames(records, "recipient"),
    [records],
  );
  const noteOptions = useMemo(() => distinctNotes(records), [records]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!allocator.trim()) {
      toast.error("Allocator is required.");
      return;
    }
    if (!giver.trim() || !recipient.trim()) {
      toast.error("Giver and recipient are required.");
      return;
    }
    const given = Number(amountGiven);
    if (!amountGiven.trim() || !isFinite(given) || given < 0) {
      toast.error("Enter a valid amount given.");
      return;
    }
    if (!givenDate) {
      toast.error("Pick a given date.");
      return;
    }

    let allocated: number | undefined;
    let spent: number | undefined;
    try {
      allocated = optionalAmount(amountAllocated, "amount allocated");
      spent = optionalAmount(amountSpent, "amount spent");
    } catch (message) {
      toast.error(String(message));
      return;
    }

    setSubmitting(true);
    try {
      await createDisbursement({
        allocator: allocator.trim(),
        giver: giver.trim(),
        recipient: recipient.trim(),
        amount_allocated: allocated,
        amount_given: given,
        given_date: givenDate,
        amount_spent: spent,
        notes: notes.trim() || undefined,
      });
      toast.success("Disbursement added.");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <AppHeader title="Add disbursement" backHref="/" />
      <form onSubmit={onSubmit} className="flex flex-1 flex-col px-4 py-4">
        <div className="space-y-4">
          <Field label="Allocator" required>
            <Combobox
              value={allocator}
              onChange={setAllocator}
              options={allocatorNames}
              placeholder="Who gave you this money?"
            />
          </Field>

          <Field label="Amount allocated (₹)">
            <Input
              value={amountAllocated}
              onChange={(e) => setAmountAllocated(e.target.value)}
              inputMode="decimal"
              placeholder="How much did they give you? (optional)"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Field label="Giver" required>
            <Combobox
              value={giver}
              onChange={setGiver}
              options={giverNames}
              placeholder="Who handed out the cash"
            />
          </Field>

          <Field label="Recipient" required>
            <Combobox
              value={recipient}
              onChange={setRecipient}
              options={recipientNames}
              placeholder="Who received it"
            />
          </Field>

          <Field label="Amount given (₹)" required>
            <Input
              value={amountGiven}
              onChange={(e) => setAmountGiven(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Field label="Given date" required>
            <Input
              type="date"
              value={givenDate}
              onChange={(e) => setGivenDate(e.target.value)}
              className="h-12"
            />
          </Field>

          <Field label="Amount spent (₹)">
            <Input
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
              inputMode="decimal"
              placeholder="0 (optional)"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Field label="Notes">
            <Combobox
              value={notes}
              onChange={setNotes}
              options={noteOptions}
              placeholder="What is this cash for? (optional)"
            />
          </Field>
        </div>

        <div className="mt-auto pt-6">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full text-base"
          >
            {submitting ? "Saving…" : "Save disbursement"}
          </Button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">
        {label}
        {required ? <span className="ml-0.5 text-foreground">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
