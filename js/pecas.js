const LOJA = 'https://www.etsy.com/pt/shop/Rijo3D';

function caminho(src) {
  return src.split('/').map(encodeURIComponent).join('/');
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
    figura.append(img);
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
