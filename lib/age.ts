// Compute the user's age, in whole years, from a YYYY-MM-DD date of
// birth string. Used by the onboarding review summary and the
// discover feed cards.
export function computeAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
