import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test('homepage loads', async ({ page }) => {
  await page.goto(baseUrl);
  await expect(page).toHaveTitle(/Intentionally/i);
});

test('login page loads', async ({ page }) => {
  await page.goto(`${baseUrl}/login`);
  await expect(page).toHaveURL(/login/);
});

test('protected onboarding routes redirect to login when logged out', async ({ page }) => {
  const protectedRoutes = [
    '/onboarding',
    '/onboarding/phone',
    '/onboarding/identity',
    '/onboarding/intention',
    '/onboarding/neighbourhood',
    '/onboarding/availability',
    '/onboarding/photos',
    '/onboarding/profile',
    '/onboarding/prompt',
    '/onboarding/trusted-contact',
    '/onboarding/review',
    '/onboarding/done',
    '/discover',
    '/schedule/test-match-id',
    '/qa/test-session-id',
    '/verify',
    '/verify/return'
  ];

  for (const route of protectedRoutes) {
    await page.goto(`${baseUrl}${route}`);
    await expect(page).toHaveURL(/login/);
  }
});

test('demo chat page is reachable or redirects safely', async ({ page }) => {
  await page.goto(`${baseUrl}/chat/demo-demo-match`);
  await expect(page).not.toHaveURL(/_not-found/);
});

test('demo date plan page is reachable or redirects safely', async ({ page }) => {
  await page.goto(`${baseUrl}/date-plan/demo-demo-match`);
  await expect(page).not.toHaveURL(/_not-found/);
});