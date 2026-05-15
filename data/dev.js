const SKILLS_DEV = [
  {
    id: 'frontend-design',
    name: 'Frontend Design',
    command: '/frontend-design',
    category: 'dev', icon: 'monitor', type: 'especialista',
    description: 'Guia a criação de interfaces frontend com código real e estética diferenciada — evita "AI slop". Define direção conceitual forte antes de codificar: tipografia, cor, movimento, composição espacial.',
    outcome: 'Componente ou página frontend funcional com código real, design com ponto-de-vista estético deliberado, microinterações, fontes não-genéricas e escolhas visuais que fogem dos padrões de IA.',
    triggers: ['criar interface', 'componente frontend', 'UI diferenciada', 'evitar ai slop', 'design de qualidade', 'interface não genérica', 'landing page'],
    relations: [
      { id: 'interface-design',      rel: 'complementar — interface-design foca em craft de sistema' },
      { id: 'figma-implement-design', rel: 'implementa em código o design que vem do Figma' },
    ],
    fullText: `This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

ANTES de codificar: defina uma direção estética BOLD:
- Propósito: Que problema resolve? Quem usa?
- Tom: escolha um extremo — brutalmente minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial, brutalist/raw, art deco, soft/pastel, industrial/utilitarian...
- Diferenciação: O que torna isso INESQUECÍVEL?

Diretrizes estéticas:
- Tipografia: fontes únicas e interessantes. EVITE Arial, Inter, Roboto. Pare fontes display com body fonts refinadas.
- Cor: commit a uma paleta coesa. Cores dominantes com accents pontuais superam paletas timidamente distribuídas.
- Movimento: CSS-only para HTML, Motion library para React. Foque em momentos de alto impacto (page load com staggered reveals) em vez de micro-interações dispersas.
- Composição: assimetria, overlap, diagonal flow, elementos que quebram o grid.

NUNCA: gradientes purple em fundo branco, Space Grotesk como padrão, layouts previsíveis.`,
  },
  {
    id: 'interface-design',
    name: 'Interface Design',
    command: '/interface-design',
    category: 'dev', icon: 'panel-left', type: 'especialista',
    description: 'Constrói design de interface com craft e consistência para dashboards, admin panels, SaaS e ferramentas. Força intenção em cada decisão — tipografia, navegação, dados, tokens — antes de codificar.',
    outcome: 'Interface de ferramenta com system.md salvo para consistência futura, layering sutil correto (bordas, sombras, elevação de superfície), hierarquia tipográfica em 4 níveis, todos os estados implementados.',
    triggers: ['dashboard', 'admin panel', 'saas interface', 'interface com craft', 'design de sistema', 'tool design', '/interface-design'],
    relations: [
      { id: 'frontend-design', rel: 'frontend-design para landing pages e marketing' },
      { id: 'figma-ds',        rel: 'usa design system como base de tokens' },
    ],
    fullText: `Build interface design with craft and consistency.
Use for: Dashboards, admin panels, SaaS apps, tools, settings pages. NOT for landing pages (use /frontend-design).

O problema: você vai gerar output genérico. Seu treinamento viu milhares de dashboards.

Onde os defaults se escondem:
- Tipografia parece container → mas IS o design
- Navegação parece scaffold → mas IS o produto
- Dados parecem apresentação → mas precisam contar história
- Token names parecem detalhe de implementação → mas são decisões de design

Intent First — antes de tocar código, responda:
- Quem é essa pessoa? (não "usuários" — a pessoa real)
- O que ela precisa FAZER? (o verbo específico)
- Como isso deve PARECER? (palavras que significam algo — não "clean e modern")

Subtle Layering — o backbone do craft:
- Superfícies empilham. Build um sistema numerado de elevação.
- Bordas: rgba de baixa opacidade. Sólidas parecem harsh.
- Inputs: levemente mais escuros que o entorno (inset).
- Squint test: hierarchy deve ser perceptível embaçando os olhos. Nada deve saltar.`,
  },
];
