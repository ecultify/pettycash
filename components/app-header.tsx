"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// Sticky top bar. When `backHref` is set, shows a back button that returns to
// the screen you actually came from (browser history). `backHref` is only the
// fallback for when the page was opened directly (a shared/deep link).
export function AppHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref ?? "/");
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b border-border bg-background/95 px-2 backdrop-blur">
      {backHref ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted active:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
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
