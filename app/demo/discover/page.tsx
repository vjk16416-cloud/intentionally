import { DemoDiscover, DemoPageShell } from "../demo-ui";

export default function DemoDiscoverPage() {
  return (
    <DemoPageShell
      eyebrow="Discover"
      title="Discover intentionally."
      description="Review how a profile appears before any chat exists. Like first; a mutual like creates the match."
    >
      <DemoDiscover />
    </DemoPageShell>
  );
}
