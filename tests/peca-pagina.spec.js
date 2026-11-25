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

async function geometria(page) {
  return page.locator('.galeria-peca__principal').evaluate((b) => {
    const img = b.querySelector('img');
    const r = b.getBoundingClientRect();
    const escala = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    return { x: r.x, y: r.y, w: r.width, h: r.height, rw: img.naturalWidth * escala };
  });
}

test('lupa: aparece ao passar o rato na foto e segue o cursor', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/peca.html?id=blade');
  const lupa = page.locator('.galeria-peca__lupa');
  await expect(lupa).toBeHidden();
  const g = await geometria(page);
  await page.mouse.move(g.x + g.w / 2, g.y + g.h / 2);
  await expect(lupa).toBeVisible();
  const caixa = await lupa.boundingBox();
  expect(Math.abs(caixa.x + caixa.width / 2 - (g.x + g.w / 2))).toBeLessThanOrEqual(2);
  expect(Math.abs(caixa.y + caixa.height / 2 - (g.y + g.h / 2))).toBeLessThanOrEqual(2);
  await page.mouse.move(g.x + g.w / 2 + 60, g.y + g.h / 2 + 40);
  const caixa2 = await lupa.boundingBox();
  expect(Math.round(caixa2.x - caixa.x)).toBe(60);
  expect(Math.round(caixa2.y - caixa.y)).toBe(40);
  await page.mouse.move(2, 2);
  await expect(lupa).toBeHidden();
});

test('lupa: mostra a zona certa ampliada (centro e deslocação)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/peca.html?id=homem-aranha');
  const g = await geometria(page);
  await page.mouse.move(g.x + g.w / 2, g.y + g.h / 2);
  const lupa = page.locator('.galeria-peca__lupa');
  const ler = () => lupa.evaluate((l) => {
    const cs = getComputedStyle(l);
    const [bw] = cs.backgroundSize.split(' ').map(parseFloat);
    const [px, py] = cs.backgroundPosition.split(' ').map(parseFloat);
    return { bw, px, py, L: l.offsetWidth, img: cs.backgroundImage };
  });
  const a = await ler();
  expect(a.img).toContain('homem-aranha-1.webp');
  const Z = a.bw / g.rw;
  expect(Z).toBeGreaterThan(1.4);
  expect(Math.abs(a.px - (a.L - a.bw) / 2)).toBeLessThanOrEqual(2);
  await page.mouse.move(g.x + g.w / 2 + 50, g.y + g.h / 2);
  const b = await ler();
  expect(Math.abs((b.px - a.px) - -50 * Z)).toBeLessThanOrEqual(2);
});

test('lupa: troca de imagem com a galeria e esconde-se ao clicar para ampliar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await montar(page);
  let g = await geometria(page);
  await page.mouse.move(g.x + g.w / 2, g.y + g.h / 2);
  expect(await page.locator('.galeria-peca__lupa').evaluate((l) => getComputedStyle(l).backgroundImage)).toContain('blade-1.webp');
  await page.locator('.galeria-peca__seguinte').click();
  await page.mouse.move(g.x + g.w / 2 + 5, g.y + g.h / 2);
  expect(await page.locator('.galeria-peca__lupa').evaluate((l) => getComputedStyle(l).backgroundImage)).toContain('goku-ssj4-1.webp');
  await page.locator('.galeria-peca__principal').click();
  await expect(page.locator('dialog.lightbox')).toBeVisible();
  await expect(page.locator('.galeria-peca__lupa')).toBeHidden();
});

test('lupa: o cursor do sistema esconde-se enquanto a lupa está ativa', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/peca.html?id=blade');
  const g = await geometria(page);
  await page.mouse.move(g.x + g.w / 2, g.y + g.h / 2);
  expect(await page.locator('.galeria-peca__principal').evaluate((b) => getComputedStyle(b).cursor)).toBe('none');
  await page.mouse.move(2, 2);
  expect(await page.locator('.galeria-peca__principal').evaluate((b) => getComputedStyle(b).cursor)).toBe('zoom-in');
});

test('lupa: toque não ativa a lupa', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/peca.html?id=blade');
  await page.locator('.galeria-peca__principal').evaluate((b) => {
    const r = b.getBoundingClientRect();
    for (const tipo of ['pointerenter', 'pointermove']) {
      b.dispatchEvent(new PointerEvent(tipo, { pointerType: 'touch', clientX: r.x + 50, clientY: r.y + 50, bubbles: true }));
    }
  });
  await expect(page.locator('.galeria-peca__lupa')).toBeHidden();
});

test('lupa: fica dentro da foto junto aos bordos, sem scroll horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/peca.html?id=blade');
  const g = await geometria(page);
  await page.mouse.move(g.x + 20, g.y + 20);
  const palco = await page.locator('.galeria-peca__palco').boundingBox();
  const l = await page.locator('.galeria-peca__lupa').boundingBox();
  expect(l.x).toBeGreaterThanOrEqual(palco.x - 1);
  expect(l.y).toBeGreaterThanOrEqual(palco.y - 1);
  await page.mouse.move(g.x + g.w - 20, g.y + g.h - 20);
  const l2 = await page.locator('.galeria-peca__lupa').boundingBox();
  expect(l2.x + l2.width).toBeLessThanOrEqual(palco.x + palco.width + 1);
  expect(l2.y + l2.height).toBeLessThanOrEqual(palco.y + palco.height + 1);
  const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(inner);
});

test('Homem-Aranha tem 6 fotos, todas distintas, com alt e a carregar', async ({ page }) => {
  await page.goto('/peca.html?id=homem-aranha');
  const minis = page.locator('.galeria-peca__mini');
  await expect(minis).toHaveCount(6);
  const info = await page.evaluate(async () => {
    const { PECAS } = await import('/data/pecas.js');
    const imagens = PECAS.find((p) => p.id === 'homem-aranha').imagens;
    const resultados = await Promise.all(imagens.map(async (im) => {
      const i = new Image();
      i.src = im.src.split('/').map(encodeURIComponent).join('/');
      await i.decode().catch(() => {});
      return { src: im.src, alt: im.alt, ok: i.naturalWidth > 0, w: i.naturalWidth };
    }));
    return resultados;
  });
  expect(new Set(info.map((r) => r.src)).size).toBe(6);
  for (const r of info) {
    expect(r.ok, `não carregou: ${r.src}`).toBe(true);
    expect(r.alt.trim().length, r.src).toBeGreaterThan(10);
  }
  expect(new Set(info.map((r) => r.alt)).size).toBe(6);
});

test('Homem-Aranha: passar pelas 6 fotos com a seta chega a todas e volta à primeira', async ({ page }) => {
  await page.goto('/peca.html?id=homem-aranha');
  const principal = page.locator('.galeria-peca__principal img');
  const vistos = new Set([await principal.getAttribute('src')]);
  for (let i = 0; i < 5; i++) {
    await page.locator('.galeria-peca__seguinte').click();
    vistos.add(await principal.getAttribute('src'));
  }
  expect(vistos.size).toBe(6);
  await page.locator('.galeria-peca__seguinte').click();
  expect(await principal.getAttribute('src')).toBe([...vistos][0]);
});
