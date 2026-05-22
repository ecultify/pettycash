import Link from "next/link";
import { Plus } from "lucide-react";

// Floating "+ Add" button, fixed within the app's mobile column.
export function AddButton() {
  return (
    <Link
      href="/add"
      className="fixed bottom-6 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-black/20 active:scale-95"
    >
      <Plus className="h-5 w-5" />
      Add
    </Link>
  );
}
