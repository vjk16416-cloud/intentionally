export const DATE_PLAN_OPTIONS = [
  {
    key: "coffee-first",
    title: "Coffee first",
    place: "WatchHouse, Shoreditch",
    time: "Saturday, 2:30pm",
    reason: "Public, relaxed and easy to keep short if needed.",
  },
  {
    key: "walk-and-pastries",
    title: "Walk and pastries",
    place: "Victoria Park",
    time: "Sunday, 11:00am",
    reason: "Low-pressure setting with space to talk naturally.",
  },
  {
    key: "casual-food",
    title: "Casual food",
    place: "Dishoom, Shoreditch",
    time: "Friday, 7:00pm",
    reason: "Public venue, lively atmosphere and easy transport nearby.",
  },
] as const;

export type DatePlanKey = (typeof DATE_PLAN_OPTIONS)[number]["key"];

export function getDatePlanOption(key: string | null | undefined) {
  return DATE_PLAN_OPTIONS.find((option) => option.key === key) ?? null;
}

export function isDatePlanKey(value: string): value is DatePlanKey {
  return DATE_PLAN_OPTIONS.some((option) => option.key === value);
}
