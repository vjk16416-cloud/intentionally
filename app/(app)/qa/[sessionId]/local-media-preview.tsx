"use client";

import { useEffect, useRef, useState } from "react";

import type { QaVisibilityMode } from "@/lib/qa/visibility";
import { cn } from "@/lib/utils";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

type LocalMediaPreviewProps = {
  visibilityMode?: QaVisibilityMode;
  isSoftened?: boolean;
  statusLabel?: string;
  helperText?: string;
  isCompact?: boolean;
};

export function LocalMediaPreview({
  visibilityMode = "open",
  isSoftened = false,
  statusLabel,
  helperText,
  isCompact = false,
}: LocalMediaPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const shouldSoften = visibilityMode === "dynamic" && isSoftened;

  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (isMounted) {
          setPermissionState("unsupported");
          setErrorMessage("Camera and microphone access is not supported in this browser.");
        }
        return;
      }

      try {
        setPermissionState("requesting");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setPermissionState("granted");
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) return;

        setPermissionState("denied");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Camera or microphone permission was not allowed.",
        );
      }
    }

    startCamera();

    return () => {
      isMounted = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [permissionState]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black shadow-xl",
        isCompact ? "min-h-44 lg:min-h-72" : "min-h-72",
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition duration-500",
          shouldSoften && "scale-105 blur-sm opacity-75",
        )}
      />

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55",
          shouldSoften && "bg-black/15",
        )}
      />

      <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
          You
        </span>

        <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white/85 backdrop-blur">
          {permissionState === "granted"
            ? statusLabel ?? "Camera on"
            : "Connecting"}
        </span>
      </div>

      {permissionState !== "granted" && (
        <div
          className={cn(
            "relative z-10 flex items-center justify-center px-4 text-center text-sm leading-6 text-white/80",
            isCompact ? "min-h-44 lg:min-h-72" : "min-h-72",
          )}
        >
          {permissionState === "requesting"
            ? "Asking for camera and microphone permission..."
            : "Your camera preview will appear here once permission is allowed."}
        </div>
      )}

      {permissionState === "denied" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-black/70 px-3 py-2 text-center text-xs leading-5 text-white/90 backdrop-blur">
          Camera or microphone access was blocked. Allow permissions in your browser settings, then
          refresh.
        </div>
      )}

      {permissionState === "unsupported" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-black/70 px-3 py-2 text-center text-xs leading-5 text-white/90 backdrop-blur">
          {errorMessage}
        </div>
      )}

      {permissionState === "granted" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-black/40 px-3 py-2 text-center text-xs leading-5 text-white/85 backdrop-blur">
          {helperText ?? "Take your time. Short, honest answers are enough."}
        </div>
      )}
    </div>
  );
}
