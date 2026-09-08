import { createPublicKey, verify as verifySignature } from "node:crypto";

const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_OIDC_JWKS_URL =
  "https://token.actions.githubusercontent.com/.well-known/jwks";
const EXPECTED_REPOSITORY = "vjk16416-cloud/intentionally";
const EXPECTED_REPOSITORY_ID = "1239150444";
const EXPECTED_REF = "refs/heads/main";
const EXPECTED_WORKFLOW_REF =
  "vjk16416-cloud/intentionally/.github/workflows/qa-reminder-scheduler.yml@refs/heads/main";
const ALLOWED_EVENTS = new Set(["schedule", "workflow_dispatch"]);
const CLOCK_SKEW_SECONDS = 30;

export const GITHUB_SCHEDULER_AUDIENCE =
  "https://intentionally-seven.vercel.app/api/cron/qa-reminders";

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

type JwtHeader = {
  alg?: unknown;
  kid?: unknown;
  typ?: unknown;
};

type JwtClaims = {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
  iat?: unknown;
  repository?: unknown;
  repository_id?: unknown;
  ref?: unknown;
  workflow_ref?: unknown;
  event_name?: unknown;
};

type JwksResponse = {
  keys?: JsonWebKey[];
};

function decodeBase64UrlJson<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function audienceMatches(audience: unknown): boolean {
  if (typeof audience === "string") {
    return audience === GITHUB_SCHEDULER_AUDIENCE;
  }
  if (Array.isArray(audience)) {
    return audience.some((item) => item === GITHUB_SCHEDULER_AUDIENCE);
  }
  return false;
}

function claimsAreTrusted(claims: JwtClaims, nowSeconds: number): boolean {
  if (claims.iss !== GITHUB_OIDC_ISSUER) return false;
  if (!audienceMatches(claims.aud)) return false;
  if (claims.repository !== EXPECTED_REPOSITORY) return false;
  if (claims.repository_id !== EXPECTED_REPOSITORY_ID) return false;
  if (claims.ref !== EXPECTED_REF) return false;
  if (claims.workflow_ref !== EXPECTED_WORKFLOW_REF) return false;
  if (
    typeof claims.event_name !== "string" ||
    !ALLOWED_EVENTS.has(claims.event_name)
  ) {
    return false;
  }

  if (typeof claims.exp !== "number") return false;
  if (claims.exp < nowSeconds - CLOCK_SKEW_SECONDS) return false;
  if (
    typeof claims.nbf === "number" &&
    claims.nbf > nowSeconds + CLOCK_SKEW_SECONDS
  ) {
    return false;
  }
  if (
    typeof claims.iat === "number" &&
    claims.iat > nowSeconds + CLOCK_SKEW_SECONDS
  ) {
    return false;
  }

  return true;
}

export async function verifyGitHubSchedulerOidcToken(
  token: string,
  fetchImpl: FetchLike = fetch,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeBase64UrlJson<JwtHeader>(encodedHeader);
  const claims = decodeBase64UrlJson<JwtClaims>(encodedPayload);
  if (!header || !claims) return false;
  if (header.alg !== "RS256" || typeof header.kid !== "string") return false;
  if (header.typ !== undefined && header.typ !== "JWT") return false;
  if (!claimsAreTrusted(claims, Math.floor(Date.now() / 1000))) return false;

  try {
    const jwksResponse = await fetchImpl(GITHUB_OIDC_JWKS_URL, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!jwksResponse.ok) return false;

    const jwks = (await jwksResponse.json()) as JwksResponse;
    const jwk = jwks.keys?.find(
      (candidate) =>
        candidate.kid === header.kid &&
        candidate.kty === "RSA" &&
        (candidate.alg === undefined || candidate.alg === "RS256") &&
        (candidate.use === undefined || candidate.use === "sig"),
    );
    if (!jwk) return false;

    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`);
    const signature = Buffer.from(encodedSignature, "base64url");

    return verifySignature("RSA-SHA256", signingInput, publicKey, signature);
  } catch {
    return false;
  }
}
