import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <p className="text-sm font-medium">Page not found</p>
      <p className="text-sm text-muted-foreground">
        That screen doesn’t exist in Petty Cash.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/">Back to list</Link>
      </Button>
    </div>
  );
}
