import { test, expect } from '@playwright/test';

const WEB3FORMS = 'https://api.web3forms.com/submit';

test('formulário tem action, método e campos obrigatórios corretos', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('#form-encomenda');
  await expect(form).toHaveAttribute('action', WEB3FORMS);
  await expect(form).toHaveAttribute('method', /post/i);
  await expect(form.locator('[name="nome"]')).toHaveAttribute('required', '');
  await expect(form.locator('[name="email"][type="email"]')).toHaveAttribute('required', '');
  await expect(form.locator('[name="descricao"]')).toHaveAttribute('required', '');
  await expect(form.locator('[name="telefone"]')).not.toHaveAttribute('required', '');
  await expect(form.locator('input[name="access_key"][type="hidden"]')).toHaveCount(1);
  await expect(form.locator('input[name="botcheck"]')).toBeHidden();
  for (const nome of ['nome', 'email', 'telefone', 'descricao']) {
    await expect(page.locator(`label[for="${nome}"]`)).toBeVisible();
  }
});

test('textoVazio trata vazio e só espaços como vazio', async ({ page }) => {
  await page.goto('/');
  const r = await page.evaluate(async () => {
    const { textoVazio } = await import('/js/main.js');
    return [textoVazio(''), textoVazio('   '), textoVazio('\n\t '), textoVazio(' a ')];
  });
  expect(r).toEqual([true, true, true, false]);
});

test('descrição só com espaços é bloqueada antes de enviar', async ({ page }) => {
  const pedidos = [];
  await page.route(WEB3FORMS, (route) => { pedidos.push(route.request().url()); route.abort(); });
  await page.goto('/');
  await page.fill('#nome', 'Ana');
  await page.fill('#email', 'ana@exemplo.pt');
  await page.fill('#descricao', '     ');
  await page.click('#form-encomenda button[type="submit"]');
  await expect(page.locator('#erro-descricao')).toBeVisible();
  await expect(page.locator('#descricao')).toHaveAttribute('aria-invalid', 'true');
  expect(pedidos).toHaveLength(0);
});

test('envio válido mostra mensagem de sucesso e envia para o Web3Forms', async ({ page }) => {
  let corpo = '';
  await page.route(WEB3FORMS, (route) => {
    corpo = route.request().postData() ?? '';
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await page.goto('/');
  await page.fill('#nome', 'Ana');
  await page.fill('#email', 'ana@exemplo.pt');
  await page.fill('#descricao', 'Quero uma peça igual à da foto 3.');
  await page.click('#form-encomenda button[type="submit"]');
  await expect(page.locator('#estado-form')).toContainText('Pedido enviado');
  expect(corpo).toContain('Quero uma peça igual');
});

test('falha de rede mostra erro e sugere WhatsApp', async ({ page }) => {
  await page.route(WEB3FORMS, (route) => route.abort());
  await page.goto('/');
  await page.fill('#nome', 'Ana');
  await page.fill('#email', 'ana@exemplo.pt');
  await page.fill('#descricao', 'Teste');
  await page.click('#form-encomenda button[type="submit"]');
  await expect(page.locator('#estado-form')).toContainText('WhatsApp');
});

test('botão de WhatsApp tem link wa.me com texto pré-preenchido codificado', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('#encomendas a[href^="https://wa.me/"]').getAttribute('href');
  const url = new URL(href);
  expect(url.searchParams.get('text')).toMatch(/encomenda/i);
});

test('sem JavaScript: validação nativa bloqueia envio vazio e o WhatsApp continua lá', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://localhost:4173' });
  const page = await ctx.newPage();
  const pedidos = [];
  await page.route(WEB3FORMS, (route) => { pedidos.push(1); route.abort(); });
  await page.goto('/');
  await page.click('#form-encomenda button[type="submit"]');
  expect(pedidos).toHaveLength(0);
  await expect(page.locator('#encomendas a[href^="https://wa.me/"]')).toHaveCount(1);
  await ctx.close();
});
