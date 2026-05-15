const SKILLS_FIGMA = [
  {
    id: 'figma-use',
    name: 'Figma Use',
    command: '/figma-use',
    category: 'figma', icon: 'pen-tool', type: 'util',
    description: 'Prerequisito OBRIGATÓRIO antes de qualquer chamada use_figma. Define as regras críticas da Plugin API — retorno via return, reset de página, cores em range 0–1, carregamento de fonte, etc.',
    outcome: 'Execução segura e correta de scripts no canvas do Figma: criar/editar/deletar nós, variáveis, tokens, componentes, auto-layout, fills, inspeção de estrutura.',
    triggers: ['criar no figma', 'editar figma', 'use_figma', 'escrever no figma', 'plugin api', 'figma canvas'],
    relations: [
      { id: 'figma-generate-design',  rel: 'é prerequisito obrigatório para esta skill' },
      { id: 'figma-generate-library', rel: 'é prerequisito obrigatório para esta skill' },
      { id: 'figma-ds',               rel: 'é prerequisito obrigatório para esta skill' },
    ],
    fullText: `MANDATORY prerequisite — carregue ANTES de todo use_figma call.

Regras críticas:
1. Use return para enviar dados (não figma.closePlugin())
2. Código NÃO envolto em async IIFE — é auto-wrapped
3. Cores em range 0–1 (não 0–255): {r:1, g:0, b:0} = vermelho
4. Fills/strokes são arrays read-only — clone, modifique, reatribua
5. Font DEVE ser carregada antes de qualquer texto: await figma.loadFontAsync({family, style})
6. Troca de página: await figma.setCurrentPageAsync(page) — o setter síncrono NÃO funciona
7. layoutSizingHorizontal/Vertical = 'FILL' deve ser setado APÓS parent.appendChild(child)
8. figma.notify() lança "not implemented" — nunca use
9. Em erro: PARE, não faça retry imediato. Scripts são atômicos — erro = nada executado
10. SEMPRE retorne os IDs de todos os nós criados/mutados

Workflow incremental: inspecione → crie tokens → crie componentes → componha layouts → valide com get_screenshot.`,
  },
  {
    id: 'figma-generate-design',
    name: 'Figma Generate Design',
    command: '/figma-generate-design',
    category: 'figma', icon: 'layout', type: 'especialista',
    description: 'Traduz uma página, view ou layout de app para o Figma usando componentes e tokens do design system. Descobre e importa a library existente — não cria valores hardcoded.',
    outcome: 'Tela ou página completa no Figma com instâncias reais de componentes do design system, variáveis vinculadas (cores, spacing) e text/effect styles — fiel ao código ou descrição fornecida.',
    triggers: ['criar tela no figma', 'push para figma', 'criar screen', 'build landing no figma', 'traduzir código para figma', 'write to figma'],
    relations: [
      { id: 'figma-use', rel: 'é prerequisito obrigatório — carregue junto' },
      { id: 'figma-ds',  rel: 'usa componentes e tokens do design system' },
    ],
    fullText: `Use this skill alongside figma-use to create full-page screens in Figma reusing the published design system — components, variables, and styles — rather than drawing primitives with hardcoded values.

Workflow obrigatório (não pule etapas):
1. Entenda o screen: leia o código fonte, identifique seções e componentes
2. Descubra o design system: componentes via search_design_system ou inspeção de telas existentes; variáveis via inspect de bound variables; styles via figma.getStyleById
3. Crie o frame wrapper PRIMEIRO (auto-layout vertical, HUG)
4. Construa cada seção dentro do wrapper — uma por vez, uma use_figma call por seção
5. Valide com get_screenshot após cada seção (procure texto cortado e overlaps)
6. NUNCA use valores hardcoded de cor ou spacing quando existem variáveis no DS

IMPORTANTE: mova o wrapper para longe de (0,0) — escaneie children da página para encontrar espaço livre.`,
  },
  {
    id: 'figma-generate-library',
    name: 'Figma Generate Library',
    command: '/figma-generate-library',
    category: 'figma', icon: 'layers', type: 'especialista',
    description: 'Constrói ou atualiza um design system profissional no Figma a partir de um codebase. Ensina O QUE construir e EM QUE ORDEM — com checkpoints obrigatórios de aprovação entre as fases.',
    outcome: 'Design system completo: variáveis/tokens com scopes e code syntax, library de componentes com auto-layout e variant bindings, temas (light/dark), documentação de foundations por página.',
    triggers: ['criar design system figma', 'library de componentes', 'variáveis no figma', 'tokens figma', 'temas light dark', 'construir DS do zero'],
    relations: [
      { id: 'figma-use', rel: 'é prerequisito obrigatório — ensina COMO chamar a API' },
    ],
    fullText: `Build professional-grade design systems in Figma that match code.

REGRA FUNDAMENTAL: Isto NUNCA é uma tarefa one-shot. Exige 20–100+ use_figma calls com checkpoints de aprovação entre as fases. Toda tentativa de fazer em uma call produzirá resultados quebrados.

Fases obrigatórias:
Phase 0: DISCOVERY — analise codebase, inspecione arquivo Figma, pesquise libraries, defina escopo v1, mapeie code→Figma. ✋ CHECKPOINT
Phase 1: FOUNDATIONS — collections + modos, variáveis primitivas, variáveis semânticas, scopes em TODAS as variáveis, code syntax em TODAS. ✋ CHECKPOINT
Phase 2: FILE STRUCTURE — páginas skeleton, documentação de foundations. ✋ CHECKPOINT
Phase 3: COMPONENTS — um por vez, na ordem de dependência (átomos antes de moléculas). ✋ CHECKPOINT por componente
Phase 4: INTEGRATION + QA — Code Connect, acessibilidade, naming audit, bindings audit.

Nunca paralelizar use_figma calls. Nunca adivinhar Node IDs — sempre ler do return da call anterior.`,
  },
  {
    id: 'figma-implement-design',
    name: 'Figma Implement Design',
    command: '/figma-implement-design',
    category: 'figma', icon: 'sliders', type: 'especialista',
    description: 'Traduz designs do Figma em código de produção com fidelidade visual 1:1. Lê o arquivo Figma via MCP, extrai tokens e especificações, e gera componentes no framework do projeto.',
    outcome: 'Código de produção (React, Vue, etc.) fiel ao design Figma, usando tokens do design system, estados implementados (hover, focus, disabled, loading, error), responsivo e acessível.',
    triggers: ['implementar design', 'gerar código do figma', 'implement design', 'figma para código', 'figma URL', 'implement component', 'pixel perfect'],
    relations: [
      { id: 'figma-use',             rel: 'usa figma-use para leitura complexa do canvas' },
      { id: 'figma-code-connect',    rel: 'complementar para mapear componentes' },
      { id: 'figma-generate-design', rel: 'direção inversa — esta gera código, generate-design gera tela' },
    ],
    fullText: `Translates Figma designs into production-ready application code with 1:1 visual fidelity.

Workflow obrigatório:
1. Parse da URL Figma: extraia fileKey e nodeId (converta hifens em colons: 1234-5678 → 1234:5678)
2. Fetch design context: get_design_context(fileKey, nodeId) — layout, tipografia, cores, tokens, estrutura
3. Analise o design system: mapeie tokens de cor, spacing e tipografia para variáveis do código
4. Implemente componente a componente, verificando:
   - Todos os estados (default, hover, active, focus, disabled, loading, error, empty)
   - Responsividade (breakpoints do design system)
   - Acessibilidade (aria-labels, roles, contraste)
5. Valide visualmente contra o design original

Use design tokens do codebase (não hex hardcoded). Se get_design_context for muito grande, use get_metadata para mapa de alto nível e depois fetche nós específicos.`,
  },
  {
    id: 'figma-ds',
    name: 'Figma DS',
    command: '/figma-ds',
    category: 'figma', icon: 'palette', type: 'especialista',
    description: 'Agente especializado em Design Systems dentro do Figma. Cria, evolui e documenta sistemas de design partindo de Shadcn, Ant Design, library existente ou do zero — sem valores hardcoded.',
    outcome: 'Design system documentado e evolutivo: componentes com auto-layout e variants, variáveis de cor/spacing/tipografia, nomenclatura semântica, estados completos (default/hover/focus/disabled/loading/error).',
    triggers: ['design system figma', 'criar DS', 'evoluir design system', 'shadcn', 'ant design', 'tokens de cor', 'variáveis figma', 'componentes figma'],
    relations: [
      { id: 'figma-use',              rel: 'é prerequisito obrigatório para operações no canvas' },
      { id: 'figma-generate-library', rel: 'complementar — define O QUÊ e em qual ORDEM' },
    ],
    fullText: `Você é um agente especializado em Design Systems dentro do Figma.

Detecção de contexto SEMPRE antes de qualquer operação:
1. Existe Figma library publicada conectada? (sim/não)
2. Existe codebase? Qual framework?
3. Qual a base: SHADCN / ANT DESIGN / FIGMA EXISTENTE / DO ZERO?

Regras universais (nunca violadas):
Nomenclatura: componentes em Categoria/Variante/Tamanho (ex: Button/Primary/Large). Variáveis: color/brand/primary, spacing/sm, typography/heading/h1. Nunca Frame 1, Group 5, Rectangle 3.

Estrutura: Auto Layout em TODOS os frames. Variants para estados: default, hover, focused, disabled, loading, error. Configure constraints e resizing intencionalmente em todo elemento.

Tokens: NUNCA use valores hardcoded para cor, spacing ou tipografia. Se a variável não existe, crie-a primeiro.

Qualidade: capture screenshot após criar qualquer elemento. Se houver discrepância: itere na estrutura Figma.`,
  },
  {
    id: 'figma-code-connect',
    name: 'Figma Code Connect',
    command: '/figma-code-connect',
    category: 'figma', icon: 'link-2', type: 'util',
    description: 'Cria e mantém arquivos Figma Code Connect (.figma.ts) que mapeiam componentes Figma ao código real do projeto, facilitando o handoff design-dev.',
    outcome: 'Arquivos .figma.ts com mapeamento fidedigno componente Figma → snippet de código, incluindo props, variantes e exemplos de uso. Baseado em get_code_connect_suggestions do MCP.',
    triggers: ['code connect', 'mapear componentes figma', '.figma.ts', '.figma.js', 'design to code', 'figma component mapping'],
    relations: [
      { id: 'figma-implement-design', rel: 'complementar — implement-design gera código, code-connect mapeia' },
      { id: 'figma-ds', rel: 'documenta os componentes do design system' },
    ],
    fullText: `Cria arquivos .figma.ts (Code Connect templates) que mapeiam componentes Figma a snippets de código.

Prerequisitos:
- Figma MCP server conectado
- Componentes publicados na Figma team library
- URL com node-id: figma.com/design/:fileKey/:name?node-id=X-Y
- Plano Organization ou Enterprise (Code Connect não disponível no Free/Pro)

Workflow:
1. Parse da URL: fileKey + nodeId (hifens → colons: 4185-3778 → 4185:3778)
2. get_code_connect_suggestions para descobrir componentes não mapeados
3. Para cada componente: inspecione props, variantes e estados
4. Gere o .figma.ts com mapeamento fiel às props do componente de código
5. Valide: o snippet deve refletir o uso real do componente no projeto

Nota: cobre apenas template files (.figma.ts). Para arquivos parser-based (.figma.tsx com figma.connect() via CLI), o processo é diferente.`,
  },
  {
    id: 'figma-create-design-system-rules',
    name: 'Figma DS Rules',
    command: '/figma-create-design-system-rules',
    category: 'figma', icon: 'ruler', type: 'util',
    description: 'Gera regras customizadas de design system para o codebase do projeto. Cria CLAUDE.md, AGENTS.md ou .cursor/rules com convenções específicas para workflows Figma-to-code.',
    outcome: 'Arquivo de regras (CLAUDE.md ou equivalente) com: quais primitivos usar, onde ficam os componentes, como nomear, o que nunca hardcodar, como tratar tokens e padrões arquiteturais do projeto.',
    triggers: ['criar regras de design system', 'generate rules', 'setup figma guidelines', 'customizar design system', 'convenções figma para código'],
    relations: [
      { id: 'figma-ds',              rel: 'documenta as regras do design system criado' },
      { id: 'figma-implement-design', rel: 'as regras guiam todas as implementações' },
    ],
    fullText: `Gera regras customizadas de design system para o projeto do usuário.

Arquivos suportados:
- Claude Code → CLAUDE.md
- Codex CLI → AGENTS.md
- Cursor → .cursor/rules/figma-design-system.mdc

O que são design system rules: instruções em nível de projeto que codificam o conhecimento tácito do codebase — o tipo de expertise que devs experientes passariam para novos membros.

Conteúdo das regras:
- Quais layout primitives e componentes usar
- Onde ficam os arquivos de componentes
- Como nomear e estruturar componentes
- O que NUNCA hardcodar
- Como tratar design tokens e styling
- Padrões arquiteturais do projeto

Prerequisito: Figma MCP server conectado e acesso ao codebase para análise.

Uso típico: ao iniciar projeto com Figma, ao onboarding de agente de IA em projeto existente, ou ao padronizar workflows Figma-to-code no time.`,
  },
];
