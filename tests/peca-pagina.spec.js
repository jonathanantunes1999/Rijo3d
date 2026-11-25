import { test, expect } from '@playwright/test';

const TRES = `{ id: 'tres', nome: 'Peça "T" & <b>três</b>', detalhe: 'Detalhe', preco: '9,99 €', cor: '#8b5cf6',
  etsyUrl: 'https://www.etsy.com/pt/shop/Rijo3D', ficha: [['Material', 'Resina']],
  imagens: [{ src: 'images/pecas/blade-1.webp', alt: 'Primeira' }, { src: 'images/pecas/goku-ssj4-1.webp', alt: 'Segunda' }, { src: 'images/pecas/kokushibo-1.webp', alt: 'Terceira' }] }`;

async function montar(page, definicao = TRES) {
  await page.goto('/peca.html?id=blade');
  await page.evaluate(async (d) => {
    const { renderPecaPagina } = await import('/js/peca-pagina.js');
    const { PECAS } = await import('/data/pecas.js');
    renderPecaPagina(document.getElementById('conteudo'), eval(`(${d})`), PECAS);
  }, definicao);
}

test('página da peça mostra nome, preço, ficha e botões', async ({ page }) => {
  await page.goto('/peca.html?id=blade');
  await expect(page.locator('h1')).toHaveText('Blade, escala 1/6');
  await expect(page.locator('.peca-pagina__preco')).toHaveText('299,99 €');
  await expect(page.locator('.ficha dt').first()).toBeVisible();
  await expect(page.locator('.ficha')).toContainText('Resina');
  await expect(page).toHaveTitle(/Blade, escala 1\/6.*Rijo3D/);
  const etsy = page.locator('a[data-acao="etsy"]');
  await expect(etsy).toHaveAttribute('target', '_blank');
  await expect(etsy).toHaveAttribute('rel', /noopener/);
  const medida = await page.locator('a[data-acao="medida"]').getAttribute('href');
  expect(medida).toBe('index.html?peca=Blade%2C%20escala%201%2F6#encomendas');
});

test('id desconhecido mostra mensagem e link para as peças, sem erros', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  await page.goto('/peca.html?id=nao-existe');
  await expect(page.locator('#conteudo')).toContainText('não encontrámos');
  await expect(page.locator('#conteudo a[href="index.html#pecas"]')).toBeVisible();
  expect(erros).toEqual([]);
});

test('galeria com 3 imagens: miniaturas, setas e teclado mudam a imagem', async ({ page }) => {
  await montar(page);
  const principal = page.locator('.galeria-peca__principal img');
  const minis = page.locator('.galeria-peca__mini');
  await expect(minis).toHaveCount(3);
  await expect(principal).toHaveAttribute('alt', 'Primeira');
  await minis.nth(2).click();
  await expect(principal).toHaveAttribute('alt', 'Terceira');
  await expect(minis.nth(2)).toHaveAttribute('aria-current', 'true');
  await page.locator('.galeria-peca__seguinte').click();
  await expect(principal).toHaveAttribute('alt', 'Primeira');
  await page.locator('.galeria-peca__anterior').click();
  await expect(principal).toHaveAttribute('alt', 'Terceira');
  await page.locator('.galeria-peca').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(principal).toHaveAttribute('alt', 'Segunda');
});

test('com 1 imagem não há miniaturas nem setas', async ({ page }) => {
  await page.goto('/peca.html?id=blade');
  await expect(page.locator('.galeria-peca__mini')).toHaveCount(0);
  await expect(page.locator('.galeria-peca__seguinte')).toBeHidden();
});

test('nome com aspas, & e HTML aparece como texto e chega ao link de pedir à medida', async ({ page }) => {
  await montar(page);
  await expect(page.locator('h1')).toHaveText('Peça "T" & <b>três</b>');
  await expect(page.locator('#conteudo h1 b')).toHaveCount(0);
  const href = await page.locator('a[data-acao="medida"]').getAttribute('href');
  expect(decodeURIComponent(href.split('?peca=')[1].split('#')[0])).toBe('Peça "T" & <b>três</b>');
});

test('zoom: clicar na imagem grande abre o lightbox, Esc fecha e o foco volta', async ({ page }) => {
  await montar(page);
  const botao = page.locator('.galeria-peca__principal');
  await botao.click();
  const dialogo = page.locator('dialog.lightbox');
  await expect(dialogo).toBeVisible();
  await expect(dialogo.locator('img')).toHaveAttribute('alt', 'Primeira');
  await page.keyboard.press('ArrowRight');
  await expect(dialogo.locator('img')).toHaveAttribute('alt', 'Segunda');
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
  await expect(botao).toBeFocused();
  await botao.click();
  await page.mouse.click(2, 2);
  await expect(dialogo).toBeHidden();
});

for (const [l, a] of [[320, 700], [375, 700], [768, 700], [1280, 700], [740, 360], [568, 320]]) {
  test(`lightbox e página a ${l}x${a}: sem scroll horizontal e controlos visíveis`, async ({ page }) => {
    await page.setViewportSize({ width: l, height: a });
    await montar(page);
    await page.locator('.galeria-peca__principal').click();
    await expect(page.locator('dialog.lightbox')).toBeVisible();
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(inner);
    for (const sel of ['.lightbox__fechar', 'figcaption', '.lightbox__seguinte']) {
      const caixa = await page.locator(`dialog.lightbox ${sel}`).boundingBox();
      expect(caixa.y, sel).toBeGreaterThanOrEqual(0);
      expect(caixa.y + caixa.height, sel).toBeLessThanOrEqual(a);
      expect(caixa.x + caixa.width, sel).toBeLessThanOrEqual(l);
    }
  });
}

test('outras peças: 4 ligações, sem a peça atual', async ({ page }) => {
  await page.goto('/peca.html?id=blade');
  const links = page.locator('.outras a');
  await expect(links).toHaveCount(4);
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).not.toContain('peca.html?id=blade');
  for (const h of hrefs) expect(h).toMatch(/^peca\.html\?id=/);
});

test('sem JavaScript a página da peça indica como voltar às peças', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4173' });
  const page = await ctx.newPage();
  await page.goto('/peca.html?id=blade');
  await expect(page.locator('#conteudo noscript, .peca-pagina__sem-js').first()).toBeAttached();
  await expect(page.locator('a[href="index.html#pecas"]').first()).toBeVisible();
  await ctx.close();
});

test('sitemap lista a página de cada peça', async ({ page, request }) => {
  await page.goto('/');
  const ids = await page.evaluate(async () => (await import('/data/pecas.js')).PECAS.map((p) => p.id));
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const id of ids) expect(xml).toContain(`peca.html?id=${id}`);
});

test('cartões do catálogo abrem a página da peça (imagem, título e botão Ver peça)', async ({ page }) => {
  await page.goto('/');
  const cartao = page.locator('#pecas article.peca').nth(2);
  for (const sel of ['.peca__imagem a', 'h3 a', 'a[data-acao="abrir"]']) {
    await expect(cartao.locator(sel)).toHaveAttribute('href', 'peca.html?id=blade');
  }
  await cartao.locator('a[data-acao="abrir"]').click();
  await expect(page).toHaveURL(/peca\.html\?id=blade$/);
  await expect(page.locator('h1')).toHaveText('Blade, escala 1/6');
});

test('pedir à medida na página abre o formulário com a peça preenchida', async ({ page }) => {
  await page.goto('/peca.html?id=orochimaru');
  await page.locator('a[data-acao="medida"]').click();
  await expect(page).toHaveURL(/index\.html\?peca=.*#encomendas$/);
  await expect(page.locator('#peca')).toHaveValue('Orochimaru, escala 1/6');
});

test('?peca= com HTML no endereço entra no campo como texto', async ({ page }) => {
  await page.goto('/?peca=' + encodeURIComponent('<i>x</i>') + '#encomendas');
  await expect(page.locator('#peca')).toHaveValue('<i>x</i>');
  await expect(page.locator('#encomendas i')).toHaveCount(0);
});
