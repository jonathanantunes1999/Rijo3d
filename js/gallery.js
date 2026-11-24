function criarLightbox() {
  const dialogo = document.createElement('dialog');
  dialogo.className = 'lightbox';
  dialogo.setAttribute('aria-label', 'Imagem ampliada');
  dialogo.innerHTML = '<button class="lightbox__fechar" type="button" aria-label="Fechar">×</button><figure><img alt=""><figcaption></figcaption></figure>';
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) dialogo.close();
  });
  dialogo.querySelector('.lightbox__fechar').addEventListener('click', () => dialogo.close());
  document.body.append(dialogo);
  return dialogo;
}

export function renderGaleria(container, itens) {
  container.replaceChildren();
  if (!itens.length) {
    const p = document.createElement('p');
    p.className = 'galeria__vazio';
    p.textContent = 'Em breve, novos trabalhos aqui.';
    container.append(p);
    return;
  }
  const dialogo = document.querySelector('dialog.lightbox') ?? criarLightbox();
  const grelha = document.createElement('div');
  grelha.className = 'galeria__grelha';
  for (const item of itens) {
    const figura = document.createElement('figure');
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.setAttribute('aria-label', `Ampliar: ${item.legenda}`);
    const img = document.createElement('img');
    img.src = item.src.split('/').map(encodeURIComponent).join('/');
    img.alt = item.alt;
    img.loading = 'lazy';
    img.width = 800;
    img.height = 600;
    botao.append(img);
    const legenda = document.createElement('figcaption');
    legenda.textContent = item.legenda;
    figura.append(botao, legenda);
    botao.addEventListener('click', () => {
      const grande = dialogo.querySelector('img');
      grande.src = item.src;
      grande.alt = item.alt;
      dialogo.querySelector('figcaption').textContent = item.legenda;
      dialogo.returnValue = '';
      dialogo.showModal();
    });
    grelha.append(figura);
  }
  container.append(grelha);
}
