import { DemoDiscover, DemoPageShell } from "../demo-ui";

export default function DemoDiscoverPage() {
  return (
    <DemoPageShell
      eyebrow="Discover"
      title="Discover intentionally."
      description="Review how a profile appears before any chat exists. The next step is a mutual Guided Vibe Check, not a cold opener."
    >
      <DemoDiscover />
    </DemoPageShell>
  );
}
