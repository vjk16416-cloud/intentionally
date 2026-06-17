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
    label: "Open Video",
    shortLabel: "Open Video",
    copy: "Both videos are clear for this Vibe Check.",
    helper: "Only turns on when both people agree.",
    roomCopy:
      "Open Video is on. Either of you can return to Soft Reveal at any time.",
  },
  dynamic: {
    label: "Soft Reveal",
    shortLabel: "Soft Reveal",
    copy: "Only the person answering is clear.",
    helper: "The listener stays softened to reduce pressure.",
    roomCopy: "Only the person answering is clear. The listener stays softened.",
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
  void value;
  return "dynamic";
}

export function qaVisibilitySearchParam(mode: QaVisibilityMode) {
  return `visibility=${mode}`;
}
