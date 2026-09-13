import {
  Bot,
  Send,
  Workflow,
  KanbanSquare,
  Inbox,
  CalendarClock,
  BarChart3,
  Users,
  ShieldCheck,
  Plug,
  Sparkles,
  Timer,
} from "lucide-react";

export type Feature = {
  icon: typeof Bot;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: Bot,
    title: "Agente de IA que vende",
    description:
      "Responde, qualifica, contorna objeções e agenda sozinho, 24 horas por dia, com o tom de voz da sua empresa.",
  },
  {
    icon: Send,
    title: "Disparo em massa",
    description:
      "Campanhas com modelos aprovados pela Meta, ritmo controlado, variáveis por contato e relatório de entrega.",
  },
  {
    icon: Workflow,
    title: "Funis e chatbot visual",
    description:
      "Monte fluxos de boas-vindas, menus, qualificação e transferência para humano sem escrever uma linha de código.",
  },
  {
    icon: KanbanSquare,
    title: "CRM com pipeline",
    description:
      "Cada conversa vira uma oportunidade no quadro de negócios, com etapas, valor, responsável e histórico.",
  },
  {
    icon: Inbox,
    title: "Caixa de entrada compartilhada",
    description:
      "Toda a equipe atende do mesmo número, com atribuição, notas internas, etiquetas e respostas rápidas.",
  },
  {
    icon: CalendarClock,
    title: "Agendamentos",
    description:
      "A IA marca horários, confirma presença e dispara lembretes automáticos antes do compromisso.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de verdade",
    description:
      "Entrega, leitura, resposta, conversão por campanha e desempenho por atendente em um painel só.",
  },
  {
    icon: Users,
    title: "Equipe e permissões",
    description:
      "Dono, administrador e atendente com acessos diferentes. Cada empresa enxerga apenas os próprios dados.",
  },
  {
    icon: ShieldCheck,
    title: "API oficial da Meta",
    description:
      "Conexão pela WhatsApp Cloud API: número verificado, selo de empresa e muito menos risco de bloqueio.",
  },
];

export const differentiators = [
  {
    icon: Sparkles,
    title: "IA treinada no seu negócio",
    description:
      "Você cola seu catálogo, preços e regras de atendimento. A IA responde dentro desses limites, sem inventar.",
  },
  {
    icon: Timer,
    title: "Recuperação automática",
    description:
      "Conversa parada há X horas vira uma sequência de reengajamento. Carrinho abandonado vira nova tentativa.",
  },
  {
    icon: Plug,
    title: "Integrações abertas",
    description:
      "Webhooks de entrada e saída para conectar checkout, plataformas de curso, planilhas e o que mais você usar.",
  },
];

export type Plan = {
  id: "start" | "pro" | "escala";
  name: string;
  price: number;
  tagline: string;
  highlight?: boolean;
  limits: { numbers: number; contacts: number; messages: number; seats: number };
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "start",
    name: "Start",
    price: 97,
    tagline: "Para quem está começando a organizar o WhatsApp.",
    limits: { numbers: 1, contacts: 2000, messages: 5000, seats: 2 },
    features: [
      "1 número conectado",
      "Até 2.000 contatos",
      "5.000 mensagens por mês",
      "2 atendentes",
      "Caixa de entrada compartilhada",
      "Campanhas e etiquetas",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 247,
    tagline: "O plano de quem vive de vender no WhatsApp.",
    highlight: true,
    limits: { numbers: 3, contacts: 20000, messages: 50000, seats: 8 },
    features: [
      "3 números conectados",
      "Até 20.000 contatos",
      "50.000 mensagens por mês",
      "8 atendentes",
      "Agente de IA e funis ilimitados",
      "CRM com pipeline e metas",
      "Recuperação automática de conversas",
    ],
  },
  {
    id: "escala",
    name: "Escala",
    price: 597,
    tagline: "Operações com time grande e volume pesado.",
    limits: { numbers: 10, contacts: 200000, messages: 500000, seats: 30 },
    features: [
      "10 números conectados",
      "Até 200.000 contatos",
      "500.000 mensagens por mês",
      "30 atendentes",
      "Relatórios avançados e metas por equipe",
      "Webhooks e API para integrações",
      "Suporte prioritário",
    ],
  },
];

export const faq = [
  {
    q: "O SharkZapp usa a API oficial do WhatsApp?",
    a: "Sim. A conexão é feita pela WhatsApp Cloud API, da própria Meta. Você conecta o número da sua empresa, mantém o selo de conta comercial e reduz muito o risco de bloqueio comparado a soluções que leem o QR Code por fora.",
  },
  {
    q: "Consigo disparar mensagens para toda a minha lista?",
    a: "Consegue, respeitando as regras da Meta: mensagens iniciadas pela empresa precisam usar um modelo aprovado e ir para contatos que aceitaram receber. Dentro da janela de 24 horas após a resposta do cliente, você envia mensagens livres.",
  },
  {
    q: "Preciso saber programar para montar os fluxos?",
    a: "Não. Os funis são montados por blocos: mensagem, pergunta, condição, etiqueta, espera e transferência para um atendente humano.",
  },
  {
    q: "Vários atendentes podem usar o mesmo número?",
    a: "Sim. A caixa de entrada é compartilhada, com atribuição de conversas, notas internas e histórico completo por contato.",
  },
  {
    q: "Meus dados ficam separados de outras empresas?",
    a: "Ficam. Cada conta tem seu próprio espaço e as permissões de acesso são aplicadas direto no banco de dados.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. A assinatura é mensal, sem fidelidade, e você continua com acesso até o fim do período já pago.",
  },
];

export const comparison = [
  { label: "API oficial da Meta", shark: true, others: "Depende" },
  { label: "Agente de IA incluído no plano", shark: true, others: "Cobrado à parte" },
  { label: "CRM com pipeline visual", shark: true, others: "Limitado" },
  { label: "Caixa de entrada com vários atendentes", shark: true, others: "Somente planos altos" },
  { label: "Relatório de entrega e conversão por campanha", shark: true, others: "Básico" },
  { label: "Webhooks abertos para integração", shark: true, others: "Não" },
];

export const integrations = [
  { name: "WhatsApp Cloud API", description: "Envio e recebimento oficial de mensagens." },
  { name: "Webhooks", description: "Envie eventos do SharkZapp para qualquer sistema." },
  { name: "Planilhas", description: "Importe e exporte contatos em CSV." },
  { name: "Checkouts", description: "Receba vendas e dispare confirmação automática." },
  { name: "Plataformas de curso", description: "Boas-vindas e avisos para novos alunos." },
  { name: "Agenda", description: "Confirmações e lembretes de compromisso." },
];
