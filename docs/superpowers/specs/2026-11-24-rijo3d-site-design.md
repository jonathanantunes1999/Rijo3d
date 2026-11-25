# Rijo3d — Design do site (versão curta)

Data: 2026-11-24 · Autor: Jonathan Antunes (Blank Studios) com Claude

## Intenção e porquê
A Rijo3d (impressão 3D) não tem site. O cliente pediu um site direto: galeria de imagens, quem são e como a ideia nasceu, contactos e uma zona para fazerem pedidos de encomenda. O objetivo é dar-lhes presença própria online e um canal simples para receberem pedidos.

## Objetivos
- Site institucional de uma página (ou poucas), rápido e claro em telemóvel e desktop.
- Galeria de trabalhos.
- "Quem somos": história e origem da ideia.
- Contactos (email, WhatsApp, redes se existirem).
- Pedido de encomenda: formulário por email (Web3Forms) e/ou botão de WhatsApp. A decidir com o cliente.
- Sem custos recorrentes obrigatórios para o cliente.

## Não objetivos
- Loja online: sem carrinho, pagamentos, stock ou IVA.
- Painel de edição (CMS) nesta fase.
- Manutenção mensal incluída. Pode ser oferecida como extra opcional.

## Anti-objetivos
- Um site que só o Jonathan consegue mexer.
- Dependência de plataformas pagas para o site continuar online.

## Abordagens consideradas
1. Código à medida sem CMS, entregar o repositório para edições futuras. **Escolhida.** Mais rápida, sem custos recorrentes, o código fica do cliente.
2. Código à medida com Sanity como painel de edição. Mais robusta para edições frequentes, mas cerca de um dia extra. Fica como extra vendável se o cliente pedir.
3. Framer ou construtor visual. Mais rápida de montar, mas o cliente paga subscrição e o código não é dele.

## Decisões
- Decididas pelo Jonathan: abordagem 1; se o cliente quiser acrescentar fotos, entrega-se o repositório.
- Escolhas minhas (a confirmar): HTML, CSS e JavaScript simples, sem framework nem passo de build, para qualquer pessoa ou o Claude editar com facilidade; fotos numa pasta única com a lista da galeria num só ficheiro, de modo a que o Sanity possa encaixar depois sem refazer nada; hospedagem grátis (Cloudflare Pages ou Netlify) e domínio registado em nome do cliente; formulário por Web3Forms mais botão de WhatsApp.

## Em aberto (precisam do cliente)
- Fotos dos trabalhos, texto da história, logótipo e cores da marca, contactos.
- Se o pedido de encomenda é só formulário, só WhatsApp ou ambos.
- Domínio pretendido.

## Deixado ao construtor
Estrutura exata da página, estilo visual dentro da identidade da marca, textos de interface, otimização de imagens, SEO básico.

## Revisão 2026-11-24 (depois de ver a loja Etsy)
Aprovada pelo Jonathan na conversa.

- **O que mudou:** a Rijo3D já vende na Etsy (6 peças, estátuas de resina pintadas à mão, 179,99 a 299,99 €, envio de Portugal). O site não é loja: é a montra e a marca própria, com compra na Etsy e pedidos à medida pelo formulário.
- **Catálogo:** a galeria genérica dá lugar a cartões de peça (foto, nome, tamanho, preço, "Comprar na Etsy", "Pedir à medida"). Cada peça tem uma lista de imagens (por agora uma); a ampliação passa entre elas.
- **Pedir à medida:** o botão leva o nome da peça para o campo "Peça" do formulário.
- **Identidade:** violeta e azul elétrico sobre preto, a partir do banner da Etsy (logótipo hexagonal RJ, "RiJo 3D Figures"). O laranja provisório sai.
- **Textos:** usar só o que a cliente já escreveu (anúncio da loja: "Na Rijo3D, transformamos ideias em realidade com tecnologia, criatividade e muita paixão.") e factos confirmados na Etsy (resina, pintado à mão, envio de Portugal, devoluções em 14 dias).
- **Anti-objetivo novo:** não publicar imagens de terceiros sem a cliente confirmar que tem direito a usá-las; as cinco imagens atuais são renders dos criadores (marcas Tanuki Figures e Patreon visíveis) e servem só de protótipo.
- **Aviso registado:** as peças são personagens licenciadas; o risco de propriedade intelectual é da cliente.
- **Em aberto:** ficheiro do logótipo, @ do Instagram, ligações individuais de cada listagem Etsy, fotos reais das peças, foto e dados da réplica F1 (89,99 €) que não veio no pacote.

## Revisão 2: página da peça (2026-11-25)
- Cada peça tem a sua página `peca.html?id=…`, desenhada por JavaScript a partir de `data/pecas.js`: galeria com miniaturas e setas (várias imagens por peça), ficha, preço, "Comprar na Etsy" e "Pedir à medida" (leva o nome ao formulário por `index.html?peca=…#encomendas`), e outras peças.
- Nos cartões do catálogo, imagem, título e "Ver peça" abrem a página; o zoom (lightbox) passou para a imagem grande da página.
- Limitação conhecida: sem JavaScript a página da peça só mostra um aviso, e as etiquetas de partilha (og:) são as gerais do site, não as da peça.
