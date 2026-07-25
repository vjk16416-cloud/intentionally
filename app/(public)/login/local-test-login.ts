export const LOCAL_TEST_IDENTITIES = ["man", "woman"] as const;

export type LocalTestIdentity = (typeof LOCAL_TEST_IDENTITIES)[number];

export type LocalTestLoginEnvironment = {
  NODE_ENV?: string;
  DEV_TEST_LOGIN?: string;
  DEV_TEST_ALLOWED_HOST?: string;
  LOCAL_TEST_MAN_EMAIL?: string;
  LOCAL_TEST_MAN_PASSWORD?: string;
  LOCAL_TEST_WOMAN_EMAIL?: string;
  LOCAL_TEST_WOMAN_PASSWORD?: string;
};

export type LocalTestCredentials = {
  email: string;
  password: string;
};

export type LocalTestLoginRejectionReason =
  | "unknown_identity"
  | "production"
  | "disabled"
  | "unapproved_host"
  | "missing_credentials";

export type LocalTestLoginResolution =
  | {
      ok: true;
      identity: LocalTestIdentity;
      credentials: LocalTestCredentials;
    }
  | {
      ok: false;
      reason: LocalTestLoginRejectionReason;
    };

const CREDENTIAL_KEYS = {
  man: {
    email: "LOCAL_TEST_MAN_EMAIL",
    password: "LOCAL_TEST_MAN_PASSWORD",
  },
  woman: {
    email: "LOCAL_TEST_WOMAN_EMAIL",
    password: "LOCAL_TEST_WOMAN_PASSWORD",
  },
} as const satisfies Record<
  LocalTestIdentity,
  {
    email: keyof LocalTestLoginEnvironment;
    password: keyof LocalTestLoginEnvironment;
  }
>;

export function isLocalTestIdentity(
  value: unknown,
): value is LocalTestIdentity {
  return value === "man" || value === "woman";
}

function requestHostname(host: string | null) {
  if (!host) return null;

  const value = host.trim().toLowerCase();
  const bracketed = value.match(/^\[([0-9a-f:.]+)\](?::([0-9]{1,5}))?$/);
  const unbracketed = value.match(/^([a-z0-9.-]+)(?::([0-9]{1,5}))?$/);
  const match = bracketed ?? unbracketed;

  if (!match) {
    return null;
  }

  const [, hostname, port] = match;
  if (!hostname || (port && Number(port) > 65_535)) {
    return null;
  }

  return hostname;
}

function isApprovedDevelopmentHost(
  host: string | null,
  allowedHost: string | undefined,
) {
  const hostname = requestHostname(host);
  if (!hostname) return false;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  const configuredHostname = allowedHost?.trim().toLowerCase();
  return Boolean(configuredHostname && hostname === configuredHostname);
}

function credentialsForIdentity(
  identity: LocalTestIdentity,
  environment: LocalTestLoginEnvironment,
) {
  const keys = CREDENTIAL_KEYS[identity];
  const email = environment[keys.email]?.trim();
  const password = environment[keys.password];

  if (!email || !password?.trim()) {
    return null;
  }

  return { email, password } satisfies LocalTestCredentials;
}

export function resolveLocalTestLogin(
  identityValue: unknown,
  requestHost: string | null,
  environment: LocalTestLoginEnvironment,
): LocalTestLoginResolution {
  if (!isLocalTestIdentity(identityValue)) {
    return { ok: false, reason: "unknown_identity" };
  }

  if (environment.NODE_ENV === "production") {
    return { ok: false, reason: "production" };
  }

  if (environment.DEV_TEST_LOGIN !== "true") {
    return { ok: false, reason: "disabled" };
  }

  if (
    !isApprovedDevelopmentHost(
      requestHost,
      environment.DEV_TEST_ALLOWED_HOST,
    )
  ) {
    return { ok: false, reason: "unapproved_host" };
  }

  const credentials = credentialsForIdentity(identityValue, environment);
  if (!credentials) {
    return { ok: false, reason: "missing_credentials" };
  }

  return { ok: true, identity: identityValue, credentials };
}

export function availableLocalTestIdentities(
  requestHost: string | null,
  environment: LocalTestLoginEnvironment,
) {
  return LOCAL_TEST_IDENTITIES.filter(
    (identity) => resolveLocalTestLogin(identity, requestHost, environment).ok,
  );
}
