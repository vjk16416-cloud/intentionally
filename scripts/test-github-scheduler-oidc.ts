import assert from "node:assert/strict";
import { createSign, generateKeyPairSync } from "node:crypto";

import {
  GITHUB_SCHEDULER_AUDIENCE,
  verifyGitHubSchedulerOidcToken,
} from "../lib/cron/github-oidc";

const nowSeconds = Math.floor(Date.now() / 1000);
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const publicJwk = publicKey.export({ format: "jwk" });
Object.assign(publicJwk, {
  kid: "test-key",
  alg: "RS256",
  use: "sig",
});

const fetchJwks = async () =>
  new Response(JSON.stringify({ keys: [publicJwk] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

function issueToken(overrides: Record<string, unknown> = {}) {
  const header = {
    alg: "RS256",
    kid: "test-key",
    typ: "JWT",
  };
  const payload = {
    iss: "https://token.actions.githubusercontent.com",
    aud: GITHUB_SCHEDULER_AUDIENCE,
    exp: nowSeconds + 300,
    nbf: nowSeconds - 10,
    iat: nowSeconds - 10,
    repository: "vjk16416-cloud/intentionally",
    repository_id: "1239150444",
    ref: "refs/heads/main",
    workflow_ref:
      "vjk16416-cloud/intentionally/.github/workflows/qa-reminder-scheduler.yml@refs/heads/main",
    event_name: "schedule",
    ...overrides,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64url");
  return `${signingInput}.${signature}`;
}

async function main() {
  assert.equal(
    await verifyGitHubSchedulerOidcToken(issueToken(), fetchJwks),
    true,
    "a valid token from the production scheduler workflow must be accepted",
  );

  assert.equal(
    await verifyGitHubSchedulerOidcToken(
      issueToken({ aud: "wrong-audience" }),
      fetchJwks,
    ),
    false,
    "a token for another audience must be rejected",
  );

  assert.equal(
    await verifyGitHubSchedulerOidcToken(
      issueToken({
        workflow_ref:
          "vjk16416-cloud/intentionally/.github/workflows/other.yml@refs/heads/main",
      }),
      fetchJwks,
    ),
    false,
    "a token from another workflow must be rejected",
  );

  assert.equal(
    await verifyGitHubSchedulerOidcToken(
      issueToken({ repository_id: "999999" }),
      fetchJwks,
    ),
    false,
    "a token from another repository identity must be rejected",
  );

  assert.equal(
    await verifyGitHubSchedulerOidcToken(
      issueToken({ exp: nowSeconds - 60 }),
      fetchJwks,
    ),
    false,
    "an expired token must be rejected",
  );

  const tampered = `${issueToken().slice(0, -1)}x`;
  assert.equal(
    await verifyGitHubSchedulerOidcToken(tampered, fetchJwks),
    false,
    "a token with a tampered signature must be rejected",
  );

  console.log("GitHub scheduler OIDC regression passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
