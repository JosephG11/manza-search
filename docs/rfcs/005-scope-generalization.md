# RFC 005 — Replicar o Scope nas demais páginas

Status: Draft · Prioridade: P1 (semana 1,5–2) · Esforço: ~2–3 dias · Depende de: RFC 004

## Contexto
Decisão da call: depois do Scope, duplicar o modelo para as outras páginas, exceto Articles. Páginas candidatas em `src/app/(frontend)`: art, img, sound, literature, travel, health-and-wellness.
Cada uma hoje tem um Global próprio no Payload (`src/Globals/*`) e feature própria em `src/features/*`.

## Proposta
- **Não copiar código**. Extrair `src/features/indexBrowser/` parametrizado por `section: 'scope' | 'art' | ...`, usando a coluna `section` já prevista na RFC 004.
- Config por seção (`sectionConfig.ts`): título, ícone do menu, se capa é obrigatória, rótulos.
- Cada rota vira uma casca fina: `<IndexBrowser section="art" />`.
- Conteúdo específico (ex.: sound com player, travel com mapa) entra como slot de renderização do item, só quando o dono pedir.

## Riscos
- Se o dono quiser que cada página divirja muito, a abstração vira dor. Mitigar com o slot de item e começar por 2 páginas (art, img) antes de ligar todas.
- Os Globals do Payload dessas páginas (sugeridos, banners) continuam em uso? Decidir o que fica.

## Perguntas abertas
- [ ] Lista final de páginas, na ordem?
- [ ] Categorias são compartilhadas entre seções ou isoladas? (Recomendo isoladas.)
- [ ] Alguma página precisa de tipo de item diferente (áudio, mapa)?

## Critério de pronto
Duas seções rodando sobre o mesmo componente sem duplicação; adicionar a terceira = config + rota.

## Decisões
- 2026-10-09: categorias isoladas por seção (coluna `section`, sem tabela de vínculo).

## Implementação (2026-10-09)
- `src/features/indexBrowser/` parametrizado por `section`; `sectionConfig.ts` guarda os rótulos.
- Ligado em scope, art, img, sound, literature, travel, health-and-wellness.
- Scope teve o conteúdo Payload substituído. Nas outras seis o `IndexBrowser` foi **inserido logo abaixo do Hero**, e o `*Content` antigo continua abaixo, porque ele carrega `paidTopSpot` / `adImages` (espaços pagos). Remover o conteúdo antigo é decisão do dono.

## Atualização (2026-10-09) — conteúdo antigo substituído pelas letras
- Em todas as páginas o `*Content` antigo saiu; ficam Hero/anúncios do topo e o `IndexBrowser` (barra A–Z + caixas filtradas por letra).
- Fonte Payload por página (`getPayloadBoxes`): scope = topics como caixas; art/sound/literature/health-and-wellness = categories do topic de mesmo slug; img = todas as categories; travel = categories dos continentes.
- **Perdido junto com os `*Content`**: `paidTopSpot` (art, sound, literature, health-and-wellness) e `adImages` (travel) não são mais exibidos. Os componentes continuam no repositório, sem uso.
- Scope: Table of Content original restaurada (painel fixo à esquerda no desktop, dropdown no mobile). Os links dela rolam até `#<slug da categoria>`, que só existe depois de abrir a caixa do tópico correspondente.
- Barra de letras voltou a ficar dentro do conteúdo (não mais fixa na lateral), pois a Table of Content ocupa a lateral esquerda.

## Atualização (2026-10-13) — sync semanal
- Código da hierarquia mantido e reutilizado em Img e demais páginas (o Scope saiu, ver RFC 004).
- Carrossel do topo volta nas seis páginas, agora alimentado pelo Convex (`carouselImages`), com upload e remoção só para admin. Ads do Payload (`pageAds`, `paidTopSpot`, `adImages`) continuam sem uso.
- Admin passa a ser por e-mail (`ADMIN_EMAILS`), ver `docs/admins.md`.
