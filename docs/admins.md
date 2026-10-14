# Como adicionar e remover admins

Admin = usuário cujo **e-mail** está na variável de ambiente `ADMIN_EMAILS` do Convex.
Não existe tabela nem tela de admins: a lista vive só nessa variável.

## O que um admin pode fazer

- Adicionar e remover imagens do **carrossel do topo** (Art, Img, Sound, Literature, Travel, Health & Wellness).
- Apagar qualquer categoria ou item do índice, mesmo de outros usuários.
- Não tem limite de criações por hora no índice.

Usuários comuns (logados) continuam criando categorias e itens, e apagando só o que criaram.

## Formato

Lista de e-mails separados por vírgula, sem aspas dentro da lista. Maiúsculas e espaços ao redor são ignorados.

```
periottocosta@gmail.com,outra.pessoa@monza.com
```

O e-mail precisa ser o mesmo da conta do usuário no site (campo `email` da tabela `users`, vindo do Clerk).

## Ver a lista atual

```bash
npx convex env get ADMIN_EMAILS            # deploy de desenvolvimento
npx convex env get ADMIN_EMAILS --prod     # produção
```

## Adicionar ou remover (substitui a lista inteira)

Sempre envie a lista **completa** já com a mudança.

```bash
# Só um admin
npx convex env set ADMIN_EMAILS "periottocosta@gmail.com"

# Adicionar: pegue a lista atual e acrescente o novo e-mail
npx convex env set ADMIN_EMAILS "periottocosta@gmail.com,novo.admin@monza.com"

# Remover: reenvie a lista sem o e-mail
npx convex env set ADMIN_EMAILS "periottocosta@gmail.com"
```

Para produção, acrescente `--prod` em cada comando.
Também dá para editar pelo dashboard: https://dashboard.convex.dev → projeto → *Settings* → *Environment Variables*.

## Quando entra em vigor

Na hora. Não precisa de deploy. O admin recarrega a página e os botões "Add image" e de apagar aparecem.

## Regras e cuidados

- **Dev e prod são separados.** Configure `ADMIN_EMAILS` nos dois.
- A pessoa precisa ter **criado conta** no site (feito login ao menos uma vez) para existir em `users`.
- Se o e-mail da conta no Clerk mudar, atualize a lista.
- Nunca coloque e-mail de quem você não controla: quem for admin apaga conteúdo de todos.
- Para remover todos os admins, use `npx convex env remove ADMIN_EMAILS`.

## Onde está no código

- `convex/_utils.ts`: `isAdmin(user)` e `requireAdmin(ctx)`.
- `convex/indexBrowser.ts`: query `viewer` devolve `isAdmin` para a UI.
- `convex/carousel.ts`: mutations restritas a admin.
