import { test, expect } from '@playwright/test';

const SECOES = ['inicio', 'galeria', 'sobre', 'encomendas', 'contactos'];

test('página tem as 5 secções e navegação', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
  for (const id of SECOES) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  const hrefs = await page.locator('nav[aria-label="Principal"] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThanOrEqual(4);
  for (const h of hrefs) {
    expect(SECOES).toContain(h.replace('#', ''));
  }
});
