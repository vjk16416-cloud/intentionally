import { DemoPageShell, DemoVibeCheck } from "../demo-ui";

export default function DemoVibeCheckPage() {
  return (
    <DemoPageShell
      eyebrow="Guided Vibe Check"
      title="Start Guided Vibe Check."
      description="Move through sample prompts in a mock video room. This page does not request camera or microphone access."
    >
      <DemoVibeCheck />
    </DemoPageShell>
  );
}
