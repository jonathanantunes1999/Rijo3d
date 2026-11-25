import { PECAS } from '../data/pecas.js';
import { renderPecas } from './pecas.js';
import { iniciarPalco } from './palco.js';
import './menu.js';
import { AVALIACOES } from '../data/avaliacoes.js';
import { renderAvaliacoes, avaliacoesParaMostrar } from './avaliacoes.js';

renderPecas(document.querySelector('#pecas .pecas__alvo'), PECAS);
iniciarPalco(document.getElementById('inicio'), PECAS);
renderAvaliacoes(document.getElementById('avaliacoes'), avaliacoesParaMostrar(AVALIACOES));

export function textoVazio(valor) {
  return valor.trim() === '';
}

const form = document.getElementById('form-encomenda');
const estado = document.getElementById('estado-form');
const campoDescricao = document.getElementById('descricao');
const erroDescricao = document.getElementById('erro-descricao');

function mostrarErroDescricao(mostrar) {
  erroDescricao.hidden = !mostrar;
  campoDescricao.setAttribute('aria-invalid', String(mostrar));
}

campoDescricao.addEventListener('input', () => mostrarErroDescricao(false));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  estado.textContent = '';
  const obrigatorios = ['nome', 'email', 'descricao'];
  if (obrigatorios.some((nome) => textoVazio(form.elements[nome].value))) {
    mostrarErroDescricao(textoVazio(campoDescricao.value));
    const vazio = obrigatorios.find((nome) => textoVazio(form.elements[nome].value));
    form.elements[vazio].focus();
    return;
  }
  mostrarErroDescricao(false);
  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  try {
    const resposta = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    const dados = await resposta.json();
    if (!dados.success) throw new Error('rejeitado');
    estado.textContent = 'Pedido enviado. Obrigado! Respondemos em breve.';
    form.reset();
  } catch {
    estado.textContent = 'Não foi possível enviar o pedido. Tenta de novo ou fala connosco por WhatsApp.';
  } finally {
    botao.disabled = false;
  }
});

document.addEventListener('click', (e) => {
  const ligacao = e.target.closest('a[data-acao="medida"]');
  if (!ligacao) return;
  e.preventDefault();
  form.elements.peca.value = ligacao.dataset.peca ?? '';
  document.getElementById('encomendas').scrollIntoView();
  campoDescricao.focus({ preventScroll: true });
});

const pecaDoEndereco = new URLSearchParams(location.search).get('peca');
if (pecaDoEndereco) form.elements.peca.value = pecaDoEndereco.slice(0, 120);
