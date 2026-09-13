# SharkZapp — plataforma de automação de WhatsApp

Uma plataforma completa de vendas e atendimento no WhatsApp: site de vendas público + painel real com contas de usuário, conexão oficial com a Meta, campanhas, chatbot, CRM e assinaturas pagas.

## Como vamos entregar (por fases)

Cada fase é entregue funcionando e testada antes da próxima.

### Fase 1 — Identidade e site público
- Escolha da direção visual: mostro 3 conceitos e você escolhe (tema tubarão, escuro e agressivo é o ponto de partida).
- Páginas: Início, Funções, Planos, Integrações, Perguntas frequentes, Contato.
- Conteúdo comercial completo (benefícios, provas sociais, comparativo, FAQ), textos em português.
- Cadastro/login de contas.

### Fase 2 — Painel e dados
- Área logada com: Conexões do WhatsApp, Contatos e etiquetas, Caixa de entrada compartilhada, Campanhas (disparos), Funis/Chatbot, CRM com quadro de negócios, Agendamentos, Relatórios, Equipe, Configurações.
- Tudo salvo em banco de dados, separado por empresa/conta, com permissões (dono, admin, atendente).

### Fase 3 — WhatsApp oficial (Meta Cloud API)
- Conexão da conta Meta pelo painel (número, token, verificação).
- Recebimento de mensagens em tempo real via webhook.
- Envio de mensagens e modelos aprovados, status de entrega/leitura.
- Fila e ritmo de envio nas campanhas, respeitando as regras da Meta.

### Fase 4 — Atendimento automático com IA
- Construtor de fluxos (boas-vindas, menu, qualificação, transferência para humano).
- Agente de IA que responde, qualifica leads e agenda, com base no material da empresa.
- Remarketing/recuperação de conversas paradas.

### Fase 5 — Assinaturas
- Planos (ex.: Start, Pro, Escala) com cobrança recorrente online e período de teste.
- Bloqueio de recursos e limites conforme o plano contratado.

### Fase 6 — Testes
- Testes automatizados dos fluxos principais e navegação real no site simulando um cliente: cadastro, conexão, criação de campanha, conversa, pagamento em ambiente de teste.
- Correção de tudo que falhar antes de considerar pronto.

## O que preciso de você no caminho
- Acesso à sua conta Meta Business para ativar o envio real (número verificado e aprovado pela Meta).
- Confirmação dos nomes, preços e limites dos planos.
- Logotipo, se já tiver.

## Detalhes técnicos
- TanStack Start + React + Tailwind, com sistema de design próprio (tokens semânticos).
- Lovable Cloud (banco, autenticação, arquivos) com RLS por organização; papéis em tabela separada.
- Server functions para lógica interna; rota pública `/api/public/whatsapp-webhook` com verificação de assinatura da Meta para os eventos do WhatsApp.
- Envio em massa por fila com processamento em lotes e agendamento.
- IA pela Lovable AI Gateway.
- Pagamentos pela integração nativa (requer plano Pro); produtos e checkout criados após ativação.
- SEO por rota: título, descrição e prévia social próprios em cada página.

## Observações honestas
- Disparo em massa pela API oficial só funciona com modelos de mensagem aprovados pela Meta e para contatos que aceitaram receber; isso é limite da Meta, não do sistema.
- Preços, números e depoimentos serão preenchidos com exemplos até você me passar os reais.
