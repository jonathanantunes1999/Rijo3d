import { PECAS } from '../data/pecas.js';
import { caminho } from './util.js';
import { abrirLightbox } from './lightbox.js';
import './menu.js';

const LOJA = 'https://www.etsy.com/pt/shop/Rijo3D';

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function botaoIcone(classe, rotulo, texto) {
  const b = el('button', classe, texto);
  b.type = 'button';
  b.setAttribute('aria-label', rotulo);
  return b;
}

function criarGaleria(peca) {
  const galeria = el('div', 'galeria-peca');
  galeria.tabIndex = 0;
  galeria.setAttribute('role', 'group');
  galeria.setAttribute('aria-roledescription', 'galeria');
  galeria.setAttribute('aria-label', `Fotos de ${peca.nome}`);
  const imagens = peca.imagens ?? [];
  let indice = 0;

  const palco = el('div', 'galeria-peca__palco');
  const principal = el('button', 'galeria-peca__principal');
  principal.type = 'button';
  principal.setAttribute('aria-label', `Ampliar foto de ${peca.nome}`);
  const img = document.createElement('img');
  img.width = 1000;
  img.height = 1250;
  img.setAttribute('fetchpriority', 'high');
  principal.append(img);
  palco.append(principal);
  galeria.append(palco);

  const minis = [];
  function ir(novo) {
    if (!imagens.length) return;
    indice = (novo + imagens.length) % imagens.length;
    img.src = caminho(imagens[indice].src);
    img.alt = imagens[indice].alt;
    minis.forEach((m, i) => {
      if (i === indice) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current');
    });
  }

  if (!imagens.length) {
    principal.disabled = true;
    img.alt = '';
  }
  principal.addEventListener('click', () => { if (imagens.length) abrirLightbox(peca, indice); });

  if (imagens.length > 1) {
    const anterior = botaoIcone('galeria-peca__anterior', 'Foto anterior', '‹');
    const seguinte = botaoIcone('galeria-peca__seguinte', 'Foto seguinte', '›');
    anterior.addEventListener('click', () => ir(indice - 1));
    seguinte.addEventListener('click', () => ir(indice + 1));
    palco.append(anterior, seguinte);
    const lista = el('div', 'galeria-peca__miniaturas');
    imagens.forEach((im, i) => {
      const m = el('button', 'galeria-peca__mini');
      m.type = 'button';
      m.setAttribute('aria-label', `Ver foto ${i + 1} de ${imagens.length}`);
      const mi = document.createElement('img');
      mi.src = caminho(im.src);
      mi.alt = '';
      mi.loading = 'lazy';
      mi.width = 160;
      mi.height = 200;
      m.append(mi);
      m.addEventListener('click', () => ir(i));
      minis.push(m);
      lista.append(m);
    });
    galeria.append(lista);
    galeria.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') ir(indice - 1);
      if (e.key === 'ArrowRight') ir(indice + 1);
    });
  }
  ir(0);
  return galeria;
}

export function renderPecaPagina(raiz, peca, todas) {
  document.title = `${peca.nome} — Rijo3D Figures`;
  const descricao = document.querySelector('meta[name="description"]');
  if (descricao) descricao.setAttribute('content', `${peca.nome}: ${peca.detalhe} ${peca.preco}. Rijo3D Figures.`);

  const pagina = el('div', 'container peca-pagina');
  pagina.style.setProperty('--cor-peca', peca.cor || '#8b5cf6');

  const voltar = el('a', 'peca-pagina__voltar', '← Todas as peças');
  voltar.href = 'index.html#pecas';

  const grelha = el('div', 'peca-pagina__grelha');
  const info = el('div', 'peca-pagina__info');
  info.append(el('h1', '', peca.nome), el('p', 'peca-pagina__preco', peca.preco), el('p', 'peca-pagina__detalhe', peca.detalhe));

  if (peca.ficha?.length) {
    const ficha = el('dl', 'ficha');
    for (const [rotulo, valor] of peca.ficha) {
      const linha = el('div', 'ficha__linha');
      linha.append(el('dt', '', rotulo), el('dd', '', valor));
      ficha.append(linha);
    }
    info.append(ficha);
  }

  const acoes = el('div', 'peca-pagina__acoes');
  const etsy = el('a', 'btn btn--primario', 'Comprar na Etsy');
  etsy.dataset.acao = 'etsy';
  etsy.href = peca.etsyUrl || LOJA;
  etsy.target = '_blank';
  etsy.rel = 'noopener noreferrer';
  const medida = el('a', 'btn', 'Pedir à medida');
  medida.dataset.acao = 'medida';
  medida.href = `index.html?peca=${encodeURIComponent(peca.nome)}#encomendas`;
  acoes.append(etsy, medida);
  info.append(acoes);

  const confianca = el('ul', 'hero__confianca');
  for (const t of ['Pintado à mão', 'Envio de Portugal', 'Devoluções em 14 dias']) confianca.append(el('li', '', t));
  info.append(confianca);

  grelha.append(criarGaleria(peca), info);

  const outras = el('section', 'outras');
  outras.append(el('h2', '', 'Outras peças'));
  const lista = el('div', 'outras__grelha');
  for (const o of todas.filter((p) => p.id !== peca.id).slice(0, 4)) {
    const a = el('a', 'outra');
    a.href = `peca.html?id=${encodeURIComponent(o.id)}`;
    a.style.setProperty('--cor-peca', o.cor || '#8b5cf6');
    if (o.imagens?.[0]) {
      const i = document.createElement('img');
      i.src = caminho(o.imagens[0].src);
      i.alt = '';
      i.loading = 'lazy';
      i.width = 400;
      i.height = 500;
      a.append(i);
    }
    a.append(el('span', 'outra__nome', o.nome), el('span', 'outra__preco', o.preco));
    lista.append(a);
  }
  outras.append(lista);

  pagina.append(voltar, grelha, outras);
  raiz.replaceChildren(pagina);
}

function renderNaoEncontrada(raiz) {
  const pagina = el('div', 'container peca-pagina');
  const aviso = el('p', 'peca-pagina__aviso', 'Desculpa, não encontrámos esta peça. Pode ter sido retirada ou o endereço está errado.');
  const voltar = el('a', 'btn btn--primario', 'Ver todas as peças');
  voltar.href = 'index.html#pecas';
  pagina.append(el('h1', '', 'Peça não encontrada'), aviso, voltar);
  raiz.replaceChildren(pagina);
}

const raiz = document.getElementById('conteudo');
if (raiz) {
  const id = new URLSearchParams(location.search).get('id');
  const peca = PECAS.find((p) => p.id === id);
  if (peca) renderPecaPagina(raiz, peca, PECAS);
  else renderNaoEncontrada(raiz);
}
