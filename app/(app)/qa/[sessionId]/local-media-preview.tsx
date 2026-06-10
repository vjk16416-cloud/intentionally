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
    <section className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Camera check</p>
        <p className="text-xs leading-5 text-muted-foreground">
          We ask for camera and microphone access so your guided Q&amp;A can feel more present and
          human. You can leave at any time.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />

        {permissionState !== "granted" && (
          <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-white/80">
            {permissionState === "requesting"
              ? "Asking for camera and microphone permission..."
              : "Camera preview will appear here once permission is allowed."}
          </div>
        )}
      </div>

      {permissionState === "denied" && (
        <p className="mt-3 text-xs leading-5 text-destructive">
          Camera or microphone access was blocked. Please allow camera and microphone permissions in
          your browser settings, then refresh this page.
        </p>
      )}

      {permissionState === "unsupported" && (
        <p className="mt-3 text-xs leading-5 text-destructive">{errorMessage}</p>
      )}
    </section>
  );
}
