export const VISIBILITY_MODES = ["open", "dynamic", "audio"] as const;

export type QaVisibilityMode = (typeof VISIBILITY_MODES)[number];

export const QA_VISIBILITY_OPTIONS: Record<
  QaVisibilityMode,
  {
    label: string;
    shortLabel: string;
    copy: string;
    helper: string;
    roomCopy: string;
  }
> = {
  open: {
    label: "Open Mode",
    shortLabel: "Open",
    copy: "Be visible during the Guided Vibe Check.",
    helper: "Best if you're comfortable being seen clearly.",
    roomCopy: "Visible during the Guided Vibe Check.",
  },
  dynamic: {
    label: "Dynamic Mode",
    shortLabel: "Dynamic",
    copy: "Softens the listener while someone answers.",
    helper: "Helps the speaker feel less watched and more comfortable.",
    roomCopy:
      "The listener softens while someone answers, helping the speaker feel more comfortable.",
  },
  audio: {
    label: "Audio-first Mode",
    shortLabel: "Audio-first",
    copy: "Use voice with a profile preview.",
    helper: "You can turn your camera on when you're ready.",
    roomCopy: "Voice-first with profile preview.",
  },
};

export function parseQaVisibilityMode(
  value: string | string[] | null | undefined,
): QaVisibilityMode {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "dynamic" || raw === "audio") {
    return raw;
  }

  return "open";
}

export function qaVisibilitySearchParam(mode: QaVisibilityMode) {
  return `visibility=${mode}`;
}
