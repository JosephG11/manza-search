# RFC 001 — Mistral: chave de API e cota

Status: Draft · Prioridade: P0 · Esforço: ~2h · Bloqueio: dono (pagamento/chave)

## Contexto
`src/app/api/mistral-chat/route.ts` usa `@ai-sdk/mistral` com `mistral-small-latest` e lê `MISTRAL_API_KEY`.
O free tier acabou. Não está claro de quem é a chave em uso (local `.env.local` vs. Vercel).
Decisão da call: continuar com Mistral para testes (sem Gemini/OpenAI por ora).

## Problema
Sem cota, o chat falha. A rota não trata erro, então o usuário vê um chat travado sem explicação.

## Proposta
1. **Chave**: dono cria a chave na conta dele (plano ~US$15/mês, US$6 estudante) ou define limite de gasto de US$20. Chave só na Vercel (Production + Preview) e `.env.local` de quem desenvolve.
2. **Tratamento de erro** na rota: capturar 401/429/quota e devolver mensagem amigável via `onError` do `streamText` / `toUIMessageStreamResponse({ onError })`. Não vazar mensagem do provedor.
3. **Guarda de abuso mínima**: exigir usuário autenticado (Clerk) e limitar tamanho de `messages` e `maxOutputTokens`. Sem isso, a chave paga fica exposta a qualquer um que chame a rota.
4. **Troca de provedor barata**: o modelo fica numa constante/env (`AI_MODEL`), para trocar para OpenRouter ou AI Gateway depois sem refatorar.

## Alternativas
- OpenRouter com modelos grátis: sem custo, mas limites de taxa e qualidade variam. Fica como plano B.
- Gemini direto: descartado pela decisão da call.

## Riscos
- Chave sem limite de gasto + rota pública = conta alta. Item 3 é obrigatório, não opcional.

## Perguntas abertas
- [ ] Plano e limite de gasto que o dono aprova?
- [ ] Chat só para logados é aceitável?
- [ ] Qual o limite de uso por usuário (msgs/dia)?

## Critério de pronto
Chat responde em produção; sem cota ou chave inválida mostra mensagem clara; rota exige login.

## Decisões
- 2026-10-09: chat exige login (Clerk). Item 3 da proposta confirmado.
- 2026-10-09: teto de gasto proposto ao dono: US$20 de crédito limite.
