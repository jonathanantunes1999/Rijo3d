# Site Rijo3d

Site simples (HTML, CSS e JavaScript), sem passo de build e sem mensalidades. Este guia explica como mudar as coisas mais comuns.

## Acrescentar ou mudar uma peça

1. Põe as fotos na pasta `images/pecas/`. Evita `#`, `?` e `%` no nome do ficheiro (espaços e acentos não há problema). Ideal: formato WebP ou JPG, cerca de 1000 px de largura, abaixo de 150 KB.
2. Abre `data/pecas.js` e acrescenta um bloco à lista (a primeira imagem é a capa; as outras aparecem ao ampliar):

   ```js
   {
     id: 'nome-curto',
     nome: 'Nome da peça',
     detalhe: 'Estátua em resina, pintada à mão, 40 cm.',
     preco: '199,99 €',
     etsyUrl: 'https://www.etsy.com/pt/listing/…',
     cor: '#7c3aed',
     imagens: [{ src: 'images/pecas/nome-1.webp', alt: 'Descrição curta do que se vê' }],
   },
   ```

   Para acrescentar mais fotos a uma peça, põe-nas em `images/pecas/` e acrescenta mais linhas à lista `imagens`: aparecem na página da peça (`peca.html?id=nome-curto`) como miniaturas e setas. `ficha` é a tabela de dados da página da peça (material, tamanho…).
3. Em `index.html`, procura `<noscript>` na secção Peças e acrescenta o mesmo cartão lá (serve para quem tem o JavaScript desligado). Um teste automático avisa se ficarem diferentes.
4. Atualiza o preço também na Etsy: o site não lê a loja, são dois sítios.
5. Em `sitemap.xml`, acrescenta a linha `https://rijo3d.pt/peca.html?id=nome-curto` (um teste automático avisa se faltar).
6. Grava. O site atualiza sozinho em cerca de um minuto, se estiver ligado ao Cloudflare Pages.

Para remover uma peça, apaga o bloco em `data/pecas.js` e o cartão correspondente no `<noscript>`.

## Avaliações de clientes

A secção "O que dizem os clientes" só aparece quando há avaliações verdadeiras. Para acrescentar uma, abre `data/avaliacoes.js` e junta uma linha à lista:

```js
{ nome: 'Ana R.', texto: 'O que o cliente escreveu', estrelas: 5, peca: 'Blade, escala 1/6' },
```

Só avaliações reais, escritas por clientes que autorizaram. Inventar avaliações é proibido na União Europeia. Para veres o desenho antes de haver avaliações, abre o site com `?demo=avaliacoes` no fim do endereço: aparecem 3 cartões marcados "Exemplo", que nunca aparecem sem esse endereço.

## Mudar contactos

Em `index.html`, na secção Contactos, edita o email, o telefone, o link de WhatsApp e o Instagram (procura `TODO-CLIENTE`). O número de WhatsApp aparece também no botão da secção Encomendas: procura `wa.me` e muda nos dois sítios, no formato `https://wa.me/351912345678` (indicativo sem `+`, sem espaços).

## Formulário de encomendas

O formulário envia o pedido para o teu email através do Web3Forms.

1. Cria uma conta grátis em web3forms.com e gera uma chave de acesso com o teu email.
2. Em `index.html`, procura `access_key` e substitui `TODO-CLIENTE-WEB3FORMS-KEY` pela tua chave.
3. Testa enviando um pedido a ti própria.

O plano grátis não aceita anexos, por isso o formulário pede uma descrição ou uma ligação ao modelo.

## Textos, cores e fotos do site

- Textos: diretamente em `index.html`. Procura os comentários `TODO-CLIENTE`, que marcam o que ainda é provisório.
- Cores e tipos de letra: no topo de `css/styles.css`, em `:root`.
- Domínio (canonical, partilha e sitemap): procura `rijo3d.pt` em `index.html`, `robots.txt` e `sitemap.xml` e troca pelo teu.

## Publicar

Recomendado: Cloudflare Pages ou Netlify, ligados a este repositório do GitHub (funciona mesmo com o repositório privado). Não há comando de build: a pasta publicada é a raiz do projeto. O domínio deve ficar registado em teu nome.

## Pedir ajuda ao Claude para editar

Podes abrir este repositório com o Claude e pedir coisas como "acrescenta esta peça ao catálogo com o preço X" ou "muda o telefone". Depois de cada alteração, confirma no site que tudo está bem.

## Testes (para quem mantém o código)

```bash
npm install
npm test
```
