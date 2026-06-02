// Q&A question pool per §7 of AGENTS.md.
//
// THIRTY PLACEHOLDERS — therapist + founder review pending. Same
// caveat as the bio prompts: clearly marked, replace before
// real-user beta. The id is a stable identifier; refining the
// `text` later won't break saved selections.
//
// Each question is tagged with the intentions it suits. The
// selection logic in lib/qa/select.ts pulls questions that suit
// BOTH partners' intentions first, falling back to questions
// suiting either if the strict pool is too small (rare given the
// number of "all three" questions below).

export type Intention = "long-term" | "short-term" | "figuring-it-out";

export type QaQuestion = {
  id: string;
  text: string;
  intentions: readonly Intention[];
};

const ALL: readonly Intention[] = [
  "long-term",
  "short-term",
  "figuring-it-out",
];

export const QA_QUESTIONS: readonly QaQuestion[] = [
  {
    id: "q01",
    text: "What's something you used to believe strongly that you've changed your mind on?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q02",
    text: "When you imagine your life going well in two years, what's a small ordinary thing in that picture?",
    intentions: ["long-term"],
  },
  {
    id: "q03",
    text: "What's a kind of conversation you wish you had more often?",
    intentions: ALL,
  },
  {
    id: "q04",
    text: "What's a small thing that's been on your mind this week?",
    intentions: ["short-term", "figuring-it-out"],
  },
  {
    id: "q05",
    text: "What does a really good Sunday look like for you?",
    intentions: ["short-term", "figuring-it-out"],
  },
  {
    id: "q06",
    text: "What's the last thing that genuinely surprised you?",
    intentions: ALL,
  },
  {
    id: "q07",
    text: "When you're at your best, what are you doing?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q08",
    text: "What's a small ritual you can't imagine giving up?",
    intentions: ALL,
  },
  {
    id: "q09",
    text: "Who's someone you've learned a lot from recently?",
    intentions: ALL,
  },
  {
    id: "q10",
    text: "What's a piece of advice you've been carrying around lately?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q11",
    text: "What's a place in London you keep coming back to, and why?",
    intentions: ALL,
  },
  {
    id: "q12",
    text: "What kind of week would feel like a really good week?",
    intentions: ["short-term", "figuring-it-out"],
  },
  {
    id: "q13",
    text: "What's something you used to be embarrassed about that you've made peace with?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q14",
    text: "Describe a perfect first conversation — what's it like?",
    intentions: ALL,
  },
  {
    id: "q15",
    text: "What's a question you wish more people asked you?",
    intentions: ALL,
  },
  {
    id: "q16",
    text: "If your friends had to describe you in three honest words, what would they say?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q17",
    text: "What's the smallest thing that makes a day feel good?",
    intentions: ["short-term", "figuring-it-out"],
  },
  {
    id: "q18",
    text: "What's something you're working on getting better at?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q19",
    text: "What's a recent moment you wished you could pause?",
    intentions: ALL,
  },
  {
    id: "q20",
    text: "When was the last time you felt really seen by someone?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q21",
    text: "What's a kind of person you find yourself drawn to?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q22",
    text: "What's an unpopular opinion you'd defend?",
    intentions: ALL,
  },
  {
    id: "q23",
    text: "What did you learn from the last relationship that mattered?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q24",
    text: "What's an ordinary thing you secretly love?",
    intentions: ALL,
  },
  {
    id: "q25",
    text: "What do you think most people get wrong about dating?",
    intentions: ALL,
  },
  {
    id: "q26",
    text: "When do you feel most yourself?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q27",
    text: "What's something you said yes to recently that you almost said no to?",
    intentions: ["short-term", "figuring-it-out"],
  },
  {
    id: "q28",
    text: "What's a story you tell about yourself that you're not sure is true?",
    intentions: ["long-term", "figuring-it-out"],
  },
  {
    id: "q29",
    text: "What kind of attention feels good vs uncomfortable to you?",
    intentions: ALL,
  },
  {
    id: "q30",
    text: "What's the kindest thing someone's done for you lately?",
    intentions: ALL,
  },
];
