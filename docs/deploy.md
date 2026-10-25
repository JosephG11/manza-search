# Como fazer deploy do Convex em produção

O app de prod usa o Convex do **cliente** (`proper-dalmatian-938`), não o de desenvolvimento
(`shiny-warbler-641`, definido em `.env.local`). O deploy é feito com uma **deploy key** de produção,
guardada em `.env.prod` (fora do git).

## Pré-requisitos

- `.env.prod` na raiz com a linha `CONVEX_DEPLOY_KEY=prod:proper-dalmatian-938|...`
  (o nome da variável tem que ser exatamente `CONVEX_DEPLOY_KEY`).
- Key gerada no dashboard do cliente: deployment **Production** → *Settings* → *URL & Deploy Key* →
  *Generate Production Deploy Key*. Ela só aparece uma vez.
- Nunca commitar `.env.prod` nem colar a key em chat, issue ou log.

## Passo a passo

Rode na raiz do projeto, no mesmo terminal.

```bash
cd /Users/periotto/Desktop/workspace/manza-search

# 1. Carregar a key (só neste terminal)
set -a; source .env.prod; set +a

# 2. Conferir o alvo: tem que imprimir prod:proper-dalmatian-938
echo "$CONVEX_DEPLOY_KEY" | cut -d'|' -f1

# 3. Simulação: não altera nada, mostra o diff de schema, índices e funções
npx convex@latest deploy --dry-run

# 4. Deploy de verdade
npx convex@latest deploy

# 5. Limpar a key do terminal
unset CONVEX_DEPLOY_KEY
```

Use sempre `npx convex@latest`, e não `npx convex`. O CLI antigo falha contra a API atual com
`DeploymentNotFound` mesmo com a key certa (aconteceu com o CLI 1.25).

Antes de confirmar, confira no dry-run a linha `Would have deployed Convex functions to
https://proper-dalmatian-938.convex.cloud`.

## Variáveis de ambiente do Convex de prod

Com a key carregada, os comandos `env` vão para prod automaticamente (não use `--prod`).

```bash
npx convex@latest env list
npx convex@latest env get ADMIN_EMAILS
```

Obrigatórias em prod: `ADMIN_EMAILS` e `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`.
Para gerenciar admins, veja [admins.md](./admins.md). O `env set` substitui a lista inteira:
rode o `get` antes e reenvie a lista completa.

## Depois do deploy

1. Recarregue o app de prod e abra a tela de img (a query `indexBrowser:viewer` não pode dar erro).
2. Se algo falhar, veja os logs de prod: `npx convex@latest logs`.

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `DeploymentNotFound` em `team_and_project` | CLI antigo, ou key revogada | Usar `convex@latest`; se persistir, gerar nova key |
| `Server Error` em `indexBrowser:viewer` | Prod sem os índices novos | Rodar o deploy |
| `CONVEX_DEPLOY_KEY` vazio no `echo` | Nome da variável errado no `.env.prod` | Corrigir o nome e repetir o `source` |
| Deploy foi para o Convex errado | Key de outro deployment | Conferir o passo 2 antes de deployar |
| Falha de validação de schema | Dados de prod não batem com o schema | Ler a mensagem: ela diz a tabela e o campo |

## Dev x prod

| | Dev | Prod |
|---|---|---|
| Deployment | `shiny-warbler-641` | `proper-dalmatian-938` |
| Onde configura | `.env.local` | `.env.prod` (deploy key) |
| Deploy | `npx convex@latest dev` | `npx convex@latest deploy` |

O `deploy` sobe o que está em `convex/` no disco, com ou sem commit. Antes de deployar, confira
`git status` e rode `pnpm type-check`.
