// Exemplos só para ver o desenho (endereço ?demo=avaliacoes). Não são clientes reais.
const EXEMPLOS = [
  { nome: 'Nome do cliente', texto: 'Texto de exemplo para ver como fica uma avaliação. Aqui aparece o comentário do cliente sobre a peça.', estrelas: 5, peca: 'Nome da peça', exemplo: true },
  { nome: 'Nome do cliente', texto: 'Segundo texto de exemplo, um pouco mais curto.', estrelas: 5, peca: 'Nome da peça', exemplo: true },
  { nome: 'Nome do cliente', texto: 'Terceiro texto de exemplo. Serve só para testar o desenho dos cartões e a quebra de linhas em ecrãs pequenos.', estrelas: 4, peca: 'Nome da peça', exemplo: true },
];

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function estrelasValidas(valor) {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, n));
}

function criarEstrelas(n) {
  const e = el('p', 'avaliacao__estrelas');
  e.setAttribute('role', 'img');
  e.setAttribute('aria-label', `${n} em 5 estrelas`);
  e.append(el('span', 'avaliacao__estrelas-cheias', '★'.repeat(n)), el('span', 'avaliacao__estrelas-vazias', '★'.repeat(5 - n)));
  return e;
}

export function renderAvaliacoes(secao, lista) {
  if (!secao) return;
  if (!lista.length) {
    secao.hidden = true;
    return;
  }
  const container = el('div', 'container');
  container.append(el('h2', '', 'O que dizem os clientes'));

  const reais = lista.filter((a) => !a.exemplo);
  if (reais.length) {
    const media = reais.reduce((s, a) => s + estrelasValidas(a.estrelas), 0) / reais.length;
    const texto = `${media.toFixed(1).replace('.', ',')} em 5 · ${reais.length} ${reais.length === 1 ? 'avaliação' : 'avaliações'}`;
    container.append(el('p', 'avaliacoes__resumo', texto));
  }

  const grelha = el('div', 'avaliacoes__grelha');
  for (const a of lista) {
    const cartao = el('article', a.exemplo ? 'avaliacao avaliacao--exemplo' : 'avaliacao');
    if (a.exemplo) cartao.append(el('span', 'avaliacao__exemplo', 'Exemplo'));
    cartao.append(criarEstrelas(estrelasValidas(a.estrelas)));
    cartao.append(el('blockquote', 'avaliacao__texto', a.texto));
    const rodape = el('p', 'avaliacao__autor');
    rodape.append(el('strong', '', a.nome));
    if (a.peca) rodape.append(el('span', 'avaliacao__peca', a.peca));
    cartao.append(rodape);
    grelha.append(cartao);
  }
  container.append(grelha);
  secao.replaceChildren(container);
  secao.hidden = false;
}

export function avaliacoesParaMostrar(reais, procura = location.search) {
  if (reais.length) return reais;
  return new URLSearchParams(procura).get('demo') === 'avaliacoes' ? EXEMPLOS : [];
}
