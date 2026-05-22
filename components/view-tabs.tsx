"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/all", label: "All disbursements" },
];

// Segmented control switching between the Overview and All-disbursements views.
export function ViewTabs() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md py-2 text-center text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
