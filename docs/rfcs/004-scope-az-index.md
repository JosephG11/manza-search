# RFC 004 — Scope: índice A–Z com criação inline

Status: Draft · Prioridade: P0 (semana 1) · Esforço: ~5 dias · Bloqueio: decisões abertas abaixo

## Contexto
Hoje (`src/app/(frontend)/scope/page.tsx`) o Scope é gerado no servidor a partir de Payload (`topics`, `categories`, `articles`) com `force-static` e `revalidate = 600`. Categorias são criadas pelo admin e tudo carrega de uma vez (lento).
Dono quer: índice A–Z, três níveis (letra → caixa de categoria → item com capa, link e título), criação pelo próprio site com botões "Create new", e carregamento incremental.

## Modelo de dados (Convex)
```ts
scopeCategories: defineTable({
  section: v.string(),            // 'scope' agora; ver RFC 005
  letter: v.string(),             // 'A'..'Z' | '#'
  name: v.string(),
  nameLower: v.string(),          // dedupe
  createdBy: v.id('users'),
}).index('by_section_letter', ['section', 'letter', 'nameLower'])

scopeItems: defineTable({
  categoryId: v.id('scopeCategories'),
  title: v.string(),
  link: v.string(),
  coverStorageId: v.optional(v.id('_storage')),
  createdBy: v.id('users'),
}).index('by_category', ['categoryId'])
```
`letter` é derivada de `name` no servidor (nunca confiar no cliente); normalizar acentos (Á→A), dígito/símbolo → `#`.

## API
- `scope.listCategories({ section, letter })` — só a letra ativa.
- `scope.listItems({ categoryId, paginationOpts })` — paginado, 12 por vez, "ver mais".
- `scope.createCategory`, `scope.createItem` — exigem login; validam: nome 1–60 chars, URL `https` válida, título 1–120, duplicata por `(section, letter, nameLower)`.
- `scope.generateCoverUploadUrl` → upload direto no Convex storage; validar tipo e tamanho (≤2MB) no `createItem`.

## UI
- Barra A–Z (letra ativa na URL: `/scope?letter=D`, deep-link e SSR do primeiro paint).
- Caixas azuis pequenas; **primeira caixa é "+"** que vira input inline (Enter cria, Esc cancela, estado otimista).
- Clicar na caixa abre os itens (lazy); dentro, card "+" para novo item (capa, link, título).
- Skeletons por nível; sem carregar nada fora da letra/categoria ativa.
- Reaproveitar `ScopeContent*`, trocando a fonte de dados de Payload para Convex.

## Migração
Conteúdo atual do Payload (topics/categories/articles) **não migra automaticamente**. Opções: (a) ignorar, página nova começa vazia; (b) script one-off que importa categorias do Payload para Convex. Recomendo (b) só se o dono tiver conteúdo que queira manter.

## Riscos
- **Spam/links maliciosos** se qualquer logado cria: exigir login, rate limit por usuário, rel="noopener noreferrer nofollow ugc", e flag de moderação.
- Duplicatas ("DC Comics" vs "DC comics"): `nameLower` + índice.
- Letra com milhares de categorias: paginar `listCategories` também.

## Alternativas
- Manter Payload e só mudar a UI: dono quer criar pelo site, e Payload exige admin. Descartado.
- Subcoleção única em vez de duas tabelas: perde paginação independente por categoria.

## Perguntas abertas
- [ ] **Quem cria**: qualquer logado ou só admin/moderador? Aparece direto ou passa por aprovação?
- [ ] Editar/excluir: só quem criou? Admin?
- [ ] Capa: upload obrigatório ou opcional (fallback: og:image do link)?
- [ ] Categoria existe só em uma letra? ("The Batman" → T ou B?) Sugestão: ignorar artigos "the/a/o/a".
- [ ] O conteúdo antigo do Payload é descartado ou importado?
- [ ] Ícones novos do menu: placeholder até o dono mandar?

## Critério de pronto
Criar categoria e item pelo site; troca de letra carrega <300ms percebido; abrir página não consulta nada além da letra ativa; demo na sexta.

## Decisões
- 2026-10-09: qualquer usuário logado cria categoria/item, com moderação. Adicionar `status: 'visible' | 'hidden'` e `reportedCount` nas duas tabelas; admin pode ocultar/remover; rate limit por usuário (ex.: 20 criações/hora).
- 2026-10-09: conteúdo antigo do Payload é descartado. Scope novo nasce vazio; sem script de migração.
- 2026-10-09: editar/excluir = autor do item + admin.
- 2026-10-09: capa opcional. Fallback: buscar `og:image` do link no servidor (action Convex); se falhar, placeholder. Upload manual continua disponível.
  - **Risco SSRF**: a action que busca o link deve bloquear IPs privados/loopback/metadata (10.x, 127.x, 169.254.x, localhost), aceitar só https, limitar redirects (≤3), timeout (3s) e tamanho de resposta (≤1MB).
- 2026-10-09: letra ignora artigos iniciais "the/a/an" (só inglês). "The Batman" → B. Se o nome for só o artigo, usa a letra do artigo. `nameLower` guarda o nome completo para dedupe; adicionar campo `sortKey` (nome sem artigo).

## Implementação (2026-10-09) — desvios do desenho original
- Tabelas genéricas `indexCategories` / `indexItems` com coluna `section` (já pensando na RFC 005), em vez de `scopeCategories` / `scopeItems`.
- **Sem `status`/`reportedCount`**: moderação = autor ou admin apaga. Reporte de usuários fica para depois.
- Admin = `ADMIN_EMAILS` (e-mails separados por vírgula) nas variáveis de ambiente do Convex. Ver `docs/admins.md`.
- Rate limit: 20 criações/hora por usuário (categorias + itens).
- Capa: só `og:image` automático (`convex/indexCover.ts`, action Node agendada após criar o item, com bloqueio de IP privado, https, 3 redirects, 3s, 1MB). Upload manual **não** implementado. Limitação: DNS rebinding entre a checagem e o `fetch`.
- Categoria selecionada fica em estado local (só a letra vai na URL `?letter=`), para um id inválido na URL não derrubar a página.
- Não implementado: editar item/categoria (só excluir), importação do Payload (descartado por decisão).
- Removido: `src/features/scope/` (componentes baseados em Payload).

## Atualização (2026-10-09) — conteúdo existente do Payload volta a aparecer
- Revoga a decisão "descartar o conteúdo antigo" para o Scope: topics e categories do Payload agora aparecem, somente leitura, junto com o conteúdo novo do Convex.
- Mapeamento: **Topic** do Payload → caixa (ex.: "DC Comics", "Topic 2"); **Category** dentro do topic → seção com os artigos (ex.: "DC Comics by Genre"); category **sem topic** → caixa própria. Artigo → card com capa (Cloudinary), título e link interno `/articles/<slug>`.
- Fonte: `src/features/indexBrowser/payloadSource.ts` (server-only), buscada em `scope/page.tsx` e passada ao `IndexBrowser`. A página é `force-static` com `revalidate = 600`, então mudanças no Payload levam até 10 min.
- Limitação: tudo é carregado de uma vez no servidor (sem paginação). Aceitável com poucas dezenas de artigos; paginar se crescer.
- Letras: barra vertical fixa à esquerda em telas ≥ `sm` (rolável se a tela for baixa); no mobile continua horizontal no topo.

## Atualização (2026-10-09) — Table of Content com letras e categorias em blocos
- A barra de letras do topo saiu. O painel "Table of Content" (lateral esquerda, altura total) lista A–Z e `#`; clicar filtra a página (`?letter=X`). Vale para todas as páginas que usam o `IndexBrowser`.
- Cada categoria vira um bloco: título, até 5 itens, tile "+" à esquerda (adicionar item) e "See all →" à direita. `listCategories` já devolve os 5 itens de cada categoria numa única query (sem uma subscription por bloco).
- "See all": categoria do Convex abre a grade completa (com "Load more"); caixa do Payload com várias categorias (topic) abre as subcategorias, cada uma como bloco de 5 itens, e o "See all" delas abre a grade completa dos artigos. Botão "Back" volta um nível.
- Blocos vindos do Payload não têm o tile "+" (artigos do Payload só são criados pelo admin do Payload).

## Atualização (2026-10-13) — sync semanal
- **Scope v1 deixa de usar o `indexBrowser`**: página mostra cards planos de artigos da Wikipedia de A a Z (imagem, título, link), sem subcategorias e sem seção Monza.
- Artigos da Wikipedia são buscados ao vivo (`/api/wikipedia/letter`, cache de CDN de 1 dia), não são salvos no banco.
- Páginas de desambiguação são filtradas; termos ambíguos que sobrarem ficam para a comunidade na v2.
- A hierarquia (categoria → subcategoria → item) continua nas demais páginas (RFC 005).
- Dados antigos com `section: 'scope'` no Convex ficam no banco, sem uso na UI (o validator mantém `'scope'` para não quebrar o schema).
