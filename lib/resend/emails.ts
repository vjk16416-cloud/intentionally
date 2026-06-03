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

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
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

type QaReminderMorningOfParams = {
  to: string;
  otherName: string;
  scheduledAt: Date;
  joinUrl: string;
};

// PLACEHOLDER COPY — founder to refine. Light "today's the day"
// nudge in the morning. No questions list — they're in the
// qa-scheduled email already; the hour-before reminder repeats
// them for last-minute prep.
export async function sendQaMorningOfEmail({
  to,
  otherName,
  scheduledAt,
  joinUrl,
}: QaReminderMorningOfParams): Promise<void> {
  const time = timeFormatter.format(scheduledAt);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Q&A with ${otherName} is today`,
    text: `Quick reminder: your Q&A with ${otherName} is today at ${time} London time.

Join here when it's time: ${joinUrl}`,
  });
}

type QaReminderHourBeforeParams = {
  to: string;
  otherName: string;
  scheduledAt: Date;
  joinUrl: string;
  questions: { id: string; text: string }[];
};

// PLACEHOLDER COPY — founder to refine. Closer to the call:
// repeat the three questions so the user can prep without digging
// back through the original email.
export async function sendQaOneHourBeforeEmail({
  to,
  otherName,
  scheduledAt,
  joinUrl,
  questions,
}: QaReminderHourBeforeParams): Promise<void> {
  const time = timeFormatter.format(scheduledAt);
  const questionsList = questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Q&A with ${otherName} starts in about an hour`,
    text: `Your Q&A with ${otherName} starts at ${time} London time — about an hour from now.

Three questions, same as before:
${questionsList}

Join here: ${joinUrl}`,
  });
}
