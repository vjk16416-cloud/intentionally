import "server-only";

import { FROM_EMAIL, resend } from "./client";

// London-time formatting per the §2 GMT/BST constraint.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  hour: "numeric",
  minute: "2-digit",
  day: "numeric",
  month: "long",
  hour12: true,
  timeZone: "Europe/London",
});

type QaScheduledParams = {
  to: string;
  otherName: string;
  scheduledAt: Date;
  joinUrl: string;
  questions: { id: string; text: string }[];
};

// PLACEHOLDER COPY — founder to refine. Same convention as bio
// prompts and the Q&A questions. Plain-text only for 5a; HTML
// templating waits for either Step 5b/beta when we have a
// verified domain in Resend and React Email components.
export async function sendQaScheduledEmail({
  to,
  otherName,
  scheduledAt,
  joinUrl,
  questions,
}: QaScheduledParams): Promise<void> {
  const when = dateFormatter.format(scheduledAt);
  const questionsList = questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Q&A with ${otherName} is on`,
    text: `Your Q&A with ${otherName} is scheduled for ${when}.

Three questions to start you off:
${questionsList}

Join here: ${joinUrl}

The call is 10 minutes. Whoever isn't speaking is gently blurred. At the end, you both decide privately if you want to keep talking.`,
  });
}
