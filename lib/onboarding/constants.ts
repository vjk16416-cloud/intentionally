// Bio prompts and UK markets used during onboarding.
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

// MARKETS: UK cities open to signup, in display order.
//
// London is the primary wedge / density focus and keeps its full
// neighbourhood list (matching is geographically tight there). Other
// UK cities are open-for-signup but NOT yet seeded markets — they
// exist so users from other UK cities aren't turned away at the door,
// not because we expect an active match pool there yet. London is
// where we'll deliberately seed users until the wedge metrics in §1
// are hit.
//
// Neighbourhood lists for non-London cities are intentionally short
// (~3–6 picks). Where they aren't worth enumerating, the city itself
// is the only entry. Editable later; pick what's familiar.
//
// UK-only on purpose: keeps us inside the GBP / GMT / English-only
// constraint in §2. International markets come AFTER the wedge proves
// out, not before.

export const MARKETS = [
  {
    city: "London",
    neighbourhoods: [
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
    ],
  },
  {
    city: "Manchester",
    neighbourhoods: [
      "Ancoats",
      "Castlefield",
      "Chorlton",
      "Didsbury",
      "Northern Quarter",
      "Salford",
    ],
  },
  {
    city: "Birmingham",
    neighbourhoods: [
      "Digbeth",
      "Edgbaston",
      "Jewellery Quarter",
      "Moseley",
      "Selly Oak",
    ],
  },
  {
    city: "Leeds",
    neighbourhoods: [
      "Chapel Allerton",
      "City Centre",
      "Headingley",
      "Hyde Park",
      "Roundhay",
    ],
  },
  {
    city: "Glasgow",
    neighbourhoods: [
      "Dennistoun",
      "Finnieston",
      "Merchant City",
      "Southside",
      "West End",
    ],
  },
  {
    city: "Edinburgh",
    neighbourhoods: [
      "Bruntsfield",
      "Leith",
      "Marchmont",
      "New Town",
      "Old Town",
      "Stockbridge",
    ],
  },
  {
    city: "Liverpool",
    neighbourhoods: [
      "Aigburth",
      "Baltic Triangle",
      "City Centre",
      "Georgian Quarter",
      "Sefton Park",
    ],
  },
  {
    city: "Bristol",
    neighbourhoods: [
      "Bedminster",
      "Clifton",
      "Montpelier",
      "Redland",
      "Southville",
      "Stokes Croft",
    ],
  },
  {
    city: "Sheffield",
    neighbourhoods: [
      "Broomhill",
      "City Centre",
      "Crookes",
      "Kelham Island",
      "Nether Edge",
    ],
  },
  {
    city: "Newcastle",
    neighbourhoods: [
      "City Centre",
      "Gosforth",
      "Heaton",
      "Jesmond",
      "Ouseburn",
    ],
  },
  {
    city: "Nottingham",
    neighbourhoods: [
      "City Centre",
      "Hockley",
      "Lace Market",
      "Sherwood",
      "West Bridgford",
    ],
  },
  {
    city: "Cardiff",
    neighbourhoods: [
      "Cardiff Bay",
      "Cathays",
      "City Centre",
      "Pontcanna",
      "Roath",
    ],
  },
  {
    city: "Belfast",
    neighbourhoods: [
      "Cathedral Quarter",
      "Linen Quarter",
      "Queen's Quarter",
      "Stranmillis",
      "Titanic Quarter",
    ],
  },
  {
    city: "Brighton",
    neighbourhoods: [
      "Hanover",
      "Hove",
      "Kemptown",
      "North Laine",
      "Seven Dials",
    ],
  },
  {
    city: "Leicester",
    neighbourhoods: ["City Centre", "Clarendon Park", "Stoneygate"],
  },
  {
    city: "Southampton",
    neighbourhoods: ["Bedford Place", "City Centre", "Portswood"],
  },
  {
    city: "Reading",
    neighbourhoods: ["Reading"],
  },
  {
    city: "Cambridge",
    neighbourhoods: ["City Centre", "Mill Road", "Newnham"],
  },
  {
    city: "Oxford",
    neighbourhoods: [
      "City Centre",
      "Cowley",
      "Headington",
      "Jericho",
      "Summertown",
    ],
  },
  {
    city: "York",
    neighbourhoods: ["Acomb", "Bishopthorpe", "City Centre", "Heslington"],
  },
] as const;

export type MarketCity = (typeof MARKETS)[number]["city"];

export const MARKET_CITIES: readonly string[] = MARKETS.map((m) => m.city);

export function getNeighbourhoodsFor(city: string): readonly string[] {
  return MARKETS.find((m) => m.city === city)?.neighbourhoods ?? [];
}

export function isValidMarket(city: string, neighbourhood: string): boolean {
  return getNeighbourhoodsFor(city).includes(neighbourhood);
}
