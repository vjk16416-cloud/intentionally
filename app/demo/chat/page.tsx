import { DemoChat, DemoPageShell } from "../demo-ui";

export default function DemoChatPage() {
  return (
    <DemoPageShell
      eyebrow="Chat"
      title="Chat unlocks after mutual Continue."
      description="Review the unlocked chat surface with local mock messages only. Chats unlock only after your Guided Vibe Check and mutual Continue."
    >
      <DemoChat />
    </DemoPageShell>
  );
}
