import { MODO_DEMO } from '../data/config.js';

// Exemplos inventados SÓ para demonstração (endereço ?demo=avaliacoes), sempre marcados "Exemplo". Não são clientes reais.
const EXEMPLOS = [
  { nome: 'Ana R.', texto: 'A pintura está incrível, os detalhes do casaco e do sangue ficaram ainda melhores ao vivo do que nas fotos. Já está na prateleira em destaque.', estrelas: 5, peca: 'Blade, escala 1/6', exemplo: true },
  { nome: 'Miguel S.', texto: 'Peça enorme e muito bem acabada. Chegou bem protegida e sem nada partido. Recomendo.', estrelas: 5, peca: 'Goku Super Saiyan 4', exemplo: true },
  { nome: 'Inês C.', texto: 'Pedi uma versão com outra cor e correu tudo bem, responderam sempre depressa. Ficou exatamente como imaginei.', estrelas: 5, peca: 'Kokushibo, escala 1/6', exemplo: true },
  { nome: 'Tiago M.', texto: 'Muito detalhe na serpente e no rosto. Demorou um pouco mais do que esperava a chegar, mas valeu a pena.', estrelas: 4, peca: 'Orochimaru, escala 1/6', exemplo: true },
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

export function avaliacoesParaMostrar(reais, procura = location.search, modoDemo = MODO_DEMO) {
  if (reais.length) return reais;
  const demo = new URLSearchParams(procura).get('demo');
  if (demo === 'off') return [];
  return modoDemo || demo === 'avaliacoes' ? EXEMPLOS : [];
}

export function sincronizarMenu(secao) {
  const menu = document.getElementById('menu-principal');
  if (!menu || !secao) return;
  menu.querySelector('a[href="#avaliacoes"]')?.remove();
  if (secao.hidden) return;
  const link = document.createElement('a');
  link.href = '#avaliacoes';
  link.textContent = 'Avaliações';
  menu.querySelector('a[href="#pecas"]')?.after(link);
}

export function modoDemoAtivo(reais, procura = location.search, modoDemo = MODO_DEMO) {
  if (new URLSearchParams(procura).get('demo') === 'off') return false;
  return !reais.length && (modoDemo || new URLSearchParams(procura).get('demo') === 'avaliacoes');
}
