import { loadEnvConfig } from "@next/env";
import { createClient, type User } from "@supabase/supabase-js";

import { hourSlots } from "../lib/onboarding/availability";
import { BIO_PROMPTS } from "../lib/onboarding/constants";
import { PROFILE_PHOTOS_BUCKET } from "../lib/storage/photos";

loadEnvConfig(process.cwd());

const ALL_GENDERS = ["woman", "man", "non-binary"] as const;
const DEMO_AVAILABILITY_WINDOWS = [
  { day: 0, hours: [8, 9, 12, 13, 18, 19, 20, 21] },
  { day: 1, hours: [8, 9, 12, 13, 18, 19, 20, 21] },
  { day: 2, hours: [8, 9, 12, 13, 18, 19, 20, 21] },
  { day: 3, hours: [8, 9, 12, 13, 18, 19, 20, 21] },
  { day: 4, hours: [8, 9, 12, 13, 18, 19, 20, 21] },
  { day: 5, hours: [9, 10, 11, 14, 15, 16, 19, 20, 21] },
  { day: 6, hours: [9, 10, 11, 14, 15, 16, 19, 20, 21] },
] as const;

const COMMON_AVAILABILITY = Array.from(
  new Set(
    DEMO_AVAILABILITY_WINDOWS.flatMap(({ day, hours }) =>
      hours.flatMap((hour) => hourSlots(day, hour)),
    ),
  ),
).sort((a, b) => a - b);

type Gender = (typeof ALL_GENDERS)[number];
type Intention = "long-term" | "short-term" | "figuring-it-out";

type ProfileSeed = {
  slug: string;
  email: string;
  displayName: string;
  dateOfBirth: string;
  gender: Gender;
  intention: Intention;
  neighbourhood: string;
  bioAnswer: string;
};

type TestProfile = ProfileSeed & {
  photoPaths: string[];
  bioPromptKey: string;
};

type PhotoAction = {
  path: string;
  action: "exists" | "would upload" | "uploaded";
};

type BucketAction = "exists" | "would update" | "updated";

const PROFILE_SEEDS: ProfileSeed[] = [
  {
    slug: "alex",
    email: "internal-test-alex@intentionally.local",
    displayName: "Internal Test Alex",
    dateOfBirth: "1994-04-12",
    gender: "man",
    intention: "long-term",
    neighbourhood: "Islington",
    bioAnswer: "Coffee, a walk through a market, and an honest conversation.",
  },
  {
    slug: "maya",
    email: "internal-test-maya@intentionally.local",
    displayName: "Internal Test Maya",
    dateOfBirth: "1995-09-18",
    gender: "woman",
    intention: "long-term",
    neighbourhood: "Clapham",
    bioAnswer: "The kind where both people leave feeling calmer and clearer.",
  },
  {
    slug: "01",
    email: "internal-test-01@intentionally.local",
    displayName: "Daniel Brooks",
    dateOfBirth: "1993-02-21",
    gender: "man",
    intention: "long-term",
    neighbourhood: "Brixton",
    bioAnswer: "Early coffees, late walks, and someone who can laugh at a dry joke.",
  },
  {
    slug: "02",
    email: "internal-test-02@intentionally.local",
    displayName: "Priya Shah",
    dateOfBirth: "1996-07-09",
    gender: "woman",
    intention: "figuring-it-out",
    neighbourhood: "Hackney",
    bioAnswer: "A calm first chat that still leaves room for a bit of spark.",
  },
  {
    slug: "03",
    email: "internal-test-03@intentionally.local",
    displayName: "Sam Bennett",
    dateOfBirth: "1992-11-03",
    gender: "non-binary",
    intention: "short-term",
    neighbourhood: "Dalston",
    bioAnswer: "Clear intentions, kind energy, and no rush to perform.",
  },
  {
    slug: "04",
    email: "internal-test-04@intentionally.local",
    displayName: "Zara Khan",
    dateOfBirth: "1997-04-30",
    gender: "woman",
    intention: "long-term",
    neighbourhood: "Bermondsey",
    bioAnswer: "A proper conversation, a good playlist, and no half-hearted replies.",
  },
  {
    slug: "05",
    email: "internal-test-05@intentionally.local",
    displayName: "Theo Morris",
    dateOfBirth: "1991-09-14",
    gender: "man",
    intention: "figuring-it-out",
    neighbourhood: "Hammersmith",
    bioAnswer: "Someone who values honesty more than trying to sound polished.",
  },
  {
    slug: "06",
    email: "internal-test-06@intentionally.local",
    displayName: "Aisha Rahman",
    dateOfBirth: "1998-01-26",
    gender: "woman",
    intention: "long-term",
    neighbourhood: "Finsbury Park",
    bioAnswer: "An easy first meeting that still feels intentional from the start.",
  },
  {
    slug: "07",
    email: "internal-test-07@intentionally.local",
    displayName: "Miles Carter",
    dateOfBirth: "1994-10-08",
    gender: "man",
    intention: "short-term",
    neighbourhood: "Shoreditch",
    bioAnswer: "Good humour, straightforward expectations, and a decent coffee spot.",
  },
  {
    slug: "08",
    email: "internal-test-08@intentionally.local",
    displayName: "Nina Patel",
    dateOfBirth: "1996-12-19",
    gender: "woman",
    intention: "figuring-it-out",
    neighbourhood: "Camden",
    bioAnswer: "A conversation that feels like the start of something, not an interview.",
  },
  {
    slug: "09",
    email: "internal-test-09@intentionally.local",
    displayName: "Rowan Lee",
    dateOfBirth: "1993-05-11",
    gender: "non-binary",
    intention: "long-term",
    neighbourhood: "Peckham",
    bioAnswer: "Slow-building chemistry and people who can stay present.",
  },
  {
    slug: "10",
    email: "internal-test-10@intentionally.local",
    displayName: "Grace Walker",
    dateOfBirth: "1997-08-22",
    gender: "woman",
    intention: "long-term",
    neighbourhood: "Fulham",
    bioAnswer: "Honest chat, no games, and the kind of calm that makes a meeting easy.",
  },
  {
    slug: "11",
    email: "internal-test-11@intentionally.local",
    displayName: "Omar Hussain",
    dateOfBirth: "1990-03-05",
    gender: "man",
    intention: "figuring-it-out",
    neighbourhood: "Walthamstow",
    bioAnswer: "A thoughtful first conversation and a good sense of humour.",
  },
  {
    slug: "12",
    email: "internal-test-12@intentionally.local",
    displayName: "Freya Collins",
    dateOfBirth: "1995-06-27",
    gender: "woman",
    intention: "short-term",
    neighbourhood: "Southwark",
    bioAnswer: "Something warm, clear, and unforced is usually the right place to start.",
  },
  {
    slug: "13",
    email: "internal-test-13@intentionally.local",
    displayName: "Ben Turner",
    dateOfBirth: "1992-02-14",
    gender: "man",
    intention: "long-term",
    neighbourhood: "Greenwich",
    bioAnswer: "A quiet but direct conversation with someone who knows what they want.",
  },
  {
    slug: "14",
    email: "internal-test-14@intentionally.local",
    displayName: "Isla Green",
    dateOfBirth: "1998-09-01",
    gender: "woman",
    intention: "figuring-it-out",
    neighbourhood: "Bethnal Green",
    bioAnswer: "Conversation first, assumptions later, and a little patience on both sides.",
  },
  {
    slug: "15",
    email: "internal-test-15@intentionally.local",
    displayName: "Leo Foster",
    dateOfBirth: "1994-05-19",
    gender: "man",
    intention: "long-term",
    neighbourhood: "Clerkenwell",
    bioAnswer: "A proper story, not a performance, and a plan that doesn't feel rushed.",
  },
  {
    slug: "16",
    email: "internal-test-16@intentionally.local",
    displayName: "Sienna Price",
    dateOfBirth: "1996-11-07",
    gender: "woman",
    intention: "short-term",
    neighbourhood: "Hampstead",
    bioAnswer: "Kind, curious, and happy to keep things light without being vague.",
  },
  {
    slug: "17",
    email: "internal-test-17@intentionally.local",
    displayName: "Noor Ahmed",
    dateOfBirth: "1991-07-16",
    gender: "non-binary",
    intention: "long-term",
    neighbourhood: "Kensington",
    bioAnswer: "A conversation that feels safe enough to be honest in from the start.",
  },
  {
    slug: "18",
    email: "internal-test-18@intentionally.local",
    displayName: "Chloe Evans",
    dateOfBirth: "1997-12-03",
    gender: "woman",
    intention: "figuring-it-out",
    neighbourhood: "Earls Court",
    bioAnswer: "A good first question, a relaxed pace, and no pressure to over-explain.",
  },
];

const TEST_PROFILES: TestProfile[] = PROFILE_SEEDS.map((seed, index) => {
  const promptKey = BIO_PROMPTS[index % BIO_PROMPTS.length]?.key ?? "sunday-morning";
  const photoPaths = [1, 2].map((variant) => `internal-test/${seed.slug}-${variant}.svg`);

  return {
    ...seed,
    bioPromptKey: promptKey,
    photoPaths,
  };
});

const PHOTO_THEMES = [
  { bg1: "#f3eadf", bg2: "#ead6c6", accent: "#705548" },
  { bg1: "#e2ece4", bg2: "#d4e1d7", accent: "#4f6457" },
  { bg1: "#efe7db", bg2: "#dfd0bc", accent: "#6b5943" },
  { bg1: "#ebdfec", bg2: "#d8c7df", accent: "#685474" },
  { bg1: "#e6edf4", bg2: "#d4e0eb", accent: "#4d647a" },
  { bg1: "#f4e9e1", bg2: "#e7d4c7", accent: "#7b5b48" },
  { bg1: "#e1ece9", bg2: "#d0e0db", accent: "#49655f" },
  { bg1: "#f1e8d7", bg2: "#e1d2b6", accent: "#7a6742" },
  { bg1: "#eadfd8", bg2: "#d8c1b3", accent: "#715243" },
  { bg1: "#e8e4f0", bg2: "#d7d1e6", accent: "#625c7c" },
  { bg1: "#e7eff1", bg2: "#d3e2e5", accent: "#4c6a71" },
  { bg1: "#f0e8dd", bg2: "#e1d2c0", accent: "#775c46" },
  { bg1: "#e4ebdf", bg2: "#d2decb", accent: "#5c6b51" },
  { bg1: "#f2e5ea", bg2: "#e4d0d8", accent: "#745761" },
  { bg1: "#e5eef5", bg2: "#d7e5f0", accent: "#526c81" },
  { bg1: "#efe6d8", bg2: "#e0ceb2", accent: "#745c40" },
  { bg1: "#e3ebea", bg2: "#d2dfdd", accent: "#4f6964" },
  { bg1: "#f4e9da", bg2: "#e5d4ba", accent: "#7b6240" },
  { bg1: "#ece2f1", bg2: "#d9c6e2", accent: "#70567e" },
  { bg1: "#e6eef0", bg2: "#d5e0e4", accent: "#4f6970" },
] as const;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseArgs(argv: string[]) {
  const args = new Set(argv);
  const apply = args.has("--apply");
  const visible = args.has("--visible");
  const pause = args.has("--pause");

  if (visible && pause) {
    throw new Error("Use either --visible or --pause, not both.");
  }

  const paused = visible ? false : true;

  return { apply, visible, pause, paused };
}

function initialsFor(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "IT";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function placeholderSvg({
  initials,
  name,
  bg1,
  bg2,
  accent,
}: {
  initials: string;
  name: string;
  bg1: string;
  bg2: string;
  accent: string;
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600" role="img" aria-label="${name} internal test profile placeholder">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#fffaf3" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#fffaf3" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1600" fill="url(#bg)"/>
  <circle cx="600" cy="520" r="360" fill="url(#halo)"/>
  <circle cx="600" cy="560" r="210" fill="#fffaf3" opacity="0.84"/>
  <circle cx="520" cy="500" r="38" fill="${accent}" opacity="0.18"/>
  <circle cx="690" cy="615" r="54" fill="${accent}" opacity="0.16"/>
  <text x="600" y="620" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="170" font-weight="700" fill="${accent}">${initials}</text>
  <rect x="190" y="1040" width="820" height="240" rx="52" fill="#fffaf3" opacity="0.88"/>
  <text x="600" y="1128" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="${accent}">${name}</text>
  <text x="600" y="1200" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="${accent}" opacity="0.78">Internal Test</text>
</svg>`;
}

function buildPhotoContent() {
  const content: Record<string, string> = {};

  TEST_PROFILES.forEach((profile, index) => {
    const initials = initialsFor(profile.displayName);
    profile.photoPaths.forEach((path, variantIndex) => {
      const theme = PHOTO_THEMES[(index + variantIndex) % PHOTO_THEMES.length];
      content[path] = placeholderSvg({
        initials: variantIndex === 0 ? initials : initials.slice(0, 1) || initials,
        name: profile.displayName,
        bg1: theme.bg1,
        bg2: theme.bg2,
        accent: theme.accent,
      });
    });
  });

  return content;
}

const TEST_PHOTO_CONTENT = buildPhotoContent();
const DEMO_CREATED_AT_BASE = Date.now() - TEST_PROFILES.length * 60_000;

async function findUserByEmail(email: string): Promise<User | null> {
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (found) return found;
    if (data.users.length < perPage) return null;

    page += 1;
  }
}

async function photoPathExists(path: string) {
  const { data, error } = await supabase.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .download(path);

  if (error || !data) return false;
  return true;
}

async function ensureSvgAllowed(apply: boolean): Promise<BucketAction> {
  const { data, error } = await supabase.storage.getBucket(PROFILE_PHOTOS_BUCKET);

  if (error || !data) {
    throw new Error(
      `Failed to read bucket metadata for ${PROFILE_PHOTOS_BUCKET}: ${error?.message ?? "No bucket returned"}`,
    );
  }

  const allowed = data.allowed_mime_types ?? [];
  if (allowed.includes("image/svg+xml")) {
    return "exists";
  }

  if (!apply) {
    return "would update";
  }

  const nextAllowed = Array.from(new Set([...allowed, "image/svg+xml"])).sort();

  const { error: updateError } = await supabase.storage.updateBucket(
    PROFILE_PHOTOS_BUCKET,
    {
      public: data.public,
      fileSizeLimit: data.file_size_limit,
      allowedMimeTypes: nextAllowed,
    },
  );

  if (updateError) {
    throw new Error(
      `Failed to update ${PROFILE_PHOTOS_BUCKET} bucket MIME types: ${updateError.message}`,
    );
  }

  return "updated";
}

async function ensurePhotoPath(path: string, apply: boolean): Promise<PhotoAction> {
  if (await photoPathExists(path)) {
    return { path, action: "exists" };
  }

  if (!apply) {
    return { path, action: "would upload" };
  }

  const svg = TEST_PHOTO_CONTENT[path];
  if (!svg) {
    throw new Error(`No placeholder SVG configured for ${path}`);
  }

  const { error } = await supabase.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .upload(path, svg, {
      contentType: "image/svg+xml",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload ${path}: ${error.message}`);
  }

  return { path, action: "uploaded" };
}

function visibilityLabel(paused: boolean) {
  return paused ? "paused, hidden from Discover" : "visible in Discover";
}

const { apply, paused } = parseArgs(process.argv.slice(2));

const supabase = createClient(
  requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const password = requiredEnv("INTERNAL_TEST_USER_PASSWORD");

async function main() {
  console.log("Internal Discover test profile manager");
  console.log(`Mode: ${apply ? "APPLY writes" : "DRY RUN, no writes"}`);
  console.log(`Target state: ${visibilityLabel(paused)}`);
  console.log("");
  console.log(
    "Photo handling: safe labelled SVG placeholders are uploaded to the profile-photos bucket only when --apply is used.",
  );
  console.log(`Profiles managed: ${TEST_PROFILES.length}`);
  console.log("Configured paths:");
  for (const profile of TEST_PROFILES) {
    console.log(`- ${profile.displayName}: ${profile.photoPaths.join(", ")}`);
  }
  console.log("");

  const bucketAction = await ensureSvgAllowed(apply);
  console.log(
    `Bucket ${PROFILE_PHOTOS_BUCKET}: ${
      bucketAction === "exists"
        ? "already allows SVG"
        : bucketAction === "would update"
          ? "would add image/svg+xml to allowed MIME types"
          : "updated to allow image/svg+xml"
    }`,
  );
  console.log("");

  const summaries: Array<{
    email: string;
    displayName: string;
    userId: string;
    authAction: "would create" | "would update" | "created" | "updated";
    profileAction: "would upsert" | "upserted";
    paused: boolean;
    photoActions: PhotoAction[];
  }> = [];

  const totals = {
    created: 0,
    updated: 0,
    wouldCreate: 0,
    wouldUpdate: 0,
    photosUploaded: 0,
    photosExisting: 0,
    photosWouldUpload: 0,
    photosWouldExist: 0,
  };

  for (const [index, profile] of TEST_PROFILES.entries()) {
    const existingUser = await findUserByEmail(profile.email);
    const photoActions: PhotoAction[] = [];
    const createdAt = new Date(
      DEMO_CREATED_AT_BASE + (TEST_PROFILES.length - index) * 60_000,
    ).toISOString();

    for (const path of profile.photoPaths) {
      const action = await ensurePhotoPath(path, apply);
      photoActions.push(action);
      if (action.action === "uploaded") totals.photosUploaded += 1;
      if (action.action === "exists") totals.photosExisting += 1;
      if (action.action === "would upload") totals.photosWouldUpload += 1;
    }

    if (!apply) {
      if (existingUser) totals.wouldUpdate += 1;
      else totals.wouldCreate += 1;

      summaries.push({
        email: profile.email,
        displayName: profile.displayName,
        userId: existingUser?.id ?? "(would be created)",
        authAction: existingUser ? "would update" : "would create",
        profileAction: "would upsert",
        paused,
        photoActions,
      });
      continue;
    }

    let user = existingUser;
    let authAction: "created" | "updated";

    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: profile.email,
        password,
        email_confirm: true,
      });

      if (error || !data.user) {
        throw new Error(
          `Failed to create ${profile.email}: ${error?.message ?? "No user returned"}`,
        );
      }

      user = data.user;
      authAction = "created";
      totals.created += 1;
    } else {
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          email: profile.email,
          password,
          email_confirm: true,
        },
      );

      if (error || !data.user) {
        throw new Error(
          `Failed to update ${profile.email}: ${error?.message ?? "No user returned"}`,
        );
      }

      user = data.user;
      authAction = "updated";
      totals.updated += 1;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: profile.displayName,
      date_of_birth: profile.dateOfBirth,
      gender: profile.gender,
      seeking: ALL_GENDERS,
      intention: profile.intention,
      bio_prompt_key: profile.bioPromptKey,
      bio_answer: profile.bioAnswer,
      city: "London",
      neighbourhood: profile.neighbourhood,
      availability: COMMON_AVAILABILITY,
      photos: profile.photoPaths,
      id_verified: true,
      id_verified_at: new Date().toISOString(),
      paused,
      created_at: createdAt,
    });

    if (profileError) {
      throw new Error(
        `Failed to upsert profile for ${profile.email}: ${profileError.message}`,
      );
    }

    summaries.push({
      email: profile.email,
      displayName: profile.displayName,
      userId: user.id,
      authAction,
      profileAction: "upserted",
      paused,
      photoActions,
    });
  }

  console.log("Summary");
  for (const summary of summaries) {
    console.log(`- ${summary.displayName}`);
    console.log(`  Email: ${summary.email}`);
    console.log(`  Profile id: ${summary.userId}`);
    console.log(`  Auth user: ${summary.authAction}`);
    console.log(`  Profile row: ${summary.profileAction}`);
    console.log(`  Paused: ${summary.paused}`);
    console.log(`  Discover: ${visibilityLabel(summary.paused)}`);
    console.log("  Photos:");
    for (const photo of summary.photoActions) {
      console.log(`    - ${photo.path}: ${photo.action}`);
    }
  }

  console.log("");
  console.log("Totals");
  if (apply) {
    console.log(`- Profiles created: ${totals.created}`);
    console.log(`- Profiles updated: ${totals.updated}`);
    console.log(`- Photos uploaded: ${totals.photosUploaded}`);
    console.log(`- Photos already existed: ${totals.photosExisting}`);
  } else {
    console.log(`- Profiles would create: ${totals.wouldCreate}`);
    console.log(`- Profiles would update: ${totals.wouldUpdate}`);
    console.log(`- Photos would upload: ${totals.photosWouldUpload}`);
    console.log(`- Photos already existed: ${totals.photosExisting}`);
  }

  console.log("");
  if (!apply) {
    console.log("No database changes were made. Re-run with --apply to write.");
  }
  if (!paused) {
    console.log(
      "Visible profiles may appear to real beta users whose city, gender, seeking, and availability overlap.",
    );
  }
}

main().catch((error) => {
  console.error("Internal test profile management failed:");
  console.error(error);
  process.exit(1);
});
