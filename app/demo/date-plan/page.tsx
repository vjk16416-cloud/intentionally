import { DemoDatePlan, DemoPageShell } from "../demo-ui";

export default function DemoDatePlanPage() {
  return (
    <DemoPageShell
      eyebrow="Date plan"
      title="Suggest a safe first date."
      description="Review public, low-pressure date suggestions after the chat has momentum."
    >
      <DemoDatePlan />
    </DemoPageShell>
  );
}
