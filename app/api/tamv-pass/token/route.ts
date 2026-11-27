import { auth } from "@/lib/auth";
import { createTamvPassToken, isTamvPassEnabled } from "@/lib/tamv-pass/tokens";
import { enforcePublicRateLimit } from "@/lib/rate-limit/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_BODY_BYTES = 2_048;
const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status, headers: NO_STORE_HEADERS });
}

async function readBoundedJson(request: Request): Promise<{ value?: unknown; response?: Response }> {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return { response: jsonError("content_type_must_be_application_json", 415) };
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) {
    return { response: jsonError("request_body_too_large", 413) };
  }

  if (!request.body) {
    return { response: jsonError("invalid_json_body", 400) };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { response: jsonError("request_body_too_large", 413) };
      }
      chunks.push(value);
    }
  } catch {
    return { response: jsonError("invalid_request_body", 400) };
  }

  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown };
  } catch {
    return { response: jsonError("invalid_json_body", 400) };
  }
}

export async function POST(request: Request) {
  if (!isTamvPassEnabled()) return jsonError("tamv_pass_disabled", 404);

  const origin = request.headers.get("origin");
  if (!origin) return jsonError("origin_required", 403);
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return jsonError("invalid_request_origin", 400);
  }
  if (origin !== requestOrigin) return jsonError("cross_origin_request_rejected", 403);

  const rateLimited = await enforcePublicRateLimit(request, {
    scope: "tamv-pass-token",
    limit: 10,
    windowMs: 60_000,
  });
  if (rateLimited) return rateLimited;

  const parsed = await readBoundedJson(request);
  if (parsed.response) return parsed.response;

  if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return jsonError("invalid_token_request", 400);
  }

  const body = parsed.value as Record<string, unknown>;
  if (typeof body.audience !== "string" || body.audience.length > 512) {
    return jsonError("audience_required", 400);
  }
  if (body.scopes !== undefined && (
    !Array.isArray(body.scopes) ||
    body.scopes.length === 0 ||
    body.scopes.length > 2 ||
    body.scopes.some((scope) => typeof scope !== "string")
  )) {
    return jsonError("invalid_scopes", 400);
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>>;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch {
    return jsonError("authentication_unavailable", 503);
  }
  if (!session?.user?.id) return jsonError("authentication_required", 401);

  try {
    const user = session.user as typeof session.user & {
      role?: string | null;
      emailVerified?: boolean;
    };
    const token = await createTamvPassToken(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified === true,
        role: user.role ?? "member",
      },
      body.audience,
      body.scopes,
    );

    return Response.json({
      access_token: token.accessToken,
      token_type: "Bearer",
      expires_in: token.expiresIn,
      audience: token.audience,
      scope: token.scopes.join(" "),
      key_id: token.keyId,
    }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/audience is required|audience must|not allowlisted|Scopes must|requested scopes are not supported/i.test(message)) {
      return jsonError("invalid_audience_or_scopes", 400);
    }
    return jsonError("tamv_pass_unavailable", 503);
  }
}
