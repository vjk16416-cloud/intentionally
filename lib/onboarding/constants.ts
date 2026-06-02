// Bio prompts and London neighbourhoods used during onboarding.
//
// THE PROMPTS ARE PLACEHOLDERS. Same caveat as §7 of AGENTS.md: the
// therapist + founder review pass should replace these with the final
// 12. Keys are stable identifiers so we can refine the displayed text
// without invalidating saved answers.

export const BIO_PROMPTS = [
  { key: "sunday-morning", text: "A good Sunday morning is…" },
  { key: "ten-out-of-ten", text: "Ten out of ten, when…" },
  { key: "weird-skill", text: "A small skill I'm weirdly proud of…" },
  { key: "small-rebellion", text: "I'm a quiet rebel about…" },
  { key: "song-that-fits", text: "A song that always fits is…" },
  { key: "comfort-meal", text: "My comfort meal is…" },
  { key: "perfect-friday", text: "My perfect Friday night looks like…" },
  { key: "best-conversation", text: "The best conversation I had this year…" },
  { key: "tiny-luxury", text: "A tiny luxury I'd never give up…" },
  { key: "neighbourhood-spot", text: "The spot in London I'd take you to…" },
  { key: "in-five-years", text: "In five years, I'd love to…" },
  { key: "two-truths", text: "Two true things about me…" },
] as const;

export type BioPromptKey = (typeof BIO_PROMPTS)[number]["key"];

export const BIO_PROMPT_KEYS: readonly string[] = BIO_PROMPTS.map((p) => p.key);

export const BIO_ANSWER_MAX = 200;

// 30 London neighbourhoods — used by the neighbourhood onboarding step
// and the discover-feed filter. Editable later; pick what's familiar.
export const LONDON_NEIGHBOURHOODS = [
  "Angel",
  "Balham",
  "Battersea",
  "Bermondsey",
  "Bethnal Green",
  "Borough",
  "Brixton",
  "Camberwell",
  "Camden",
  "Clapham",
  "Clerkenwell",
  "Crouch End",
  "Dalston",
  "Deptford",
  "Fitzrovia",
  "Hackney",
  "Hampstead",
  "Highbury",
  "Highgate",
  "Holloway",
  "Islington",
  "Kentish Town",
  "King's Cross",
  "London Fields",
  "Notting Hill",
  "Peckham",
  "Shoreditch",
  "Stoke Newington",
  "Tooting",
  "Walthamstow",
] as const;

export type LondonNeighbourhood = (typeof LONDON_NEIGHBOURHOODS)[number];

export const LONDON_NEIGHBOURHOOD_SET: ReadonlySet<string> = new Set(
  LONDON_NEIGHBOURHOODS,
);
