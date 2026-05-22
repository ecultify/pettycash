import { NextResponse } from "next/server";
import { ApiError, callBackend } from "@/lib/petty-cash-api";
import type {
  CreatePayload,
  DisbursementRecord,
  UpdatePayload,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json(
    { error: "Unexpected server error." },
    { status: 500 },
  );
}

// GET /api/disbursements — list all disbursements.
export async function GET() {
  try {
    const data = await callBackend<{ records: DisbursementRecord[] }>(
      "list.php?limit=200&offset=0",
      "GET",
    );
    return NextResponse.json({ records: data.records ?? [] });
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/disbursements — create a disbursement.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreatePayload>;

    if (!body.giver?.trim() || !body.recipient?.trim()) {
      return NextResponse.json(
        { error: "Giver and recipient are required." },
        { status: 400 },
      );
    }
    const amountGiven = Number(body.amount_given);
    if (!isFinite(amountGiven) || amountGiven < 0) {
      return NextResponse.json(
        { error: "Amount given must be a number of 0 or more." },
        { status: 400 },
      );
    }
    if (!body.given_date) {
      return NextResponse.json(
        { error: "Given date is required." },
        { status: 400 },
      );
    }

    const payload: CreatePayload = {
      giver: body.giver.trim(),
      recipient: body.recipient.trim(),
      amount_given: amountGiven,
      given_date: body.given_date,
      amount_spent: Number(body.amount_spent) || 0,
      ...(body.notes?.trim() ? { notes: body.notes.trim() } : {}),
    };

    const data = await callBackend<{ id: number; created_at: number }>(
      "create.php",
      "POST",
      payload,
    );
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

// PATCH /api/disbursements — update a disbursement (partial).
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Partial<UpdatePayload>;
    if (typeof body.id !== "number") {
      return NextResponse.json(
        { error: "A disbursement id is required." },
        { status: 400 },
      );
    }
    const data = await callBackend<{ updated: number }>(
      "update.php",
      "POST",
      body,
    );
    return NextResponse.json(data);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/disbursements — delete disbursements by id.
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { ids?: number[] };
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: "No disbursement ids provided." },
        { status: 400 },
      );
    }
    const data = await callBackend<{ deleted: number }>("delete.php", "POST", {
      ids: body.ids,
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleError(err);
  }
}
