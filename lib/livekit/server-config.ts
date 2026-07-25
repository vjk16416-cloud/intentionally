import "server-only";

import { validateLiveKitConfig } from "./config";

export function getLiveKitConfig() {
  return validateLiveKitConfig({
    LIVEKIT_URL: process.env.LIVEKIT_URL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
}
