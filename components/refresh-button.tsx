"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Header refresh action — spins while a refetch is in flight.
export function RefreshButton({
  onClick,
  spinning,
  disabled,
}: {
  onClick: () => void;
  spinning: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Refresh"
      onClick={onClick}
      disabled={disabled}
      className="h-10 w-10"
    >
      <RefreshCw className={spinning ? "animate-spin" : ""} />
    </Button>
  );
}
