import { cn } from "@/lib/utils";

// A small label-over-value stat used across cards, rows and month subtotals.
export function Stat({
  label,
  value,
  emphasise,
  className,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          emphasise ? "text-sm font-semibold" : "text-sm font-medium",
        )}
      >
        {value}
      </span>
    </div>
  );
}
