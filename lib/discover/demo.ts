import type { DiscoverCard } from "@/lib/discover/feed";

type DemoGroup = "woman" | "man" | "non-binary";

const DEMO_CARDS: Record<DemoGroup, DiscoverCard[]> = {
  woman: [
    {
      id: "demo-woman-maya",
      display_name: "Maya",
      date_of_birth: "1998-04-12",
      intention: "long-term",
      bio_prompt_key: "comfort-meal",
      bio_answer:
        "My comfort meal is ramen after a long walk, followed by a film I’ve already seen too many times.",
      neighbourhood: "Stratford",
      photo_urls: [
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/women/45.jpg",
        "https://randomuser.me/api/portraits/women/46.jpg",
      ],
    },
    {
      id: "demo-woman-amara",
      display_name: "Amara",
      date_of_birth: "1997-09-03",
      intention: "figuring-it-out",
      bio_prompt_key: "perfect-friday",
      bio_answer:
        "My perfect Friday night is good food, low-pressure plans and conversation that accidentally lasts for hours.",
      neighbourhood: "Ilford",
      photo_urls: [
        "https://randomuser.me/api/portraits/women/65.jpg",
        "https://randomuser.me/api/portraits/women/66.jpg",
        "https://randomuser.me/api/portraits/women/67.jpg",
      ],
    },
    {
      id: "demo-woman-priya",
      display_name: "Priya",
      date_of_birth: "1999-01-21",
      intention: "long-term",
      bio_prompt_key: "tiny-luxury",
      bio_answer:
        "A tiny luxury I’d never give up is slow coffee, clean sheets and having Sundays mostly unplanned.",
      neighbourhood: "Hackney",
      photo_urls: [
        "https://randomuser.me/api/portraits/women/32.jpg",
        "https://randomuser.me/api/portraits/women/33.jpg",
        "https://randomuser.me/api/portraits/women/34.jpg",
      ],
    },
  ],

  man: [
    {
      id: "demo-man-aaron",
      display_name: "Aaron",
      date_of_birth: "1996-06-14",
      intention: "long-term",
      bio_prompt_key: "perfect-friday",
      bio_answer:
        "My perfect Friday night is a relaxed dinner, a good playlist and no pressure to make it a big night.",
      neighbourhood: "Camden",
      photo_urls: [
        "https://randomuser.me/api/portraits/men/42.jpg",
        "https://randomuser.me/api/portraits/men/43.jpg",
        "https://randomuser.me/api/portraits/men/44.jpg",
      ],
    },
    {
      id: "demo-man-dev",
      display_name: "Dev",
      date_of_birth: "1995-02-09",
      intention: "figuring-it-out",
      bio_prompt_key: "small-rebellion",
      bio_answer:
        "I’m a quiet rebel about making time for people properly instead of pretending everyone is too busy.",
      neighbourhood: "Shoreditch",
      photo_urls: [
        "https://randomuser.me/api/portraits/men/54.jpg",
        "https://randomuser.me/api/portraits/men/55.jpg",
        "https://randomuser.me/api/portraits/men/56.jpg",
      ],
    },
    {
      id: "demo-man-ravi",
      display_name: "Ravi",
      date_of_birth: "1998-10-28",
      intention: "long-term",
      bio_prompt_key: "best-conversation",
      bio_answer:
        "The best conversation I had this year started with food recommendations and ended with life stories.",
      neighbourhood: "Bethnal Green",
      photo_urls: [
        "https://randomuser.me/api/portraits/men/71.jpg",
        "https://randomuser.me/api/portraits/men/72.jpg",
        "https://randomuser.me/api/portraits/men/73.jpg",
      ],
    },
  ],

  "non-binary": [
    {
      id: "demo-nb-rio",
      display_name: "Rio",
      date_of_birth: "1997-05-19",
      intention: "long-term",
      bio_prompt_key: "song-that-fits",
      bio_answer:
        "A song that always fits is something slow, slightly dramatic and probably best heard on a night bus.",
      neighbourhood: "Peckham",
      photo_urls: [
        "https://randomuser.me/api/portraits/women/22.jpg",
        "https://randomuser.me/api/portraits/men/22.jpg",
        "https://randomuser.me/api/portraits/women/23.jpg",
      ],
    },
    {
      id: "demo-nb-sage",
      display_name: "Sage",
      date_of_birth: "1996-12-02",
      intention: "figuring-it-out",
      bio_prompt_key: "sunday-morning",
      bio_answer:
        "A good Sunday morning is a slow start, good coffee and pretending I’m not checking my calendar.",
      neighbourhood: "London Fields",
      photo_urls: [
        "https://randomuser.me/api/portraits/men/28.jpg",
        "https://randomuser.me/api/portraits/women/28.jpg",
        "https://randomuser.me/api/portraits/men/29.jpg",
      ],
    },
    {
      id: "demo-nb-noa",
      display_name: "Noa",
      date_of_birth: "1999-03-23",
      intention: "long-term",
      bio_prompt_key: "tiny-luxury",
      bio_answer:
        "A tiny luxury I’d never give up is walking home with music on and taking the scenic route.",
      neighbourhood: "Islington",
      photo_urls: [
        "https://randomuser.me/api/portraits/women/12.jpg",
        "https://randomuser.me/api/portraits/men/12.jpg",
        "https://randomuser.me/api/portraits/women/13.jpg",
      ],
    },
  ],
};

function uniqueCards(cards: DiscoverCard[]) {
  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.id)) return false;
    seen.add(card.id);
    return true;
  });
}

export function getDemoDiscoverCards(seeking: string[] | null | undefined) {
  if (!seeking || seeking.length === 0) {
    return uniqueCards([
      ...DEMO_CARDS.woman,
      ...DEMO_CARDS.man,
      ...DEMO_CARDS["non-binary"],
    ]);
  }

  const cards = seeking.flatMap((preference) => {
    if (
      preference === "woman" ||
      preference === "man" ||
      preference === "non-binary"
    ) {
      return DEMO_CARDS[preference];
    }

    return [];
  });

  return uniqueCards(
    cards.length > 0
      ? cards
      : [...DEMO_CARDS.woman, ...DEMO_CARDS.man, ...DEMO_CARDS["non-binary"]],
  );
}
