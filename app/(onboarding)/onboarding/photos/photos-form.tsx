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
            className="relative aspect-square overflow-hidden rounded-2xl border"
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
              onClick={() => removePhoto(path)}
              className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm"
            >
              Remove
            </button>
            <input type="hidden" name="paths" value={path} />
          </div>
        ))}
        {paths.length < MAX_PHOTOS ? (
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed text-xs text-muted-foreground transition-colors hover:bg-muted">
            <span>{uploading ? "Uploading…" : "+ Add photo"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void onPickFile(file);
                  e.target.value = "";
                }
              }}
            />
          </label>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        {paths.length} of {MAX_PHOTOS} added · at least {MIN_PHOTOS} required ·
        JPEG, PNG or WebP, up to 5 MB
      </p>

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
