import { test, expect } from '@playwright/test';

test('metadados de SEO e partilha existem', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Rijo3d/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_PT');
});

test('todas as imagens têm atributo alt', async ({ page }) => {
  await page.goto('/');
  const semAlt = await page.locator('img:not([alt])').count();
  expect(semAlt).toBe(0);
});

test('cabeçalhos em ordem: um h1 e h2 por secção', async ({ page }) => {
  await page.goto('/');
  const niveis = await page.locator('h1, h2, h3').evaluateAll((hs) => hs.map((h) => h.tagName));
  expect(niveis[0]).toBe('H1');
  expect(niveis.filter((n) => n === 'H1')).toHaveLength(1);
  expect(niveis.filter((n) => n === 'H2').length).toBeGreaterThanOrEqual(4);
});

for (const largura of [320, 375, 768, 1280]) {
  test(`lightbox aberto a ${largura}px sem scroll horizontal`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 700 });
    await page.goto('/');
    await page.locator('#galeria figure button').first().click();
    await expect(page.locator('dialog.lightbox')).toBeVisible();
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(inner);
    const caixa = await page.locator('dialog.lightbox').boundingBox();
    expect(caixa.x).toBeGreaterThanOrEqual(0);
    expect(caixa.x + caixa.width).toBeLessThanOrEqual(largura);
  });
}

test('navegação por teclado: todos os controlos recebem foco visível', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const vistos = new Set();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { id: el.id || el.getAttribute('href') || el.name || el.tagName + el.textContent.slice(0, 12), outline: cs.outlineStyle, largura: parseFloat(cs.outlineWidth) };
    });
    if (info) {
      vistos.add(info.id);
      expect(info.outline, info.id).not.toBe('none');
      expect(info.largura, info.id).toBeGreaterThan(0);
    }
  }
  expect(vistos.size).toBeGreaterThanOrEqual(15);
});

test('prefers-reduced-motion desativa transições e scroll suave', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const r = await page.evaluate(() => ({
    transicao: getComputedStyle(document.querySelector('.btn')).transitionDuration,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(r.transicao).toBe('0s');
  expect(r.scroll).toBe('auto');
});

test('robots.txt e sitemap.xml existem', async ({ request }) => {
  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
});
