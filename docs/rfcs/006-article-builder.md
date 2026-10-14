# RFC 006 — Construtor de artigos e reporte por parágrafo

Status: Draft · Prioridade: P2 (semana 2) · Esforço: ~5–7 dias · Bloqueio: dono explicar a página de artigos

## Contexto
Hoje artigos vivem no Payload (`collections/Articles`, `src/features/articles`). Dono quer criar artigos dentro do app com blocos "Create new" em 6 a 10 estilos (texto, foto, duas imagens...) e reporte de erro por parágrafo, como as sugestões de mudança da Wikipedia.

## Proposta
**Modelo**: artigo = lista ordenada de blocos tipados.
```ts
articles: defineTable({ title, slug, authorId, status: 'draft'|'published', heroStorageId? })
articleBlocks: defineTable({
  articleId, order: v.number(),
  type: v.union(v.literal('text'), v.literal('image'), v.literal('twoImages'), ...),
  data: v.any(),   // validado por union discriminada por tipo em validators.ts
}).index('by_article_order', ['articleId', 'order'])
articleSuggestions: defineTable({
  articleId, blockId, paragraphIndex, text, userId, status: 'open'|'accepted'|'rejected'
}).index('by_article', ['articleId'])
```
**Entrega em fases**: (1) blocos `text`, `image`, `twoImages` + reordenar; (2) mais estilos até 6–10; (3) sugestões por parágrafo (selecionar parágrafo → "Sugerir correção" → fila para o autor aceitar/rejeitar).
**Editor**: sem lib de rich text no começo; textarea por bloco com markdown limitado. Avaliar Tiptap só se pedirem formatação inline.

## Riscos
- Dois sistemas de artigo (Payload e builder) coexistindo. Definir se o builder substitui ou complementa.
- Sanitização de texto/markdown contra XSS.
- Reordenação concorrente: usar `order` fracionário ou reindexar na mutation.

## Alternativas
- Payload Lexical blocks: reaproveita o admin, mas o dono quer criação dentro do app, sem admin.

## Perguntas abertas
- [ ] Substitui o Payload ou convive?
- [ ] Quais os 6–10 estilos? (Dono vai explicar na próxima call.)
- [ ] Quem edita artigo publicado: só autor? Sugestões vão para quem?
- [ ] Reporte por parágrafo exige login?

## Critério de pronto (fase 1)
Criar, editar, reordenar e publicar artigo com 3 tipos de bloco; renderizar na página existente.

## Decisões
- 2026-10-09: builder convive com o Payload por enquanto. Reavaliar substituição depois da fase 1. Rota/slug do builder não pode colidir com os slugs do Payload.
- 2026-10-09: fase 1 com 3 blocos (texto, imagem, duas imagens). Os 6–10 estilos finais entram na fase 2, após a explicação do dono.
