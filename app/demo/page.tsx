import type { Metadata } from "next";

import { DemoIndex, DemoPageShell } from "./demo-ui";

export const metadata: Metadata = {
  title: "Demo mode | Intentionally",
  description: "Safe mock-data product journey for Intentionally.",
};

export default function DemoPage() {
  return (
    <DemoPageShell
      eyebrow="Public demo"
      title="Review the Intentionally journey without login."
      description="This public demo uses mock data only. It does not use Supabase auth, real profiles, real matches, real messages, or real founder data."
    >
      <DemoIndex />
    </DemoPageShell>
  );
}
