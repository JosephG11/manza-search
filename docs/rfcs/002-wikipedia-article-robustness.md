# RFC 002 — Página de artigo Wikipedia quebra (caso Batman)

Status: Draft · Prioridade: P0 · Esforço: ~3h · Bloqueio: log da Vercel para confirmar

## Contexto
Commit d709834 criou a página de artigo Wikipedia (`getWikipediaArticle` em `src/features/wikipedia/wikipediaClient.ts`).
Busca de "Batman" quebra a página; outros termos funcionam.

## Hipóteses (ordem de probabilidade)
1. **`new URL(link['*'], ...)` lança** em `sources` (extlinks). Batman tem muitos links externos, alguns malformados. Essa chamada está fora de qualquer try/catch, então derruba o render inteiro.
2. **`link['*']` ausente** em algum extlink (formato JSON v1) → `new URL(undefined)`.
3. **Resposta grande**: `prop=extracts` de página longa estoura o limite do cache do `fetch` (2MB no Next) ou o tempo de 5s do `AbortSignal.timeout`.
4. **Campo faltando no componente** (`WikiArticleView`) sem validação.

## Proposta
1. Reproduzir: `curl` na API da Wikipedia com `titles=Batman` e rodar `getWikipediaArticle('Batman')` num script; ler o log da Vercel.
2. Tornar `sources` à prova de falha: helper `safeHostname(url)` com try/catch; descartar item inválido em vez de lançar.
3. Validar a resposta com Zod (`WikipediaArticlePage`) na borda; campos opcionais com default. Falha de validação → `null` (cai no not-found) e `console.error` com o título.
4. Error boundary (`error.tsx`) na rota do artigo para nunca mostrar tela quebrada.
5. Teste de regressão com fixture JSON do Batman.

## Alternativas
- Só try/catch em volta de `sources`: resolve Batman, mas não o próximo campo faltando. Zod cobre a classe de bug.

## Perguntas abertas
- [ ] O log confirma a hipótese 1?
- [ ] Usamos Zod já no projeto ou adicionamos dependência?
- [ ] Artigos muito longos: truncar seções?

## Critério de pronto
Batman e 10 outros termos variados renderizam; entrada inválida nunca derruba a página.

## Decisões
- 2026-10-09: validar resposta com Zod na borda (além do `safeHostname`).
