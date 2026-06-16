import { DemoDecision, DemoPageShell } from "../demo-ui";

export default function DemoDecisionPage() {
  return (
    <DemoPageShell
      eyebrow="Continue or pass"
      title="Choose Continue or Pass privately."
      description="The decision is private. Chat unlocks if you both choose to continue."
    >
      <DemoDecision />
    </DemoPageShell>
  );
}
