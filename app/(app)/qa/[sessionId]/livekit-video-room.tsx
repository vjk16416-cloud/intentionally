"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VideoTrack,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import {
  ConnectionState,
  isBrowserSupported,
  MediaDeviceFailure,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import Link from "next/link";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ConnectionDetails = {
  serverUrl: string;
  token: string;
};

export type LiveKitConnectionPhase =
  | "checking"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed"
  | "disconnected"
  | "unsupported";

export type LiveKitMediaIssues = {
  camera: string | null;
  microphone: string | null;
  general: string | null;
};

export type LiveKitVideoState = {
  phase: LiveKitConnectionPhase;
  message: string | null;
  mediaIssues: LiveKitMediaIssues;
  remoteParticipantHasJoined: boolean;
  retry: () => void;
};

export type LiveKitVideoRoomHandle = {
  disconnect: () => void;
};

type LiveKitVideoRoomProps = {
  sessionId: string;
  returnHref: string;
  children: ReactNode;
};

const LiveKitVideoStateContext = createContext<LiveKitVideoState | null>(null);

function useLiveKitVideoState() {
  const state = useContext(LiveKitVideoStateContext);
  if (!state) {
    throw new Error(
      "LiveKit participant video must be rendered inside LiveKitVideoRoom.",
    );
  }
  return state;
}

function isConnectionDetails(value: unknown): value is ConnectionDetails {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<ConnectionDetails>;
  return (
    typeof candidate.serverUrl === "string" &&
    typeof candidate.token === "string"
  );
}

function errorMessageFromPayload(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { error?: unknown };
  return typeof candidate.error === "string" ? candidate.error : null;
}

export const LiveKitVideoRoom = forwardRef<
  LiveKitVideoRoomHandle,
  LiveKitVideoRoomProps
>(function LiveKitVideoRoom({ sessionId, returnHref, children }, ref) {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
  );
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);
  const [phase, setPhase] = useState<LiveKitConnectionPhase>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [mediaIssues, setMediaIssues] = useState<LiveKitMediaIssues>({
    camera: null,
    microphone: null,
    general: null,
  });
  const [remoteParticipantHasJoined, setRemoteParticipantHasJoined] =
    useState(false);
  const [attempt, setAttempt] = useState(0);
  const intentionalDisconnect = useRef(false);
  const mediaDeviceFailureSeen = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      disconnect() {
        intentionalDisconnect.current = true;
        void room.disconnect();
      },
    }),
    [room],
  );

  useEffect(() => {
    const onReconnecting = () => {
      setPhase("reconnecting");
      setMessage("Your connection was interrupted. We\u2019re reconnecting you.");
      trackEvent("qa_video_reconnection_started", {
        qa_session_id: sessionId,
        video_provider: "livekit",
      });
    };
    const onReconnected = () => {
      setPhase("connected");
      setMessage(null);
      trackEvent("qa_video_reconnected", {
        qa_session_id: sessionId,
        video_provider: "livekit",
      });
    };
    const onParticipantConnected = () => {
      setRemoteParticipantHasJoined(true);
      trackEvent("qa_video_participant_joined", {
        qa_session_id: sessionId,
        video_provider: "livekit",
      });
    };
    const onParticipantDisconnected = () => {
      trackEvent("qa_video_participant_disconnected", {
        qa_session_id: sessionId,
        video_provider: "livekit",
      });
    };

    room.on(RoomEvent.Reconnecting, onReconnecting);
    room.on(RoomEvent.Reconnected, onReconnected);
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);

    return () => {
      room.off(RoomEvent.Reconnecting, onReconnecting);
      room.off(RoomEvent.Reconnected, onReconnected);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    };
  }, [room, sessionId]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadConnectionDetails() {
      if (!navigator.mediaDevices?.getUserMedia || !isBrowserSupported()) {
        setPhase("unsupported");
        setMessage(
          "This browser can\u2019t start camera and microphone video. Try the latest Safari or Chrome.",
        );
        return;
      }

      setPhase("checking");
      setMessage(null);
      setMediaIssues({ camera: null, microphone: null, general: null });
      mediaDeviceFailureSeen.current = false;
      setConnectionDetails(null);
      trackEvent("qa_video_connection_started", {
        qa_session_id: sessionId,
        video_provider: "livekit",
      });

      try {
        const response = await fetch(
          `/api/qa/${encodeURIComponent(sessionId)}/video-token`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok || !isConnectionDetails(payload)) {
          throw new Error(
            errorMessageFromPayload(payload) ??
              "We couldn\u2019t connect your Vibe Check.",
          );
        }

        if (!active) return;
        intentionalDisconnect.current = false;
        setConnectionDetails(payload);
        setPhase("connecting");
      } catch (error) {
        if (!active || controller.signal.aborted) return;

        setPhase("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn\u2019t connect your Vibe Check. Please try again.",
        );
        trackEvent("qa_video_connection_failed", {
          qa_session_id: sessionId,
          video_provider: "livekit",
        });
      }
    }

    void loadConnectionDetails();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt, sessionId]);

  useEffect(() => {
    return () => {
      intentionalDisconnect.current = true;
      void room.disconnect();
    };
  }, [room]);

  const retry = useCallback(() => {
    intentionalDisconnect.current = true;
    setConnectionDetails(null);
    setPhase("checking");
    setMessage(null);
    setMediaIssues({ camera: null, microphone: null, general: null });
    mediaDeviceFailureSeen.current = false;
    void room.disconnect().finally(() => {
      intentionalDisconnect.current = false;
      setAttempt((current) => current + 1);
    });
  }, [room]);

  const handleConnected = useCallback(() => {
    if (room.remoteParticipants.size > 0) {
      setRemoteParticipantHasJoined(true);
    }
    setPhase("connected");
    setMessage(null);
    trackEvent("qa_video_connected", {
      qa_session_id: sessionId,
      video_provider: "livekit",
    });
  }, [room, sessionId]);

  const handleDisconnected = useCallback(() => {
    if (intentionalDisconnect.current) return;

    setPhase("disconnected");
    setMessage(
      "The video connection ended. Try reconnecting, or end privately if you need to leave.",
    );
  }, []);

  const handleConnectionError = useCallback(() => {
    // LiveKit reports camera or microphone acquisition failures through both
    // onMediaDeviceFailure and onError. Once signalling is connected, keep
    // transport state intact so a working microphone or camera is never hidden
    // behind a false connection-failed screen.
    if (
      intentionalDisconnect.current ||
      room.state === ConnectionState.Connected ||
      mediaDeviceFailureSeen.current
    ) {
      return;
    }

    setPhase("failed");
    setMessage(
      "We couldn\u2019t connect your Vibe Check. Check your connection, then try again.",
    );
    trackEvent("qa_video_connection_failed", {
      qa_session_id: sessionId,
      video_provider: "livekit",
    });
  }, [room, sessionId]);

  const handleMediaDeviceFailure = useCallback(
    (failure?: MediaDeviceFailure, kind?: MediaDeviceKind) => {
      mediaDeviceFailureSeen.current = true;
      const denied = failure === MediaDeviceFailure.PermissionDenied;
      const issueKind =
        kind === "videoinput"
          ? "camera"
          : kind === "audioinput"
            ? "microphone"
            : "general";
      const deviceName =
        issueKind === "camera"
          ? "camera"
          : issueKind === "microphone"
            ? "microphone"
            : "camera or microphone";
      const nextMessage = denied
        ? `${deviceName[0].toUpperCase()}${deviceName.slice(1)} permission was blocked. Allow it in your browser settings, then try again.`
        : `We couldn\u2019t use your ${deviceName}. Check that it is connected and not being used elsewhere, then try again.`;

      setMediaIssues((current) => ({
        ...current,
        [issueKind]: nextMessage,
      }));
      trackEvent("qa_video_media_permission_failed", {
        qa_session_id: sessionId,
        video_provider: "livekit",
        media_kind: issueKind,
        failure: failure ?? "unknown",
      });
    },
    [sessionId],
  );

  const state = useMemo<LiveKitVideoState>(
    () => ({
      phase,
      message,
      mediaIssues,
      remoteParticipantHasJoined,
      retry,
    }),
    [mediaIssues, message, phase, remoteParticipantHasJoined, retry],
  );

  return (
    <LiveKitRoom
      room={room}
      serverUrl={connectionDetails?.serverUrl}
      token={connectionDetails?.token}
      connect={Boolean(connectionDetails)}
      audio={Boolean(connectionDetails)}
      video={Boolean(connectionDetails)}
      screen={false}
      className="contents"
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
      onError={handleConnectionError}
      onMediaDeviceFailure={handleMediaDeviceFailure}
    >
      <LiveKitVideoStateContext.Provider value={state}>
        {children}
        <RoomAudioRenderer />
        <StartAudio
          label="Tap to hear your match"
          className="fixed inset-x-4 bottom-20 z-50 mx-auto w-fit rounded-2xl bg-[#e8ded0] px-5 py-3 text-sm font-semibold text-[#241c17] shadow-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
        />
        <LiveKitRoomNotice returnHref={returnHref} />
      </LiveKitVideoStateContext.Provider>
    </LiveKitRoom>
  );
});

function LiveKitRoomNotice({ returnHref }: { returnHref: string }) {
  const state = useLiveKitVideoState();
  const isVisible =
    state.phase === "failed" ||
    state.phase === "disconnected" ||
    state.phase === "unsupported";

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl rounded-[1.35rem] border border-[#eadfce] bg-[#fffaf3]/95 p-4 text-center text-sm leading-6 text-[#4b4038] shadow-2xl backdrop-blur md:bottom-8"
    >
      <p className="font-semibold text-[#241c17]">
        {state.message ?? "We couldn\u2019t connect your Vibe Check."}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {state.phase !== "unsupported" ? (
          <button
            type="button"
            onClick={state.retry}
            className="rounded-2xl bg-[#241c17] px-4 py-2 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#241c17]/30"
          >
            Try again
          </button>
        ) : null}
        <Link
          href={returnHref}
          className="rounded-2xl border border-[#d8ccbd] bg-white px-4 py-2 text-xs font-semibold text-[#241c17] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#241c17]/20"
        >
          Return to scheduled session
        </Link>
      </div>
    </div>
  );
}

type LiveKitParticipantVideoProps = {
  participant: "local" | "remote";
  isSoftened: boolean;
  helperText: string;
};

export function LiveKitParticipantVideo({
  participant,
  isSoftened,
  helperText,
}: LiveKitParticipantVideoProps) {
  const state = useLiveKitVideoState();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const {
    localParticipant,
    isCameraEnabled,
    isMicrophoneEnabled,
    lastCameraError,
    lastMicrophoneError,
  } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const remoteParticipant = remoteParticipants[0];
  const selectedParticipant =
    participant === "local" ? localParticipant : remoteParticipant;
  const trackReference = cameraTracks.find(
    (track) => track.participant.identity === selectedParticipant?.identity,
  );
  const publication = trackReference?.publication;
  const microphonePublication = localParticipant.getTrackPublication(
    Track.Source.Microphone,
  );
  const hasPublishedCamera = Boolean(publication && !publication.isMuted);
  const hasCameraTrack = Boolean(
    hasPublishedCamera &&
      publication?.track &&
      (participant === "local" || publication.isSubscribed),
  );
  const shouldRenderCameraTrack =
    hasCameraTrack &&
    state.phase !== "failed" &&
    state.phase !== "disconnected" &&
    state.phase !== "unsupported";
  const isConnecting =
    state.phase === "checking" || state.phase === "connecting";
  const cameraIssue =
    state.mediaIssues.camera ??
    state.mediaIssues.general ??
    (lastCameraError && !isConnecting
      ? "We couldn\u2019t use your camera. Check its browser permission, then try again."
      : null);
  const microphoneIssue =
    state.mediaIssues.microphone ??
    state.mediaIssues.general ??
    (lastMicrophoneError && !isConnecting
      ? "We couldn\u2019t use your microphone. Check its browser permission, then try again."
      : null);
  const localPlaceholderIssue = Array.from(
    new Set([cameraIssue, microphoneIssue].filter((issue) => issue !== null)),
  ).join(" ");
  const canRetryMedia =
    participant === "local" && Boolean(cameraIssue || microphoneIssue);
  const [remotePublicationTimedOutForSid, setRemotePublicationTimedOutForSid] =
    useState<string | null>(null);
  const remoteParticipantSid = remoteParticipant?.sid ?? null;
  const remotePublicationWaitElapsed =
    remoteParticipantSid !== null &&
    remotePublicationTimedOutForSid === remoteParticipantSid;

  useEffect(() => {
    if (participant !== "remote" || !remoteParticipantSid || publication) return;

    const timeout = window.setTimeout(
      () => setRemotePublicationTimedOutForSid(remoteParticipantSid),
      5_000,
    );
    return () => window.clearTimeout(timeout);
  }, [participant, publication, remoteParticipantSid]);

  let statusLabel = "Connecting";
  let emptyState = "Connecting your camera and microphone\u2026";

  if (state.phase === "unsupported") {
    statusLabel = "Browser unsupported";
    emptyState = state.message ?? "This browser can\u2019t start video.";
  } else if (state.phase === "reconnecting") {
    statusLabel = "Reconnecting";
    emptyState = "Your connection was interrupted. We\u2019re reconnecting you.";
  } else if (state.phase === "failed") {
    statusLabel = "Couldn\u2019t connect";
    emptyState = state.message ?? "We couldn\u2019t connect your Vibe Check.";
  } else if (state.phase === "disconnected") {
    statusLabel = "Disconnected";
    emptyState = state.message ?? "The video connection ended.";
  } else if (
    participant === "local" &&
    localPlaceholderIssue &&
    !hasCameraTrack
  ) {
    statusLabel =
      cameraIssue && microphoneIssue
        ? "Media unavailable"
        : cameraIssue
          ? "Camera unavailable"
          : "Microphone unavailable";
    emptyState = localPlaceholderIssue;
  } else if (
    participant === "local" &&
    !isConnecting &&
    publication &&
    (publication.isMuted || !isCameraEnabled)
  ) {
    statusLabel = "Camera off";
    emptyState = "Your camera is off. Allow camera access, then try again.";
  } else if (
    participant === "local" &&
    !isConnecting &&
    (!publication || !hasCameraTrack)
  ) {
    statusLabel = "Connecting video";
    emptyState = "Connecting your camera\u2026";
  } else if (participant === "remote" && !isConnecting && !remoteParticipant) {
    statusLabel = state.remoteParticipantHasJoined ? "Disconnected" : "Waiting";
    emptyState = state.remoteParticipantHasJoined
      ? "Your match left the room. They can rejoin from their Vibe Check link."
      : "Your match hasn\u2019t joined yet.";
  } else if (
    participant === "remote" &&
    remoteParticipant &&
    !publication &&
    !remotePublicationWaitElapsed
  ) {
    statusLabel = "Connecting video";
    emptyState = "Your match is connected. Their video is still connecting\u2026";
  } else if (
    participant === "remote" &&
    remoteParticipant &&
    (!publication || publication.isMuted || !remoteParticipant.isCameraEnabled)
  ) {
    statusLabel = "Camera off";
    emptyState = "Your match is connected, but their camera is off.";
  } else if (
    participant === "remote" &&
    remoteParticipant &&
    !hasCameraTrack
  ) {
    statusLabel = "Connecting video";
    emptyState = "Your match is connected. Their video is still connecting\u2026";
  } else if (state.phase === "connected") {
    statusLabel = "Connected";
  }

  const mediaMessage =
    participant !== "local"
      ? null
      : microphoneIssue
        ? microphoneIssue
        : microphonePublication?.isMuted ||
            (microphonePublication && !isMicrophoneEnabled)
          ? "Your microphone is off. Allow microphone access so your match can hear you."
          : state.phase === "connected" && !microphonePublication
            ? "Connecting your microphone\u2026"
            : null;

  return (
    <div
      aria-label={
        participant === "local" ? "Your LiveKit video" : "Your match video"
      }
      className="relative min-h-36 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#20271f] text-white shadow-xl sm:min-h-44 md:rounded-[1.5rem] lg:min-h-72"
    >
      {trackReference && shouldRenderCameraTrack ? (
        <div
          className={cn(
            "absolute inset-0 transition duration-500",
            participant === "local" && "-scale-x-100",
            isSoftened && "scale-105 blur-sm opacity-75",
          )}
        >
          <VideoTrack
            trackRef={trackReference}
            muted={participant === "local"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#3d493a_0%,#20271f_62%)] px-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e2e8dc] text-lg font-semibold text-[#241c17]">
            {participant === "local" ? "Y" : "M"}
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/80">
            {emptyState}
          </p>
          {canRetryMedia ? (
            <button
              type="button"
              onClick={state.retry}
              className="rounded-2xl bg-[#e8ded0] px-4 py-2 text-xs font-semibold text-[#241c17] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/40"
            >
              Try again
            </button>
          ) : null}
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60",
          isSoftened && "bg-black/15",
        )}
      />

      <span className="absolute right-3 top-3 z-30 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
        {statusLabel}
      </span>

      {shouldRenderCameraTrack && state.phase === "reconnecting" ? (
        <div
          aria-live="polite"
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-5 text-center text-sm leading-6 text-white backdrop-blur-sm"
        >
          Your connection was interrupted. We’re reconnecting you.
        </div>
      ) : null}

      {shouldRenderCameraTrack ? (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-black/45 px-3 py-2 text-center text-xs leading-5 text-white/90 backdrop-blur">
          {mediaMessage ?? helperText}
          {canRetryMedia && mediaMessage ? (
            <button
              type="button"
              onClick={state.retry}
              className="ml-2 font-semibold underline underline-offset-2 focus-visible:outline-none"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
