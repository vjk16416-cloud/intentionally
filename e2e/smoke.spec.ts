import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/Intentionally/i);
});

test('login page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page).toHaveURL(/login/);
});

test('availability page redirects to login when logged out', async ({ page }) => {
  await page.goto('http://localhost:3000/onboarding/availability');
  await expect(page).toHaveURL(/login/);
});
