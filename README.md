# Manza Search

Escopo & objetivo

1. Qual o objetivo principal do chatbot? (suporte ao usuário, busca de conteúdo, vendas, engajamento, FAQ)
2. Que tipo de pergunta ele precisa responder? Dá exemplos reais.
3. Vai substituir algum canal atual (ex: o messenger humano) ou conviver com ele?
4. Tem métrica de sucesso? (reduzir tickets, tempo de resposta, conversão)

Conhecimento & conteúdo

5. O bot responde só conhecimento geral, ou precisa saber sobre o conteúdo do site (posts, articles, dicionário)?
6. Se sobre o site: pode acessar o conteúdo todo ou só partes públicas?
7. Tem documentos/base de conhecimento própria pra alimentar ele? (PDFs, planilhas, FAQ existente)
8. Com que frequência esse conteúdo muda?
9. Tem tópicos que o bot não pode falar / deve recusar?

Usuários & acesso

10. Quem usa? Só usuário logado (Clerk) ou visitante anônimo também?
11. Tem limite de uso por usuário? (controle de custo)
12. Precisa de idiomas além de português?
13. O bot tem personalidade/tom definido? (formal, casual, marca)

Dados & histórico

14. Precisa salvar o histórico das conversas? Por quanto tempo?
15. Quem pode ver o histórico? (só o usuário, admin, ninguém)
16. Tem requisito de privacidade/LGPD sobre os dados das conversas?
17. Pode usar as conversas pra treinar/melhorar? (Mistral tem política de retenção)

Funcionalidade

18. Só responde texto, ou precisa de ações? (abrir página, preencher form, criar ticket, buscar no site)
19. Precisa escalar pra humano quando não souber responder?
20. Precisa enviar imagens/arquivos? Receber?
21. Onde aparece na tela? (botão flutuante, página dedicada, dentro do menu)

Modelo & custo

22. Tem preferência ou restrição de qual modelo Mistral? (custo vs qualidade)
23. Quem paga/gerencia a conta Mistral — cliente ou nós? Tem chave de API?
24. Tem orçamento/teto mensal pra gastos de IA?
25. Tem requisito de onde os dados são processados? (Mistral é EU — bom pra LGPD/GDPR)

Prazo & operação

26. Qual o prazo esperado? Tem fase MVP vs versão completa?
27. Quem mantém o "system prompt" / comportamento depois? (nós ou time do cliente via painel?)
28. Precisa de painel pra editar respostas/comportamento sem código?
