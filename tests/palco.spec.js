import { test, expect } from '@playwright/test';

const ativo = (page) => page.locator('#inicio .palco__slide[data-ativo="true"]');

async function pecas(page) {
  return page.evaluate(async () => (await import('/data/pecas.js')).PECAS.map((p) => ({ nome: p.nome, preco: p.preco, cor: p.cor })));
}

test('palco: um slide por peça e só um ativo', async ({ page }) => {
  await page.goto('/');
  const lista = await pecas(page);
  await expect(page.locator('#inicio .palco__slide')).toHaveCount(lista.length);
  await expect(ativo(page)).toHaveCount(1);
  await expect(ativo(page).locator('img')).toHaveAttribute('alt', /.+/);
});

test('palco: seguinte e anterior mudam o ativo e dão a volta', async ({ page }) => {
  await page.goto('/');
  const lista = await pecas(page);
  const nome = () => page.locator('#inicio .hero__peca-nome').textContent();
  expect(await nome()).toBe(lista[0].nome);
  await page.locator('#inicio .palco__seguinte').click();
  expect(await nome()).toBe(lista[1].nome);
  await page.locator('#inicio .palco__anterior').click();
  await page.locator('#inicio .palco__anterior').click();
  expect(await nome()).toBe(lista[lista.length - 1].nome);
});

test('palco: pontos, um por peça, levam à peça escolhida', async ({ page }) => {
  await page.goto('/');
  const lista = await pecas(page);
  const pontos = page.locator('#inicio .palco__ponto');
  await expect(pontos).toHaveCount(lista.length);
  await pontos.nth(3).click();
  await expect(page.locator('#inicio .hero__peca-nome')).toHaveText(lista[3].nome);
  await expect(pontos.nth(3)).toHaveAttribute('aria-current', 'true');
});

test('palco: cor e informação acompanham a peça ativa', async ({ page }) => {
  await page.goto('/');
  const lista = await pecas(page);
  await page.locator('#inicio .palco__seguinte').click();
  await expect(page.locator('#inicio .hero__peca-preco')).toHaveText(lista[1].preco);
  const cor = await page.locator('#inicio').evaluate((el) => el.style.getPropertyValue('--cor-palco').trim());
  expect(cor).toBe(lista[1].cor);
  await expect(page.locator('#inicio .hero__peca a[href="#pecas"]')).toBeVisible();
});

test('palco: avança sozinho a cada 6 s', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const lista = await pecas(page);
  await page.clock.runFor(6200);
  await expect(page.locator('#inicio .hero__peca-nome')).toHaveText(lista[1].nome);
  await page.clock.runFor(6000);
  await expect(page.locator('#inicio .hero__peca-nome')).toHaveText(lista[2].nome);
});

test('palco: botão de pausa e rato por cima param o avanço', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const lista = await pecas(page);
  const pausa = page.locator('#inicio .palco__pausa');
  await pausa.click();
  await expect(pausa).toHaveAttribute('aria-pressed', 'true');
  await page.clock.runFor(20000);
  await expect(page.locator('#inicio .hero__peca-nome')).toHaveText(lista[0].nome);
  await pausa.click();
  await expect(pausa).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#inicio .palco').hover();
  await page.clock.runFor(20000);
  await expect(page.locator('#inicio .hero__peca-nome')).toHaveText(lista[0].nome);
});

test('palco: com reduzir movimento não avança sozinho e começa em pausa', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  const lista = await pecas(page);
  await page.clock.runFor(30000);
  await expect(page.locator('#inicio .hero__peca-nome')).toHaveText(lista[0].nome);
  await expect(page.locator('#inicio .palco__pausa')).toHaveAttribute('aria-pressed', 'true');
});

test('palco: só a primeira imagem é carregada logo; as outras são lazy', async ({ page }) => {
  await page.goto('/');
  const modos = await page.locator('#inicio .palco__slide img').evaluateAll((is) => is.map((i) => i.getAttribute('loading')));
  expect(modos.length).toBeGreaterThanOrEqual(2);
  expect(modos[0]).not.toBe('lazy');
  for (const m of modos.slice(1)) expect(m).toBe('lazy');
});

test('palco: sem JavaScript mostra a imagem estática com alt', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4173' });
  const page = await ctx.newPage();
  await page.goto('/');
  const img = page.locator('#inicio .palco img');
  await expect(img).toHaveCount(1);
  await expect(img).toHaveAttribute('alt', /.+/);
  await ctx.close();
});

for (const largura of [320, 375, 768, 1280]) {
  test(`palco: sem scroll horizontal a ${largura}px com o efeito ativo`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto('/');
    await page.locator('#inicio .palco__seguinte').click();
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(inner);
  });
}
