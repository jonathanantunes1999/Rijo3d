import { test, expect } from '@playwright/test';

const LOJA = 'https://www.etsy.com/pt/shop/Rijo3D';

async function carregar(page) {
  await page.goto('/');
  return page.evaluate(async () => (await import('/data/pecas.js')).PECAS.length);
}

test('um cartão por peça, com nome e preço visíveis', async ({ page }) => {
  const n = await carregar(page);
  expect(n).toBe(5);
  await expect(page.locator('#pecas article.peca')).toHaveCount(n);
  const cartoes = page.locator('#pecas article.peca');
  for (let i = 0; i < n; i++) {
    await expect(cartoes.nth(i).locator('h3')).toBeVisible();
    await expect(cartoes.nth(i).locator('.peca__preco')).toContainText('€');
  }
});

test('botão Etsy abre noutro separador com rel noopener; botão à medida existe', async ({ page }) => {
  await carregar(page);
  const etsy = page.locator('#pecas article.peca a[data-acao="etsy"]');
  const n = await etsy.count();
  expect(n).toBe(5);
  for (let i = 0; i < n; i++) {
    await expect(etsy.nth(i)).toHaveAttribute('target', '_blank');
    await expect(etsy.nth(i)).toHaveAttribute('rel', /noopener/);
    await expect(etsy.nth(i)).toHaveAttribute('href', /^https:\/\/www\.etsy\.com\/pt\//);
  }
  await expect(page.locator('#pecas article.peca a[data-acao="medida"]')).toHaveCount(5);
});

test('imagens têm alt, loading lazy e carregam', async ({ page }) => {
  await carregar(page);
  const r = await page.locator('#pecas article.peca img').evaluateAll(async (imgs) =>
    Promise.all(imgs.map(async (img) => {
      const lazy = img.getAttribute('loading');
      img.loading = 'eager';
      await img.decode().catch(() => {});
      return { alt: img.alt, lazy, ok: img.naturalWidth > 0, src: img.getAttribute('src') };
    })));
  expect(r.length).toBe(5);
  for (const x of r) {
    expect(x.alt.trim().length, x.src).toBeGreaterThan(0);
    expect(x.lazy, x.src).toBe('lazy');
    expect(x.ok, `não carregou: ${x.src}`).toBe(true);
  }
});

test('lista vazia mostra mensagem e não dá erros na consola', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  await page.goto('/');
  const texto = await page.evaluate(async () => {
    const { renderPecas } = await import('/js/pecas.js');
    const alvo = document.createElement('div');
    renderPecas(alvo, []);
    return alvo.textContent.trim();
  });
  expect(texto).toBe('Em breve, novas peças aqui.');
  expect(erros).toEqual([]);
});

test('peça sem etsyUrl nem imagens não parte e usa o link da loja', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  await page.goto('/');
  const href = await page.evaluate(async () => {
    const { renderPecas } = await import('/js/pecas.js');
    const alvo = document.createElement('div');
    renderPecas(alvo, [{ id: 'x', nome: 'Sem dados', detalhe: '', preco: '1,00 €', cor: '#fff', imagens: [] }]);
    return alvo.querySelector('a[data-acao="etsy"]').getAttribute('href');
  });
  expect(href).toBe(LOJA);
  expect(erros).toEqual([]);
});

test('nome e preço muito longos a 320px não criam scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await page.evaluate(async () => {
    const { renderPecas } = await import('/js/pecas.js');
    renderPecas(document.querySelector('#pecas .pecas__alvo'), [
      { id: 'l', nome: 'Palavra'.repeat(30), detalhe: 'detalhe '.repeat(30), preco: '1.234.567,89 €', cor: '#8b5cf6',
        etsyUrl: 'https://www.etsy.com/pt/shop/Rijo3D', imagens: [{ src: 'images/pecas/blade-1.webp', alt: 'x' }] },
    ]);
  });
  const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(inner);
});

test('sem JavaScript os cartões aparecem com link para a Etsy', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4173' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('#pecas article.peca')).toHaveCount(5);
  await expect(page.locator('#pecas a[href^="https://www.etsy.com/"]').first()).toBeAttached();
  await ctx.close();
});

test('noscript tem as mesmas peças que PECAS (sem deriva)', async ({ page }) => {
  await page.goto('/');
  const r = await page.evaluate(async () => {
    const { PECAS } = await import('/data/pecas.js');
    const html = document.querySelector('#pecas noscript').textContent;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      dados: PECAS.map((p) => [p.nome, p.preco, p.etsyUrl]),
      noscript: [...doc.querySelectorAll('article.peca')].map((a) => [
        a.querySelector('h3').textContent,
        a.querySelector('.peca__preco').textContent,
        a.querySelector('a[data-acao="etsy"]').getAttribute('href'),
      ]),
    };
  });
  expect(r.noscript).toEqual(r.dados);
});
