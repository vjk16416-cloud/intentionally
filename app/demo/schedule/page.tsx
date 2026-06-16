import { DemoPageShell, DemoSchedule } from "../demo-ui";

export default function DemoSchedulePage() {
  return (
    <DemoPageShell
      eyebrow="Schedule"
      title="Schedule Vibe Check."
      description="Pick a mock time to preview the scheduling moment. No real calendar, match or Q&A session is created."
    >
      <DemoSchedule />
    </DemoPageShell>
  );
}
