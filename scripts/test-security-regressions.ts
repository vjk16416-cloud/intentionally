import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const feed = source("lib/discover/feed.ts");
const profileCard = source("app/(app)/discover/profile-card.tsx");
const deck = source("app/(app)/discover/deck.tsx");

const discoverCardType = feed.match(/export type DiscoverCard = \{([\s\S]*?)\n\};/)?.[1] ?? "";

assert.match(discoverCardType, /\bage:\s*number;/, "DiscoverCard must expose derived age");
assert.doesNotMatch(
  discoverCardType,
  /date_of_birth/,
  "DiscoverCard must never expose exact date of birth to the client",
);
assert.doesNotMatch(profileCard, /card\.date_of_birth/, "ProfileCard must use card.age");
assert.doesNotMatch(deck, /card\.date_of_birth/, "DiscoverDeck must use card.age");
assert.doesNotMatch(feed, /\.getPublicUrl\(/, "Discover must not emit public profile-photo URLs");
assert.match(feed, /\.createSignedUrl\(/, "Discover must issue signed profile-photo URLs");

console.log("Security regression checks passed.");
