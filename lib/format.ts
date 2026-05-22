import type {
  Disbursement,
  DisbursementRecord,
  DisbursementStatus,
} from "./types";

// Format a number as Indian Rupees, e.g. 1000 -> "₹1,000".
export function formatINR(value: number): string {
  return (
    "₹" +
    value.toLocaleString("en-IN", {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

// "2026-05-22 14:30:00" -> "22 May 2026"
export function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Unix ms -> "22 May 2026, 2:30 PM"
export function formatDateTime(ms: number | null): string {
  if (!ms) return "—";
  const d = new Date(ms);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusOf(amountGiven: number, amountSpent: number, returned: boolean): DisbursementStatus {
  if (returned) return "returned";
  if (amountGiven - amountSpent > 0) return "outstanding";
  return "spent";
}

// Convert a raw backend record into the normalised UI shape.
export function normalise(r: DisbursementRecord): Disbursement {
  const amountAllocated = Number(r.amount_allocated) || 0;
  const amountGiven = Number(r.amount_given) || 0;
  const amountSpent = Number(r.amount_spent) || 0;
  const remainderReturned = r.remainder_returned === 1;
  return {
    id: r.id,
    allocator: r.allocator ?? "",
    giver: r.giver,
    recipient: r.recipient,
    amountAllocated,
    amountGiven,
    amountSpent,
    givenDate: r.given_date,
    remainderReturned,
    returnedAt: r.returned_at,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    remainder: amountGiven - amountSpent,
    status: statusOf(amountGiven, amountSpent, remainderReturned),
  };
}
