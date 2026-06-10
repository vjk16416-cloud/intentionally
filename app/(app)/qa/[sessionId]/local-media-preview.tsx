"use client";

import { useEffect, useRef, useState } from "react";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export function LocalMediaPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          await videoRef.current.play().catch(() => {
            // Some browsers delay autoplay until the element is ready.
          });
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
      videoRef.current.play().catch(() => {
        // Some browsers delay autoplay until the element is ready.
      });
    }
  }, [permissionState]);

  return (
    <div className="relative min-h-64 overflow-hidden rounded-[1.5rem] bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          You
        </span>
        <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
          {permissionState === "granted" ? "Camera on" : "Connecting"}
        </span>
      </div>

      {permissionState !== "granted" && (
        <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm leading-6 text-white/80">
          {permissionState === "requesting"
            ? "Asking for camera and microphone permission..."
            : "Your camera preview will appear here once permission is allowed."}
        </div>
      )}

      {permissionState === "denied" && (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/65 px-3 py-2 text-center text-xs leading-5 text-white/85">
          Camera or microphone access was blocked. Allow permissions in your browser settings, then
          refresh.
        </div>
      )}

      {permissionState === "unsupported" && (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/65 px-3 py-2 text-center text-xs leading-5 text-white/85">
          {errorMessage}
        </div>
      )}

      {permissionState === "granted" && (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/35 px-3 py-2 text-center text-xs leading-5 text-white/80 backdrop-blur">
          Take your time. Short, honest answers are enough.
        </div>
      )}
    </div>
  );
}
