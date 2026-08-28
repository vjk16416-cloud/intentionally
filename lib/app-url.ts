import "server-only";

function configuredAppUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL
  );
}

export function appUrlForPath(path: string) {
  const configured = configuredAppUrl();
  if (!configured) {
    throw new Error("Missing required environment variable: APP_URL");
  }

  const base = new URL(configured);
  return new URL(path, `${base.origin}/`).toString();
}
