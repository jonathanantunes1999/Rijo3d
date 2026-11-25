import { test, expect } from '@playwright/test';

test('modo demo (por defeito): aparecem os exemplos sem parâmetros, marcados como exemplo', async ({ page }) => {
  await page.goto('/');
  const cartoes = page.locator('#avaliacoes .avaliacao');
  await expect(page.locator('#avaliacoes')).toBeVisible();
  await expect(cartoes).toHaveCount(4);
  const pecas = await page.evaluate(async () => (await import('/data/pecas.js')).PECAS.map((p) => p.nome));
  for (const m of await page.locator('#avaliacoes .avaliacao__peca').allTextContents()) expect(pecas).toContain(m);
  const estrelas = await cartoes.locator('.avaliacao__estrelas').evaluateAll((e) => e.map((x) => x.getAttribute('aria-label')));
  expect(new Set(estrelas).size).toBeGreaterThan(1);
  for (let i = 0; i < 4; i++) {
    await expect(cartoes.nth(i).locator('.avaliacao__exemplo')).toHaveText('Exemplo');
    await expect(cartoes.nth(i).locator('.avaliacao__estrelas')).toHaveAttribute('aria-label', /^[1-5] em 5 estrelas$/);
  }
});

test('?demo=off esconde os exemplos, e sem modo demo nem parâmetro não há exemplos', async ({ page }) => {
  await page.goto('/?demo=off');
  await expect(page.locator('#avaliacoes')).toBeHidden();
  await expect(page.locator('#avaliacoes .avaliacao')).toHaveCount(0);
  await expect(page.locator('nav[aria-label="Principal"] a[href="#avaliacoes"]')).toHaveCount(0);
  const r = await page.evaluate(async () => {
    const { avaliacoesParaMostrar } = await import('/js/avaliacoes.js');
    return {
      semNada: avaliacoesParaMostrar([], '', false).length,
      comParametro: avaliacoesParaMostrar([], '?demo=avaliacoes', false).length,
      desligado: avaliacoesParaMostrar([], '?demo=off', true).length,
      comReais: avaliacoesParaMostrar([{ nome: 'A', texto: 't', estrelas: 5 }], '', true).filter((a) => a.exemplo).length,
    };
  });
  expect(r).toEqual({ semNada: 0, comParametro: 4, desligado: 0, comReais: 0 });
});

test('o menu ganha o link Avaliações quando a secção está visível', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const link = page.locator('nav[aria-label="Principal"] a[href="#avaliacoes"]');
  await expect(link).toHaveCount(1);
  await expect(link).toHaveText('Avaliações');
  await link.click();
  await expect(page.locator('#avaliacoes')).toBeInViewport();
});

test('rodapé avisa que é versão de demonstração enquanto o modo demo está ligado', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.rodape__demo')).toHaveText('Versão de demonstração');
  await page.goto('/?demo=off');
  await expect(page.locator('.rodape__demo')).toBeHidden();
});

test('avaliações reais não têm marca de exemplo, mostram média e tratam o texto como texto', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const { renderAvaliacoes } = await import('/js/avaliacoes.js');
    renderAvaliacoes(document.getElementById('avaliacoes'), [
      { nome: 'Ana <b>R.</b>', texto: 'Muito bom & "perfeito" <i>mesmo</i>', estrelas: 5, peca: 'Blade, escala 1/6' },
      { nome: 'Rui', texto: 'Chegou bem embalado.', estrelas: 4 },
    ]);
  });
  const sec = page.locator('#avaliacoes');
  await expect(sec).toBeVisible();
  await expect(sec.locator('.avaliacao__exemplo')).toHaveCount(0);
  await expect(sec.locator('.avaliacoes__resumo')).toContainText('4,5');
  await expect(sec.locator('.avaliacoes__resumo')).toContainText('2 avaliações');
  await expect(sec.locator('.avaliacao').first()).toContainText('Ana <b>R.</b>');
  await expect(sec.locator('b, i')).toHaveCount(0);
});

test('estrelas fora de 1 a 5 são ajustadas e valor inválido não parte', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto('/');
  const rotulos = await page.evaluate(async () => {
    const { renderAvaliacoes } = await import('/js/avaliacoes.js');
    renderAvaliacoes(document.getElementById('avaliacoes'), [
      { nome: 'A', texto: 't', estrelas: 9 }, { nome: 'B', texto: 't', estrelas: 0 }, { nome: 'C', texto: 't', estrelas: 'x' },
    ]);
    return [...document.querySelectorAll('#avaliacoes .avaliacao__estrelas')].map((e) => e.getAttribute('aria-label'));
  });
  expect(rotulos).toEqual(['5 em 5 estrelas', '1 em 5 estrelas', '5 em 5 estrelas']);
  expect(erros).toEqual([]);
});

for (const l of [320, 375, 768, 1280]) {
  test(`secção de exemplo sem scroll horizontal a ${l}px`, async ({ page }) => {
    await page.setViewportSize({ width: l, height: 800 });
    await page.goto('/?demo=avaliacoes');
    await page.evaluate(async () => {
      const { renderAvaliacoes } = await import('/js/avaliacoes.js');
      renderAvaliacoes(document.getElementById('avaliacoes'), [{ nome: 'Palavra'.repeat(30), texto: 'texto '.repeat(80), estrelas: 5, peca: 'Peça'.repeat(30) }]);
    });
    const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
    expect(scroll).toBeLessThanOrEqual(inner);
  });
}
