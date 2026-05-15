const SKILLS_MEMORIA = [
  {
    id: 'dream',
    name: 'Dream',
    command: '/dream',
    category: 'memoria', icon: 'brain', type: 'memoria',
    description: 'Sistema de memória leve entre conversas. Registra resumos de chats no Obsidian — um arquivo por dia com múltiplas seções. Se houver um session-handoff no contexto, usa-o como fonte; senão, gera um internamente.',
    outcome: 'Resumo salvo em Dream YYYY-MM-DD.md com horário, tópicos-chave e [[links]] para notas relacionadas do vault (prioridade: entradas Dream anteriores > notas do vault > nenhum link). Recuperação por data ou busca por assunto.',
    triggers: ['lembra dessa conversa', 'salvar contexto', 'memória entre chats', 'continuar depois', '/dream', '/dream saved', 'registrar sessão no obsidian'],
    relations: [
      { id: 'obsidian-note',    rel: 'cross-reference mútuo — dream é índice, obsidian-note é detalhe' },
      { id: 'session-handoff',  rel: 'usa session-handoff como fonte quando disponível no contexto' },
    ],
    fullText: `Sistema de memória leve do usuário. Pasta fixa: /Obsidian Vault/01 - Projetos/Pessoal/Dream/
Formato: Dream YYYY-MM-DD.md — um arquivo por dia, múltiplos chats dentro.

Modo 1 — /dream (salvar):
1. Verifica se arquivo do dia existe (append se sim, cria se não)
2. Verifica se há session-handoff no contexto:
   - Se sim: usa título e decisões do handoff como fonte (não reanalisar a conversa toda)
   - Se não: gera internamente um mini-handoff (sem exibir) e usa como estrutura
3. Links — prioridade 1: entradas Dream anteriores sobre o mesmo tema (grep na pasta Dream)
   Prioridade 2: notas do vault com nome relacionado (find no vault, excluindo .claude/)
   Prioridade 3: omite linha de links se não encontrar nada relevante
4. Escreve seção: ## HH:MM — [Título] + bullets + 🔗 [[links]]
5. Confirmação: "Salvo em Dream [data] — '[Título]'"

Modo 2 — /dream saved (ler):
- Lista todos os arquivos Dream por data (mais recente primeiro)
- Mostra títulos de seções (## HH:MM — ...)
- Aguarda o usuário escolher qual abrir

Modo 3 — busca por assunto: grep nos arquivos Dream por termo, mostra seção mais próxima do match.

Princípios: nunca crie arquivo por chat (sempre um por dia). Links são o valor real. Seja rápido — confirmação em uma linha.`,
  },
  {
    id: 'session-handoff',
    name: 'Session Handoff',
    command: '/session-handoff',
    category: 'memoria', icon: 'link-2', type: 'util',
    description: 'Produz um resumo estruturado de fim de sessão para que o usuário possa /clear e iniciar um novo agente sem perder continuidade. Output em chat, no idioma do usuário.',
    outcome: 'Artefato de handoff com: ponto de partida, decisões tomadas + o que foi entregue, arquivos-chave, estado em execução (processos background, portas, worktrees), verificações e pendências. Termina sempre com oferta de salvar no Obsidian via /dream.',
    triggers: ['transferir', 'resumir sessão', 'vou dar /clear', 'vou limpar o contexto', 'transferir sessão', 'handoff', 'session-handoff'],
    relations: [
      { id: 'dream', rel: 'ao final, oferece registrar a sessão no Obsidian via /dream' },
    ],
    fullText: `Produz resumo de fim de sessão — o público é um agente futuro, não stakeholder. Output em chat, nunca em arquivo.

Estrutura fixa (traduzida para o idioma do usuário):
# Transferência de Sessão — [título de uma linha]
## Ponto de partida — o que foi pedido e constraints principais
## Decisões tomadas e o que foi entregue — decisão: motivo + path absoluto
## Arquivos-chave para a próxima sessão — paths absolutos + por que ler primeiro
## Estado atual — processos background (shell IDs), portas, worktrees ou "nenhum"
## Verificação — comando + resultado esperado
## Pendências e perguntas abertas — deferidos + perguntas sem resposta
## Por onde continuar — 1-2 frases para o próximo agente

Regras críticas:
- Output em chat apenas. Nunca escreve arquivo.
- Paths sempre absolutos.
- Seções vazias recebem "nenhum" — nunca omitir.
- Sem emojis, sem hype — tom de engenheiro passando plantão.
- IDs de processos background são críticos — listar com kill command.
- Ao final: "Quer também registrar essa sessão no Obsidian com /dream?"`,
  },
];
