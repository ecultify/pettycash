import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Sticky top bar. Shows a back chevron when `backHref` is given.
export function AppHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b border-border bg-background/95 px-2 backdrop-blur">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span className="w-2" />
      )}
      <h1 className="flex-1 truncate text-base font-semibold tracking-tight">
        {title}
      </h1>
      {action}
    </header>
  );
}
