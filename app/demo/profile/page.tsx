import { DemoPageShell, DemoProfileDetail } from "../demo-ui";

export default function DemoProfilePage() {
  return (
    <DemoPageShell
      eyebrow="Profile"
      title="A profile with enough context to choose carefully."
      description="This mock profile shows the trust cues, prompt answer and intent that help reviewers understand the flow."
    >
      <DemoProfileDetail />
    </DemoPageShell>
  );
}
