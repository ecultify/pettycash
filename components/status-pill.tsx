import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import type { Disbursement } from "@/lib/types";

// Status pill: green "Returned" / amber "₹X with recipient" / grey "Fully spent".
export function StatusPill({
  status,
  remainder,
  className,
}: {
  status: Disbursement["status"];
  remainder: number;
  className?: string;
}) {
  const styles: Record<Disbursement["status"], string> = {
    returned: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    outstanding: "bg-amber-50 text-amber-700 ring-amber-600/20",
    spent: "bg-muted text-muted-foreground ring-border",
  };

  const label =
    status === "returned"
      ? "Returned"
      : status === "outstanding"
        ? `${formatINR(remainder)} with recipient`
        : "Fully spent";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
