const SKILLS_SISTEMA = [
  {
    id: 'obsidian-note',
    name: 'Obsidian Note',
    command: '/obsidian-note',
    category: 'sistema', icon: 'file-text', type: 'util',
    description: 'Cria uma nota no vault Obsidian transformando o conteúdo da conversa em markdown estruturado. Detecta o tipo de nota (Reunião, Discovery, Checkpoint, Pesquisa), escaneia as pastas e salva no lugar certo.',
    outcome: 'Nota salva no Obsidian com frontmatter correto (tags, data, área), estrutura por tipo detectado, cross-reference com Dream do dia via [[links]], nome de arquivo no padrão do vault.',
    triggers: ['salvar no obsidian', 'criar nota', 'registrar no vault', '/obsidian-note', 'salvar reunião', 'salvar discovery'],
    relations: [
      { id: 'pd-master-agent', rel: 'é chamada via /output para salvar documentos' },
      { id: 'pd-workshop',     rel: 'é chamada ao encerrar workshop (protocolo de output)' },
      { id: 'dream',           rel: 'cross-reference mútuo via [[links]] ao salvar' },
    ],
    fullText: `Você vai criar uma nota no vault Obsidian transformando o conteúdo da conversa em arquivo markdown bem estruturado, no lugar certo.

Tipos de nota detectados:
- Reunião: Participantes, Decisões, Citações (#citações), Ações (#acao), Dúvidas (#duvidas), Próxima reunião
- Discovery: Contexto, Estado inicial, O que aprendemos, Mapa de Incertezas (SABEMOS / SUSPEITAMOS / NÃO SABEMOS / NÃO PODEMOS SABER AINDA), Próximos passos
- Checkpoint: O que foi decidido, O que está incerto, O que mudou, Citações, Próximos passos
- Pesquisa: Fontes, Achados, O que confirma, O que contradiz, Implicações

Frontmatter padrão:
---
tags: [tag-principal, tag-secundária]
data e hora: YYYY-MM-DD
Area: Área / Subárea
---

Nome do arquivo: [Tipo] [Tema] - DD-MM-AA.md

Cross-reference com Dream: após criar a nota, verifica se existe entrada Dream do dia relacionada e adiciona [[links]] nos dois sentidos.`,
  },
];
