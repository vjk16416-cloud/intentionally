export const INTERNAL_DEMO_PROFILE_NAMES = [
  "Internal Test Alex",
  "Internal Test Maya",
  "Daniel Brooks",
  "Priya Shah",
  "Sam Bennett",
  "Zara Khan",
  "Theo Morris",
  "Aisha Rahman",
  "Miles Carter",
  "Nina Patel",
  "Rowan Lee",
  "Grace Walker",
  "Omar Hussain",
  "Freya Collins",
  "Ben Turner",
  "Isla Green",
  "Leo Foster",
  "Sienna Price",
  "Noor Ahmed",
  "Chloe Evans",
] as const;

const INTERNAL_DEMO_ORDINAL = new Map(
  INTERNAL_DEMO_PROFILE_NAMES.map((name, index) => [name.toLowerCase(), index + 1]),
);

export function getInternalDemoOrdinal(
  displayName: string | null | undefined,
): number | null {
  if (!displayName) return null;
  return (
    INTERNAL_DEMO_ORDINAL.get(displayName.trim().toLowerCase()) ?? null
  );
}

export function isInternalDemoProfile(
  displayName: string | null | undefined,
): boolean {
  return getInternalDemoOrdinal(displayName) !== null;
}

// Internal demo/testing only:
// even-numbered seeded demo profiles are configured to auto-match so
// testers can exercise the downstream match -> Vibe Check -> chat flow
// without making every fake profile feel unrealistically reciprocal.
export function shouldAutoMatchInternalDemoProfile(
  displayName: string | null | undefined,
): boolean {
  const ordinal = getInternalDemoOrdinal(displayName);
  return ordinal !== null && ordinal % 2 === 0;
}
