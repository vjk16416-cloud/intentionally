import { DemoPageShell, DemoProfileDetail } from "../demo-ui";

export default function DemoProfilePage() {
  return (
    <DemoPageShell
      eyebrow="Profile"
      title="Mutual match created."
      description="After a mutual like, one person sends a Vibe Check invite. Chat is still locked."
    >
      <DemoProfileDetail />
    </DemoPageShell>
  );
}
