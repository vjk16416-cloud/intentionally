export const DEFAULT_POST_AUTH_PATH = "/discover";

const SAFE_NEXT_ORIGIN = "https://intentionally.local";

export function getSafeNextPathValue(next: string | null | undefined) {
  if (
    !next?.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return DEFAULT_POST_AUTH_PATH;
  }

  try {
    const target = new URL(next, SAFE_NEXT_ORIGIN);
    if (target.origin !== SAFE_NEXT_ORIGIN) {
      return DEFAULT_POST_AUTH_PATH;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return DEFAULT_POST_AUTH_PATH;
  }
}

export function getSafeNextPath(url: URL) {
  return getSafeNextPathValue(url.searchParams.get("next"));
}

export function getLoginPath(next: string | null | undefined) {
  const safeNext = getSafeNextPathValue(next);
  return `/login?next=${encodeURIComponent(safeNext)}`;
}

export function resolvePostAuthNextPath(params: {
  next: string | null | undefined;
  onboardingComplete: boolean;
}) {
  if (!params.onboardingComplete) {
    return "/onboarding";
  }

  return getSafeNextPathValue(params.next);
}

export function resolvePostAuthRedirectPath(params: {
  url: URL;
  onboardingComplete: boolean;
}) {
  return resolvePostAuthNextPath({
    next: params.url.searchParams.get("next"),
    onboardingComplete: params.onboardingComplete,
  });
}
