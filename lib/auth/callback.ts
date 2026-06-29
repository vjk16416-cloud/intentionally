export const DEFAULT_POST_AUTH_PATH = "/discover";

export function getSafeNextPath(url: URL) {
  const next = url.searchParams.get("next");

  if (
    !next?.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return DEFAULT_POST_AUTH_PATH;
  }

  const target = new URL(next, url.origin);
  if (target.origin !== url.origin) {
    return DEFAULT_POST_AUTH_PATH;
  }

  return `${target.pathname}${target.search}${target.hash}`;
}

export function resolvePostAuthRedirectPath(params: {
  url: URL;
  onboardingComplete: boolean;
}) {
  if (!params.onboardingComplete) {
    return "/onboarding";
  }

  return getSafeNextPath(params.url);
}
