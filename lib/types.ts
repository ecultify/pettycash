// Shape of a disbursement record as returned by the PHP backend.
// NOTE: DECIMAL fields (amount_given, amount_spent) arrive as STRINGS.
export type DisbursementRecord = {
  id: number;
  giver: string;
  recipient: string;
  amount_given: string;
  given_date: string; // "YYYY-MM-DD HH:MM:SS"
  amount_spent: string;
  remainder_returned: number; // 0 | 1
  returned_at: string | null;
  notes: string | null;
  source: string;
  created_at: number; // unix ms
  updated_at: number | null;
};

// Normalised record used by the UI (numbers parsed, derived fields added).
export type Disbursement = {
  id: number;
  giver: string;
  recipient: string;
  amountGiven: number;
  amountSpent: number;
  givenDate: string; // "YYYY-MM-DD HH:MM:SS"
  remainderReturned: boolean;
  returnedAt: string | null;
  notes: string | null;
  remainder: number; // amountGiven - amountSpent
  status: DisbursementStatus;
};

export type DisbursementStatus = "returned" | "outstanding" | "spent";

export type CreatePayload = {
  giver: string;
  recipient: string;
  amount_given: number;
  given_date: string;
  amount_spent?: number;
  notes?: string;
};

export type UpdatePayload = {
  id: number;
  giver?: string;
  recipient?: string;
  amount_given?: number;
  given_date?: string;
  amount_spent?: number;
  remainder_returned?: boolean;
  returned_at?: string | null;
  notes?: string | null;
};
