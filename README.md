# Site Rijo3d

Site simples (HTML, CSS e JavaScript), sem passo de build e sem mensalidades. Este guia explica como mudar as coisas mais comuns.

## Acrescentar uma foto à galeria

1. Põe a imagem na pasta `images/galeria/`. Evita `#`, `?` e `%` no nome do ficheiro (espaços e acentos não há problema). Ideal: formato JPG ou WebP, cerca de 1200 px de largura, abaixo de 300 KB.
2. Abre `data/galeria.js` e acrescenta uma linha à lista:

   ```js
   { src: 'images/galeria/nome-da-foto.jpg', alt: 'Descrição curta do que se vê', legenda: 'Texto que aparece por baixo' },
   ```

3. Em `index.html`, procura `<noscript>` e acrescenta a mesma foto lá (serve para quem tem o JavaScript desligado).
4. Grava. O site atualiza sozinho em cerca de um minuto, se estiver ligado ao Cloudflare Pages.

Para remover uma foto, apaga a linha em `data/galeria.js` e o bloco correspondente no `<noscript>`.

## Mudar contactos

Em `index.html`, na secção Contactos, edita o email, o telefone e o link de WhatsApp. O número de WhatsApp aparece também no botão da secção Encomendas: procura `wa.me` e muda nos dois sítios, no formato `https://wa.me/351912345678` (indicativo sem `+`, sem espaços).

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

Podes abrir este repositório com o Claude e pedir coisas como "acrescenta esta foto à galeria com a legenda X" ou "muda o telefone". Depois de cada alteração, confirma no site que tudo está bem.

## Testes (para quem mantém o código)

```bash
npm install
npm test
```
