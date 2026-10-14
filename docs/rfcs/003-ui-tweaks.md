# RFC 003 — Ajustes de UI: seta em links externos, toolbox, settings, sino

Status: Draft · Prioridade: P1 · Esforço: ~0,5 dia · Bloqueio: nenhum

## Contexto
Itens de imagem/vídeo na busca são links que abrem nova aba, sem sinal visual.
Dono pediu: toolbox alinhado à esquerda (como o storage), settings como engrenagem, sino (sem notificações ainda).

## Proposta
1. **Link externo**: ícone `ArrowUpRight` (lucide) no canto do card de imagem/vídeo + `target="_blank" rel="noopener noreferrer"` + `aria-label` "abre em nova aba". Componente único `ExternalLinkBadge` reaproveitado.
2. **Toolbox à esquerda**: copiar a estrutura do menu de storage (`src/features/toolsMenu`); não criar componente novo de layout.
3. **Settings**: trocar texto por `Settings` (lucide) com `aria-label`.
4. **Sino**: `Bell` desabilitado/sem badge, `title="Em breve"`. Sem lógica. Não criar tabela de notificações agora.

## Fora de escopo
Sistema de notificações. Se vier depois, RFC própria.

## Perguntas abertas
- [ ] A seta fica sempre visível ou só no hover (mobile não tem hover)? Recomendo sempre visível.
- [ ] Sino some ou aparece desabilitado até existirem notificações?

## Critério de pronto
Visual conferido em desktop e mobile; navegação por teclado e leitor de tela com labels.

## Decisões
- 2026-10-09: seta de link externo sempre visível (mobile não tem hover).
- 2026-10-09: sino visível e desabilitado, `title="Em breve"`.

## Implementação (2026-10-09)
- `ExternalLinkBadge` em `webSearch/components`, usado em `ImagesTab` e `VideosTab` (canto superior esquerdo, `pointer-events-none`).
- `ToolsMenu`: "Manza Settings" ganhou ícone `Settings`; novo item "Notifications" com `Bell`, desabilitado, `title="Em breve"`.
- **Não feito**: "toolbox alinhado à esquerda como o storage". O pedido é ambíguo (o botão Tools já está no canto inferior esquerdo; o Filo/storage fica no direito). Confirmar com o dono o que ele quis dizer.
