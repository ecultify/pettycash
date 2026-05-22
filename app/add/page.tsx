"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDisbursement } from "@/lib/client";

function today() {
  // Local YYYY-MM-DD for the date input default.
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default function AddPage() {
  const router = useRouter();
  const [allocator, setAllocator] = useState("");
  const [amountAllocated, setAmountAllocated] = useState("");
  const [giver, setGiver] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [givenDate, setGivenDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    const amountGiven = Number(amount);
    if (!isFinite(amountGiven) || amountGiven < 0) {
      toast.error("Enter a valid amount given.");
      return;
    }
    const allocatedRaw = amountAllocated.trim();
    const allocated = Number(allocatedRaw);
    if (allocatedRaw && (!isFinite(allocated) || allocated < 0)) {
      toast.error("Enter a valid amount allocated.");
      return;
    }
    if (!givenDate) {
      toast.error("Pick a given date.");
      return;
    }

    setSubmitting(true);
    try {
      await createDisbursement({
        allocator: allocator.trim(),
        giver: giver.trim(),
        recipient: recipient.trim(),
        amount_allocated: allocatedRaw ? allocated : undefined,
        amount_given: amountGiven,
        given_date: givenDate,
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
          <Field label="Allocator">
            <Input
              value={allocator}
              onChange={(e) => setAllocator(e.target.value)}
              placeholder="Who gave you this money?"
              autoComplete="off"
              className="h-12"
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

          <Field label="Giver">
            <Input
              value={giver}
              onChange={(e) => setGiver(e.target.value)}
              placeholder="Who handed out the cash"
              autoComplete="off"
              className="h-12"
            />
          </Field>

          <Field label="Recipient">
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Who received it"
              autoComplete="off"
              className="h-12"
            />
          </Field>

          <Field label="Amount given (₹)">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="h-12 text-base tabular-nums"
            />
          </Field>

          <Field label="Given date">
            <Input
              type="date"
              value={givenDate}
              onChange={(e) => setGivenDate(e.target.value)}
              className="h-12"
            />
          </Field>

          <Field label="Notes (optional)">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What is this cash for?"
              rows={3}
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
