import { GALERIA } from '../data/galeria.js';
import { renderGaleria } from './gallery.js';

renderGaleria(document.querySelector('#galeria .galeria__alvo'), GALERIA);

const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu-principal');

function definirMenu(aberto) {
  toggle.setAttribute('aria-expanded', String(aberto));
  menu.classList.toggle('aberto', aberto);
}

toggle.addEventListener('click', () => {
  definirMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) definirMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') definirMenu(false);
});
