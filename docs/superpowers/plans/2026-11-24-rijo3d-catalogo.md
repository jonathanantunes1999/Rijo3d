# Catálogo Rijo3d (revisão) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Trocar a galeria genérica por um catálogo de peças com ligação à Etsy e pedido à medida, e rever a identidade visual (violeta e azul sobre preto).

**Architecture:** Mesmo site estático. `data/pecas.js` é a única fonte das peças; `js/pecas.js` desenha os cartões e o lightbox com várias imagens; o botão "Pedir à medida" preenche o campo `peca` do formulário.

**Tech Stack:** HTML, CSS, JS (ES modules), Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-rijo3d-site-design.md` (secção Revisão 2026-11-24)

## Global Constraints
- As Global Constraints do plano `2026-11-24-rijo3d-site.md` continuam a valer (pt-PT, sem build, `TODO-CLIENTE` para o que falta, nada inventado).
- Preços e tamanhos só os que estão na Etsy: Goku SSJ4 229,99 €; Homem-Aranha 179,99 € (15 cm de largura, 40 cm de altura); Blade 1/6 (40 cm) 299,99 €; Orochimaru 1/6 (40 cm) 299,99 €; Kokushibo 1/6 (40 cm) 249,99 €. Material: resina, pintado à mão.
- Link da loja: `https://www.etsy.com/pt/shop/Rijo3D` (sem parâmetros de rastreio). Só o Homem-Aranha tem ligação própria conhecida: `https://www.etsy.com/pt/listing/4614267229/spider-man-action-figure-3d-printed`; as outras usam a loja com `TODO-CLIENTE`.

## Review Focus
1. Peça sem `etsyUrl` ou sem imagens: cartão não parte e sem erro na consola.
2. Lista de peças vazia: mensagem em vez de secção vazia.
3. Preço e nome longos a 320 px: sem scroll horizontal.
4. Pedir à medida com nome com aspas ou `&`: chega ao campo sem partir o HTML (texto, não HTML).
5. Sem JavaScript: os cartões aparecem (noscript) com link para a Etsy e o formulário funciona.

### Task 8: Dados e cartões de peça
**Files:** Create `data/pecas.js`, `js/pecas.js`, `tests/pecas.spec.js`; Delete `data/galeria.js`, `js/gallery.js`, `images/galeria/`, `tests/gallery.spec.js`; Modify `index.html`, `js/main.js`, `css/styles.css`.
**Interfaces:** Produces `export const PECAS: Array<{id:string, nome:string, detalhe:string, preco:string, etsyUrl:string, cor:string, imagens:Array<{src:string, alt:string}>}>` e `export function renderPecas(container: HTMLElement, pecas: typeof PECAS): void`. Cada cartão é `article.peca` com `a[data-acao="etsy"]` e `a[data-acao="medida"]`.
- [ ] Testes que falham (carrinho: um `article.peca` por peça; botão Etsy com `target=_blank rel="noopener"`; preço e nome visíveis; lista vazia; `etsyUrl` em falta usa o link da loja; imagens com alt, lazy e a carregar).
- [ ] Implementar e correr.
- [ ] Commit.

### Task 9: Lightbox com várias imagens
**Files:** Modify `js/pecas.js`, `css/styles.css`, `tests/pecas.spec.js`.
- [ ] Testes: abre ao clicar na imagem; Esc e clique fora fecham e devolvem o foco; com 2+ imagens aparecem anterior/seguinte e setas do teclado funcionam; com 1 imagem não aparecem.
- [ ] Implementar e correr. Commit.

### Task 10: Pedir à medida
**Files:** Modify `index.html`, `js/main.js`, `tests/form.spec.js`.
- [ ] Testes: campo `#peca` (texto, opcional); clicar "Pedir à medida" faz scroll ao formulário e preenche `#peca` com o nome exato, mesmo com `"` e `&`; o valor chega ao corpo do pedido.
- [ ] Implementar e correr. Commit.

### Task 11: Identidade, hero e textos
**Files:** Modify `index.html`, `css/styles.css`, `tests/smoke.spec.js`, `tests/quality.spec.js`, `README.md`.
- [ ] Testes: secções passam a `inicio, pecas, sobre, encomendas, contactos`; confiança (Pintado à mão, Envio de Portugal) visível; link do Instagram presente; contraste do novo destaque verificado.
- [ ] Implementar (tokens violeta/azul, hero com peça em destaque, Quem somos com o texto da cliente), atualizar README. Correr tudo. Commit e push.
