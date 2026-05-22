import { cn } from "@/lib/utils";
import type { DisbursementStatus } from "@/lib/types";

// Status pill: green "Returned" / amber "With recipient" / grey "Fully spent".
const CONFIG: Record<DisbursementStatus, { label: string; cls: string }> = {
  returned: {
    label: "Returned",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  outstanding: {
    label: "With recipient",
    cls: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  spent: {
    label: "Fully spent",
    cls: "bg-muted text-muted-foreground ring-border",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: DisbursementStatus;
  className?: string;
}) {
  const { label, cls } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}
