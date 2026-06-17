function listFromEnv(name: string) {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function internalTestingModeEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.INTERNAL_TESTING_SHORTCUTS_ENABLED === "true" ||
    process.env.INTERNAL_TESTING_SHORTCUTS_ENABLED === "1"
  );
}

export function canUseInternalTestingShortcuts(
  email: string | null | undefined,
) {
  if (!internalTestingModeEnabled()) return false;

  if (process.env.NODE_ENV !== "production") return true;

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const allowedEmails = [
    ...listFromEnv("FOUNDER_ADMIN_EMAILS"),
    ...listFromEnv("INTERNAL_TESTING_EMAILS"),
  ];

  return (
    allowedEmails.includes(normalizedEmail) ||
    normalizedEmail.endsWith("@intentionally.local")
  );
}
