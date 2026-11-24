import { test, expect } from '@playwright/test';

async function totalItens(page) {
  return page.evaluate(async () => (await import('/data/galeria.js')).GALERIA.length);
}

test('renderiza tantas figuras como itens em GALERIA', async ({ page }) => {
  await page.goto('/');
  const n = await totalItens(page);
  expect(n).toBeGreaterThanOrEqual(6);
  await expect(page.locator('#galeria figure')).toHaveCount(n);
});

test('imagens têm alt não vazio, loading lazy e carregam (incl. nome com espaços e acentos)', async ({ page }) => {
  await page.goto('/');
  const resultado = await page.locator('#galeria figure img').evaluateAll(async (imgs) =>
    Promise.all(imgs.map(async (img) => {
      const lazy = img.getAttribute('loading');
      img.loading = 'eager';
      await img.decode().catch(() => {});
      return { alt: img.alt, lazy, ok: img.naturalWidth > 0, src: img.getAttribute('src') };
    })));
  for (const r of resultado) {
    expect(r.alt.trim().length, r.src).toBeGreaterThan(0);
    expect(r.lazy, r.src).toBe('lazy');
    expect(r.ok, `não carregou: ${r.src}`).toBe(true);
  }
  expect(resultado.some((r) => /[ é]/.test(decodeURIComponent(r.src)))).toBe(true);
});

test('lightbox abre, fecha com Esc e com clique fora, e devolve o foco', async ({ page }) => {
  await page.goto('/');
  const botao = page.locator('#galeria figure button').first();
  await botao.click();
  const dialogo = page.locator('dialog.lightbox');
  await expect(dialogo).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(botao).toBeFocused();

  await botao.click();
  await expect(dialogo).toBeVisible();
  await dialogo.click({ position: { x: 2, y: 2 } });
  await expect(dialogo).toBeHidden();
});

test('lista vazia mostra mensagem e não dá erros na consola', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  await page.goto('/');
  const texto = await page.evaluate(async () => {
    const { renderGaleria } = await import('/js/gallery.js');
    const alvo = document.createElement('div');
    renderGaleria(alvo, []);
    return alvo.textContent.trim();
  });
  expect(texto).toBe('Em breve, novos trabalhos aqui.');
  expect(erros).toEqual([]);
});

test('legenda muito longa a 320px não cria scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.evaluate(async () => {
    const { renderGaleria } = await import('/js/gallery.js');
    const alvo = document.querySelector('#galeria .galeria__alvo');
    renderGaleria(alvo, [{ src: 'images/galeria/exemplo-1.svg', alt: 'x', legenda: 'Palavra'.repeat(40) + ' ' + 'texto longo '.repeat(30) }]);
  });
  await page.locator('#galeria figure button').first().click();
  const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(inner);
});

test('nome de ficheiro com # ou ? é pedido com o caminho codificado', async ({ page }) => {
  const pedidos = [];
  await page.route('**/images/galeria/**', (route) => {
    const url = route.request().url();
    if (url.includes('%23') || url.includes('%3F')) {
      pedidos.push(new URL(url).pathname);
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"/>' });
    }
    return route.continue();
  });
  await page.goto('/');
  await page.evaluate(async () => {
    const { renderGaleria } = await import('/js/gallery.js');
    renderGaleria(document.querySelector('#galeria .galeria__alvo'), [
      { src: 'images/galeria/foto #1 é?.svg', alt: 'x', legenda: 'x' },
    ]);
    const img = document.querySelector('#galeria figure img');
    img.loading = 'eager';
  });
  await expect.poll(() => pedidos.length).toBeGreaterThan(0);
  expect(pedidos[0]).toBe('/images/galeria/foto%20%231%20%C3%A9%3F.svg');
});
