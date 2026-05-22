"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchDisbursements } from "./client";
import { normalise } from "./format";
import type { Disbursement } from "./types";

// Shared client hook: fetches all disbursements, normalises them, and keeps
// them sorted newest given_date first. `items === null` means still loading.
export function useDisbursements() {
  const [items, setItems] = useState<Disbursement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const records = await fetchDisbursements();
      setItems(
        records
          .map(normalise)
          .sort((a, b) => b.givenDate.localeCompare(a.givenDate)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load.";
      setError(message);
      if (isRefresh) toast.error(message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Refetch when the app/tab regains focus, so a list is never stale after
  // adding or editing a record on another screen.
  useEffect(() => {
    function refetchIfVisible() {
      if (document.visibilityState === "visible") reload();
    }
    window.addEventListener("focus", refetchIfVisible);
    document.addEventListener("visibilitychange", refetchIfVisible);
    return () => {
      window.removeEventListener("focus", refetchIfVisible);
      document.removeEventListener("visibilitychange", refetchIfVisible);
    };
  }, [reload]);

  return { items, error, refreshing, reload };
}
