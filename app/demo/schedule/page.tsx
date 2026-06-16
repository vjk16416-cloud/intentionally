import { DemoPageShell, DemoSchedule } from "../demo-ui";

export default function DemoSchedulePage() {
  return (
    <DemoPageShell
      eyebrow="Schedule"
      title="Vibe Check invite accepted."
      description="Pick a mock time to preview scheduling after the invite is accepted. No real calendar, match or Vibe Check session is created."
    >
      <DemoSchedule />
    </DemoPageShell>
  );
}
