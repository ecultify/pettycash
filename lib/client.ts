// Browser-side helpers. These only ever call our own /api/* routes —
// never the PHP backend directly.
import type {
  CreatePayload,
  DisbursementRecord,
  UpdatePayload,
} from "./types";

async function parse(res: Response) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "Request failed. Please try again.";
    throw new Error(message);
  }
  return data;
}

export async function fetchDisbursements(): Promise<DisbursementRecord[]> {
  const res = await fetch("/api/disbursements", { cache: "no-store" });
  const data = await parse(res);
  return (data?.records ?? []) as DisbursementRecord[];
}

export async function createDisbursement(
  payload: CreatePayload,
): Promise<{ id: number; created_at: number }> {
  const res = await fetch("/api/disbursements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

export async function updateDisbursement(
  payload: UpdatePayload,
): Promise<{ updated: number }> {
  const res = await fetch("/api/disbursements", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

export async function deleteDisbursements(
  ids: number[],
): Promise<{ deleted: number }> {
  const res = await fetch("/api/disbursements", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return parse(res);
}
