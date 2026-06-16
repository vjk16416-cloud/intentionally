import { DATE_PLAN_OPTIONS } from "@/lib/date-plans/options";

export const demoProfile = {
  name: "Maya",
  age: 28,
  neighbourhood: "Stratford",
  intention: "Long-term, slowly built",
  photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  prompt: "My perfect Friday night is...",
  answer:
    "Good food, low-pressure plans and conversation that accidentally lasts for hours.",
  trustCues: ["Verified basics", "Guided Vibe Check first", "Private decision"],
};

export const demoProfiles = [
  demoProfile,
  {
    name: "Aaron",
    age: 29,
    neighbourhood: "Camden",
    intention: "Intentional dating",
    photoUrl: "https://randomuser.me/api/portraits/men/42.jpg",
    prompt: "A small thing that makes me feel cared for is...",
    answer: "Someone remembering the details without making a big performance of it.",
    trustCues: ["Q&A ready", "Mutual continue", "Safety-led reveal"],
  },
  {
    name: "Rio",
    age: 27,
    neighbourhood: "Peckham",
    intention: "Clarity through conversation",
    photoUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    prompt: "A song that always fits is...",
    answer: "Something slow, slightly dramatic and best heard on a night bus.",
    trustCues: ["Verified basics", "No cold openers", "Private pass"],
  },
];

export const demoSlots = [
  {
    label: "Tonight",
    time: "7:30pm",
    helper: "Best for a quick first Guided Vibe Check",
  },
  {
    label: "Tomorrow",
    time: "8:00pm",
    helper: "A calm evening slot after work",
  },
  {
    label: "Sunday",
    time: "6:30pm",
    helper: "Weekend reset conversation",
  },
];

export const demoQuestions = [
  "What helps you feel safe opening up to someone?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

export const demoMessages = [
  {
    id: 1,
    from: "maya",
    text: "That was actually a nice way to start. Less awkward than a blank chat.",
  },
  {
    id: 2,
    from: "you",
    text: "Yeah, the questions made it easier to say something real.",
  },
  {
    id: 3,
    from: "maya",
    text: "Your answer about effort being consistency was interesting.",
  },
  {
    id: 4,
    from: "you",
    text: "I meant it. Small consistent things say more than big gestures.",
  },
];

export const demoDatePlans = DATE_PLAN_OPTIONS;
