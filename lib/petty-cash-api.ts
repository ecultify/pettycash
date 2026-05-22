// Server-only helper for talking to the PHP Petty Cash backend.
// The API key never leaves the server — the browser only ever calls /api/*.
import "server-only";

const BASE_URL = "https://cultform.ecultify.com/api/petty-cash";

// Friendly messages for the error codes the backend can return.
const ERROR_MESSAGES: Record<string, string> = {
  invalid_api_key: "Server is not configured correctly (invalid API key).",
  missing_fields: "Some required fields are missing.",
  invalid_input: "The data sent was invalid.",
  not_found: "That disbursement could not be found.",
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function friendly(code: string | undefined, status: number): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (status === 401) return ERROR_MESSAGES.invalid_api_key;
  return "Something went wrong talking to the server. Please try again.";
}

type Method = "GET" | "POST";

// Call a backend endpoint, attaching the X-API-Key header.
export async function callBackend<T>(
  path: string,
  method: Method,
  body?: unknown,
): Promise<T> {
  // The ONE server-side env var the whole app uses for backend auth.
  // .trim() guards against a stray newline/space pasted into the host panel.
  const apiKey = process.env.PETTY_CASH_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[petty-cash] Missing required environment variable: PETTY_CASH_API_KEY. " +
        "Set it in the hosting provider's Node.js environment settings and " +
        "restart the app. (A local .env.local file is NOT deployed.)",
    );
    throw new ApiError(
      "Server is missing the PETTY_CASH_API_KEY environment variable.",
      500,
    );
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/${path}`, {
      method,
      headers: {
        "X-API-Key": apiKey,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection.", 502);
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const code =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : undefined;
    if (res.status === 401 || code === "invalid_api_key") {
      console.error(
        "[petty-cash] Backend returned 401 invalid_api_key. The env var " +
          "PETTY_CASH_API_KEY is SET but its VALUE is wrong. The key is " +
          "case-sensitive — check for uppercase letters, an 'O' vs '0' typo, " +
          "or trailing whitespace. It must equal the key exactly.",
      );
    }
    throw new ApiError(friendly(code, res.status), res.status);
  }

  return data as T;
}
