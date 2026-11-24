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

for (const largura of [320, 375, 768, 1280]) {
  test(`sem scroll horizontal a ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto('/');
    const { scroll, inner } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      inner: window.innerWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(inner);
  });
}

test('hero tem h1 único e botões para #galeria e #encomendas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#inicio h1')).toBeVisible();
  await expect(page.locator('#inicio a.btn[href="#encomendas"]')).toBeVisible();
  await expect(page.locator('#inicio a.btn[href="#galeria"]')).toBeVisible();
});

test('menu em mobile abre e fecha com aria-expanded', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const botao = page.locator('button.menu-toggle');
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
  await botao.click();
  await expect(botao).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('nav[aria-label="Principal"] a').first()).toBeVisible();
  await botao.click();
  await expect(botao).toHaveAttribute('aria-expanded', 'false');
});

test('contactos usam links válidos e Quem somos tem pelo menos 2 parágrafos', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contactos a[href^="mailto:"]')).toHaveCount(1);
  await expect(page.locator('#contactos a[href^="tel:"]')).toHaveCount(1);
  await expect(page.locator('#contactos a[href^="https://wa.me/"]')).toHaveCount(1);
  expect(await page.locator('#sobre p').count()).toBeGreaterThanOrEqual(2);
  await expect(page.locator('#sobre h2')).toBeVisible();
  await expect(page.locator('#contactos h2')).toBeVisible();
});

test('todos os links de WhatsApp usam o mesmo número', async ({ page }) => {
  await page.goto('/');
  const numeros = await page.locator('a[href^="https://wa.me/"]').evaluateAll((as) =>
    [...new Set(as.map((a) => new URL(a.href).pathname))]);
  expect(numeros.length).toBe(1);
});
