"use client";

import { useActionState, useMemo, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import { createClient } from "@/lib/supabase/client";
import {
  buildPhotoPath,
  getPhotoExtension,
  isAllowedPhotoMime,
  PROFILE_PHOTOS_BUCKET,
} from "@/lib/storage/photos";

import { savePhotos, type SavePhotosState } from "./actions";

const INITIAL_STATE: SavePhotosState = {};
const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;

export function PhotosForm({
  userId,
  initialPaths,
  returnTo,
  previousStep,
}: {
  userId: string;
  initialPaths: string[];
  returnTo: string | null;
  previousStep: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [paths, setPaths] = useState<string[]>(initialPaths);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [state, action, pending] = useActionState(savePhotos, INITIAL_STATE);

  function publicUrlFor(path: string): string {
    return supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .getPublicUrl(path).data.publicUrl;
  }

  async function onPickFile(file: File) {
    setUploadError(null);
    if (!isAllowedPhotoMime(file.type)) {
      setUploadError("Use a JPEG, PNG or WebP image.");
      return;
    }
    const ext = getPhotoExtension(file.type);
    if (!ext) {
      setUploadError("Use a JPEG, PNG or WebP image.");
      return;
    }
    if (paths.length >= MAX_PHOTOS) {
      setUploadError(`Up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const path = buildPhotoPath(userId, ext);
    setUploading(true);
    const { error } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    setUploading(false);

    if (error) {
      setUploadError(error.message);
      return;
    }
    setPaths((prev) => [...prev, path]);
  }

  async function removePhoto(path: string) {
    setUploadError(null);
    const { error } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .remove([path]);
    if (error) {
      setUploadError(error.message);
      return;
    }
    setPaths((prev) => prev.filter((p) => p !== path));
  }

  const ready =
    paths.length >= MIN_PHOTOS && paths.length <= MAX_PHOTOS && !uploading;

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {paths.map((path) => (
          <div
            key={path}
            className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {/* Raw <img>: photos are user-uploaded and the bucket
              host is variable per env; not worth wiring next/image
              remotePatterns for MVP. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicUrlFor(path)}
              alt=""
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                removePhoto(path).catch((error: unknown) => {
                  console.error("Photo removal failed:", error);
                  setUploadError(
                    error instanceof Error
                      ? error.message
                      : "Photo removal failed. Please try again.",
                  );
                });
              }}
              className="absolute right-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-muted"
            >
              Remove
            </button>
            <input type="hidden" name="paths" value={path} />
          </div>
        ))}
        {paths.length < MAX_PHOTOS ? (
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed border-border bg-card text-xs font-semibold text-muted-foreground shadow-sm transition-colors hover:bg-muted">
            <span>{uploading ? "Uploading…" : "+ Add"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onPickFile(file).catch((error: unknown) => {
                    console.error("Photo upload failed:", error);
                    setUploadError(
                      error instanceof Error
                        ? error.message
                        : "Photo upload failed. Please try again.",
                    );
                  });
                  e.target.value = "";
                }
              }}
            />
          </label>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card px-4 py-3 text-xs leading-5 text-muted-foreground shadow-sm">
        <p>
          {paths.length} of {MAX_PHOTOS} added · at least {MIN_PHOTOS} required.
        </p>
        <p>JPEG, PNG or WebP. Max 5 MB per photo.</p>
      </div>

      {uploadError ? (
        <p className="text-sm text-destructive">{uploadError}</p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
        disabled={!ready}
      />
    </form>
  );
}
