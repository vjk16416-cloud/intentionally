type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function claimAnalyticsDedupeKey(
  storage: StorageLike,
  dedupeKey: string | undefined,
) {
  if (!dedupeKey) return true;

  try {
    const storageKey = `intentionally-analytics:${dedupeKey}`;
    if (storage.getItem(storageKey)) return false;

    storage.setItem(storageKey, "true");
    return true;
  } catch {
    // Analytics must never block the product when storage is unavailable.
    return true;
  }
}
