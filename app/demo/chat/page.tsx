import { DemoChat, DemoPageShell } from "../demo-ui";

export default function DemoChatPage() {
  return (
    <DemoPageShell
      eyebrow="Chat"
      title="Chat unlocks after mutual Continue."
      description="Review the unlocked chat surface with local mock messages only."
    >
      <DemoChat />
    </DemoPageShell>
  );
}
