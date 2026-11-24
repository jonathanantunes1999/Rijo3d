const LOJA = 'https://www.etsy.com/pt/shop/Rijo3D';

function caminho(src) {
  return src.split('/').map(encodeURIComponent).join('/');
}

let dialogo;
let estado = { peca: null, indice: 0 };

function mostrar() {
  const { peca, indice } = estado;
  const imagem = peca.imagens[indice];
  const grande = dialogo.querySelector('img');
  grande.src = caminho(imagem.src);
  grande.alt = imagem.alt;
  const total = peca.imagens.length;
  dialogo.querySelector('figcaption').textContent = total > 1 ? `${peca.nome} (${indice + 1}/${total})` : peca.nome;
  dialogo.querySelector('.lightbox__anterior').hidden = total < 2;
  dialogo.querySelector('.lightbox__seguinte').hidden = total < 2;
}

function mover(passo) {
  const total = estado.peca.imagens.length;
  if (total < 2) return;
  estado.indice = (estado.indice + passo + total) % total;
  mostrar();
}

function obterLightbox() {
  if (dialogo) return dialogo;
  dialogo = document.createElement('dialog');
  dialogo.className = 'lightbox';
  dialogo.setAttribute('aria-label', 'Imagem ampliada');
  dialogo.innerHTML = `<div class="lightbox__conteudo">
    <button class="lightbox__fechar" type="button" aria-label="Fechar">×</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <div class="lightbox__nav">
      <button class="lightbox__anterior" type="button" aria-label="Imagem anterior">‹</button>
      <button class="lightbox__seguinte" type="button" aria-label="Imagem seguinte">›</button>
    </div>
  </div>`;
  dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
  dialogo.querySelector('.lightbox__fechar').addEventListener('click', () => dialogo.close());
  dialogo.querySelector('.lightbox__anterior').addEventListener('click', () => mover(-1));
  dialogo.querySelector('.lightbox__seguinte').addEventListener('click', () => mover(1));
  dialogo.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });
  document.body.append(dialogo);
  return dialogo;
}

function abrir(peca) {
  estado = { peca, indice: 0 };
  obterLightbox();
  mostrar();
  dialogo.showModal();
}

function criarCartao(peca) {
  const cartao = document.createElement('article');
  cartao.className = 'peca';
  cartao.style.setProperty('--cor-peca', peca.cor || '#8b5cf6');

  const figura = document.createElement('figure');
  figura.className = 'peca__imagem';
  const primeira = peca.imagens?.[0];
  if (primeira) {
    const img = document.createElement('img');
    img.src = caminho(primeira.src);
    img.alt = primeira.alt;
    img.loading = 'lazy';
    img.width = 800;
    img.height = 1000;
    const abrirBtn = document.createElement('button');
    abrirBtn.type = 'button';
    abrirBtn.className = 'peca__abrir';
    abrirBtn.setAttribute('aria-label', `Ampliar fotos: ${peca.nome}`);
    abrirBtn.append(img);
    abrirBtn.addEventListener('click', () => abrir(peca));
    figura.append(abrirBtn);
  } else {
    figura.classList.add('peca__imagem--vazia');
  }

  const corpo = document.createElement('div');
  corpo.className = 'peca__corpo';
  const titulo = document.createElement('h3');
  titulo.textContent = peca.nome;
  const detalhe = document.createElement('p');
  detalhe.className = 'peca__detalhe';
  detalhe.textContent = peca.detalhe;
  const preco = document.createElement('p');
  preco.className = 'peca__preco';
  preco.textContent = peca.preco;

  const acoes = document.createElement('div');
  acoes.className = 'peca__acoes';
  const etsy = document.createElement('a');
  etsy.className = 'btn btn--primario';
  etsy.dataset.acao = 'etsy';
  etsy.href = peca.etsyUrl || LOJA;
  etsy.target = '_blank';
  etsy.rel = 'noopener noreferrer';
  etsy.textContent = 'Comprar na Etsy';
  const medida = document.createElement('a');
  medida.className = 'btn';
  medida.dataset.acao = 'medida';
  medida.dataset.peca = peca.nome;
  medida.href = '#encomendas';
  medida.textContent = 'Pedir à medida';
  acoes.append(etsy, medida);

  corpo.append(titulo, detalhe, preco, acoes);
  cartao.append(figura, corpo);
  return cartao;
}

export function renderPecas(container, pecas) {
  container.replaceChildren();
  if (!pecas.length) {
    const p = document.createElement('p');
    p.className = 'pecas__vazio';
    p.textContent = 'Em breve, novas peças aqui.';
    container.append(p);
    return;
  }
  const grelha = document.createElement('div');
  grelha.className = 'pecas__grelha';
  for (const peca of pecas) grelha.append(criarCartao(peca));
  container.append(grelha);
}
