const INTERVALO = 6000;

function caminho(src) {
  return src.split('/').map(encodeURIComponent).join('/');
}

function botao(classe, rotulo, texto) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = classe;
  b.setAttribute('aria-label', rotulo);
  b.textContent = texto;
  return b;
}

export function iniciarPalco(raiz, pecas) {
  const palco = raiz.querySelector('.palco');
  const info = raiz.querySelector('.hero__peca');
  if (!palco || !info || !pecas.length) return;

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ponteiroFino = matchMedia('(pointer: fine)').matches;
  let indice = 0;
  let pausado = reduzir;
  let suspenso = false;
  let temporizador;

  const palcoInterno = document.createElement('div');
  palcoInterno.className = 'palco__cena';
  const slides = pecas.map((peca, i) => {
    const slide = document.createElement('figure');
    slide.className = 'palco__slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositivo');
    slide.setAttribute('aria-label', `${i + 1} de ${pecas.length}`);
    const primeira = peca.imagens?.[0];
    if (primeira) {
      const img = document.createElement('img');
      img.src = caminho(primeira.src);
      img.alt = primeira.alt;
      img.width = 1000;
      img.height = 1250;
      if (i === 0) img.setAttribute('fetchpriority', 'high');
      else img.loading = 'lazy';
      slide.append(img);
    }
    palcoInterno.append(slide);
    return slide;
  });

  const controlos = document.createElement('div');
  controlos.className = 'palco__controlos';
  const anterior = botao('palco__anterior', 'Peça anterior', '‹');
  const seguinte = botao('palco__seguinte', 'Peça seguinte', '›');
  const pausa = botao('palco__pausa', 'Pausar rotação automática', '');
  pausa.setAttribute('aria-pressed', String(pausado));
  const pontos = document.createElement('div');
  pontos.className = 'palco__pontos';
  const botoesPonto = pecas.map((peca, i) => {
    const p = botao('palco__ponto', `Ver ${peca.nome}`, '');
    p.addEventListener('click', () => { ir(i); agendar(); });
    pontos.append(p);
    return p;
  });
  controlos.append(anterior, pontos, pausa, seguinte);
  palco.replaceChildren(palcoInterno, controlos);

  function ir(novo) {
    indice = (novo + pecas.length) % pecas.length;
    const peca = pecas[indice];
    slides.forEach((s, i) => {
      const ativo = i === indice;
      if (ativo) s.dataset.ativo = 'true'; else delete s.dataset.ativo;
      s.setAttribute('aria-hidden', String(!ativo));
    });
    botoesPonto.forEach((p, i) => {
      if (i === indice) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    raiz.style.setProperty('--cor-palco', peca.cor);
    const nome = info.querySelector('.hero__peca-nome');
    nome.textContent = peca.nome;
    info.querySelector('.hero__peca-preco').textContent = peca.preco;
    if (!reduzir) {
      info.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' });
    }
  }

  function agendar() {
    clearInterval(temporizador);
    if (!pausado && !suspenso) temporizador = setInterval(() => ir(indice + 1), INTERVALO);
  }

  anterior.addEventListener('click', () => { ir(indice - 1); agendar(); });
  seguinte.addEventListener('click', () => { ir(indice + 1); agendar(); });
  pausa.addEventListener('click', () => {
    pausado = !pausado;
    pausa.setAttribute('aria-pressed', String(pausado));
    pausa.setAttribute('aria-label', pausado ? 'Retomar rotação automática' : 'Pausar rotação automática');
    agendar();
  });
  palco.addEventListener('pointerenter', () => { suspenso = true; agendar(); });
  palco.addEventListener('pointerleave', () => { suspenso = false; palco.style.removeProperty('--rx'); palco.style.removeProperty('--ry'); agendar(); });
  palco.addEventListener('focusin', () => { suspenso = true; agendar(); });
  palco.addEventListener('focusout', () => { suspenso = false; agendar(); });

  if (!reduzir && ponteiroFino) {
    palco.addEventListener('pointermove', (e) => {
      const r = palco.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      palco.style.setProperty('--ry', (x * 14).toFixed(2));
      palco.style.setProperty('--rx', (-y * 10).toFixed(2));
    });
  }

  info.hidden = false;
  palco.classList.add('palco--ativo');
  ir(0);
  agendar();
}
