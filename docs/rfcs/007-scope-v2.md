# RFC 007 — Scope v2: comunidade e novo fluxo de artigo

Status: Ideia · Sem data · Depende de: Scope v1 (RFC 004), construtor de artigos (RFC 006)

## Contexto
Na v1 o Scope é só a lista A–Z da Wikipedia. Na v2, membros verificados da comunidade criam categorias e melhoram artigos, para o dono não precisar classificar conteúdo na mão.

## Ideias discutidas (nada implementado)
- **Membros verificados**: novo papel além de admin, que cria categorias e edita artigos.
- **Novo artigo**: duas opções, entrada manual ou botão "auto" que abre um pop-up ("pocket") com a busca A–Z da Wikipedia (reaproveita `listWikipediaByLetter`).
- **Termos ambíguos** (ex.: Robin): a comunidade corrige o artigo/categoria ligados.
- **Categorias geradas por IA** a partir dos artigos abertos (usaria `mistral`). Só como possibilidade.
- **Descrição curta ou resumo da Wikipedia** nas páginas de categoria (sugestão, não decidido).
- **Camada de cache** para a Wikipedia: hoje só o cache de CDN + `revalidate` do fetch.

## Perguntas abertas
- [ ] Como alguém vira "verificado" (convite, aprovação do admin, e-mail)?
- [ ] Os artigos escolhidos passam a ser salvos no banco? (v1 não salva.)
- [ ] Wikipedia só em inglês ou também pt?
