import { caminho } from './util.js';

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

export function abrirLightbox(peca, indice = 0) {
  estado = { peca, indice };
  obterLightbox();
  mostrar();
  dialogo.showModal();
}
