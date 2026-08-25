// Pure helpers for the private profile-photos bucket. Both the server action
// (validating that a submitted path is owned by the caller) and the
// client form (uploading directly via the browser Supabase client) use
// these so the rules live in one place.

export const PROFILE_PHOTOS_BUCKET = "profile-photos";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAllowedPhotoMime(mimeType: string): boolean {
  return mimeType in MIME_TO_EXT;
}

export function getPhotoExtension(mimeType: string): string | null {
  return MIME_TO_EXT[mimeType] ?? null;
}

// Path layout: `{userId}/{uuid}.{ext}`. The {userId} prefix is what
// the storage INSERT/DELETE policies match `auth.uid()` against. Discover
// never exposes raw paths: the server issues short-lived signed URLs.
export function buildPhotoPath(userId: string, extension: string): string {
  return `${userId}/${crypto.randomUUID()}.${extension}`;
}

export function isOwnedBy(path: string, userId: string): boolean {
  return path.startsWith(`${userId}/`);
}
