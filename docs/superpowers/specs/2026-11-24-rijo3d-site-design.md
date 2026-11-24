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
