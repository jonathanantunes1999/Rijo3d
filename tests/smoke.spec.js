import { test, expect } from '@playwright/test';

const SECOES = ['inicio', 'pecas', 'sobre', 'encomendas', 'contactos'];

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

test('hero tem h1 único e botões para #pecas e #encomendas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#inicio h1')).toBeVisible();
  await expect(page.locator('#inicio a.btn[href="#encomendas"]')).toBeVisible();
  await expect(page.locator('#inicio a.btn[href="#pecas"]')).toBeVisible();
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

test('README documenta como acrescentar uma foto', async () => {
  const { readFileSync } = await import('node:fs');
  const readme = readFileSync('README.md', 'utf-8');
  expect(readme).toContain('data/pecas.js');
  expect(readme).toContain('images/pecas');
  expect(readme).toContain('access_key');
  expect(readme).toContain('wa.me');
});

test('hero mostra confiança, imagem em destaque e identidade violeta/azul', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#inicio')).toContainText('Pintado à mão');
  await expect(page.locator('#inicio')).toContainText('Envio de Portugal');
  const img = page.locator('#inicio img').first();
  expect((await img.getAttribute('alt')).trim().length).toBeGreaterThan(0);
  expect(await img.getAttribute('loading')).not.toBe('lazy');
  expect(await img.evaluate((i) => i.decode().then(() => i.naturalWidth))).toBeGreaterThan(0);
  const destaque = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cor-destaque-a').trim().toLowerCase());
  expect(destaque).toBe('#7c3aed');
});

test('contactos incluem Instagram e Etsy; secção Quem somos usa o texto da cliente', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contactos a[href^="https://www.instagram.com/"]')).toHaveCount(1);
  await expect(page.locator('#contactos a[href^="https://www.etsy.com/pt/shop/Rijo3D"]')).toHaveCount(1);
  await expect(page.locator('#sobre')).toContainText('transformamos ideias em realidade com tecnologia, criatividade e muita paixão');
});

test('contraste AA nos pares de cores principais', async ({ page }) => {
  await page.goto('/');
  const cores = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const g = (n) => cs.getPropertyValue(n).trim();
    return { fundo: g('--cor-fundo'), superficie: g('--cor-superficie'), texto: g('--cor-texto'), suave: g('--cor-texto-suave'), a: g('--cor-destaque-a'), b: g('--cor-destaque-b'), sobre: g('--cor-sobre-destaque') };
  });
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const razao = (x, y) => { const [a, b] = [lum(x), lum(y)].sort((m, n) => n - m); return (a + 0.05) / (b + 0.05); };
  const pares = [['texto', 'fundo'], ['suave', 'fundo'], ['suave', 'superficie'], ['texto', 'superficie'], ['sobre', 'a'], ['sobre', 'b']];
  for (const [fg, bg] of pares) {
    expect(razao(cores[fg], cores[bg]), `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
  }
});
