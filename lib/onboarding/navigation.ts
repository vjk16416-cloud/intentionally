import { ONBOARDING_STEPS } from "./state";

// Whitelisted redirect targets that an onboarding-step server action
// will honour from a hidden `returnTo` form field. Anything else falls
// back to the action's default-next step, so a forged form post can't
// turn an action into an open redirect.
export const ONBOARDING_RETURN_TARGETS: ReadonlySet<string> = new Set<string>([
  "/onboarding/review",
]);

export function resolveNextStep(
  returnTo: string,
  defaultNext: string,
): string {
  return ONBOARDING_RETURN_TARGETS.has(returnTo) ? returnTo : defaultNext;
}

// Returns the previous step in linear onboarding order, or null for
// the first step (no Back button there).
export function getPreviousStep(currentStep: string): string | null {
  const i = (ONBOARDING_STEPS as readonly string[]).indexOf(currentStep);
  if (i <= 0) return null;
  return ONBOARDING_STEPS[i - 1];
}
