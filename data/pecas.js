// Lista de peças do catálogo. Para acrescentar uma peça: pôr as fotos em images/pecas/
// e acrescentar um bloco aqui. Manter igual ao <noscript> em index.html.
// Cada peça pode ter várias imagens: a primeira é a capa. `ficha` aparece na página da peça.
// TODO-CLIENTE: confirmar tamanhos, ligações individuais da Etsy e trocar os renders por fotos reais das peças.
export const PECAS = [
  {
    id: 'goku-ssj4',
    nome: 'Goku Super Saiyan 4',
    detalhe: 'Estátua em resina, pintada à mão. Busto grátis.',
    preco: '229,99 €',
    etsyUrl: 'https://www.etsy.com/pt/shop/Rijo3D', // TODO-CLIENTE: ligação desta listagem
    cor: '#e0243b',
    ficha: [['Material', 'Resina'], ['Acabamento', 'Pintado à mão'], ['Extra', 'Busto grátis']], // TODO-CLIENTE: acrescentar o tamanho
    imagens: [{ src: 'images/pecas/goku-ssj4-1.webp', alt: 'Estátua do Goku Super Saiyan 4 em resina, sobre base de rocha vermelha' }],
  },
  {
    id: 'homem-aranha',
    nome: 'Homem-Aranha, Amigo da Vizinhança',
    detalhe: 'Estátua em resina, pintada à mão, 40 cm de altura. Busto grátis.',
    preco: '179,99 €',
    etsyUrl: 'https://www.etsy.com/pt/listing/4614267229/spider-man-action-figure-3d-printed',
    cor: '#5b6cf0',
    ficha: [['Material', 'Resina'], ['Acabamento', 'Pintado à mão'], ['Altura', '40 cm'], ['Largura', '15 cm'], ['Extra', 'Busto grátis']],
    imagens: [{ src: 'images/pecas/homem-aranha-1.webp', alt: 'Estátua do Homem-Aranha a balançar numa teia' }],
  },
  {
    id: 'blade',
    nome: 'Blade, escala 1/6',
    detalhe: 'Estátua em resina, pintada à mão, 40 cm. Com busto.',
    preco: '299,99 €',
    etsyUrl: 'https://www.etsy.com/pt/shop/Rijo3D', // TODO-CLIENTE: ligação desta listagem
    cor: '#d0102a',
    ficha: [['Material', 'Resina'], ['Acabamento', 'Pintado à mão'], ['Escala', '1/6 (40 cm)'], ['Extra', 'Com busto']],
    imagens: [{ src: 'images/pecas/blade-1.webp', alt: 'Estátua do Blade com espada, sobre base com sangue em resina vermelha' }],
  },
  {
    id: 'orochimaru',
    nome: 'Orochimaru, escala 1/6',
    detalhe: 'Estátua em resina, pintada à mão, 40 cm.',
    preco: '299,99 €',
    etsyUrl: 'https://www.etsy.com/pt/shop/Rijo3D', // TODO-CLIENTE: ligação desta listagem
    cor: '#7a4bd0',
    ficha: [['Material', 'Resina'], ['Acabamento', 'Pintado à mão'], ['Escala', '1/6 (40 cm)']],
    imagens: [{ src: 'images/pecas/orochimaru-1.webp', alt: 'Estátua do Orochimaru enrolado numa serpente gigante' }],
  },
  {
    id: 'kokushibo',
    nome: 'Kokushibo, escala 1/6',
    detalhe: 'Estátua em resina, pintada à mão, 40 cm.',
    preco: '249,99 €',
    etsyUrl: 'https://www.etsy.com/pt/shop/Rijo3D', // TODO-CLIENTE: ligação desta listagem
    cor: '#9b3dff',
    ficha: [['Material', 'Resina'], ['Acabamento', 'Pintado à mão'], ['Escala', '1/6 (40 cm)']],
    imagens: [{ src: 'images/pecas/kokushibo-1.webp', alt: 'Estátua do Kokushibo com espada, rodeado por uma lua roxa' }],
  },
];
