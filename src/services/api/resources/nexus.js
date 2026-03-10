import { useConfig } from '@/store/modules/config';
import nexusHttp from '@/services/api/nexusHttp';

export default {
  async getAgentsTeam() {
    const { project } = useConfig();
    return {
      manager: {
        external_id: '',
      },
      agents: [
        {
          uuid: '46801b83-a4d6-47ef-aba0-837b57f48d04',
          id: 'technical_assistance',
          name: 'Assistencia tecnica',
          skills: [
            {
              icon: '',
              name: 'Get Info by SKU',
              agent: '46801b83-a4d6-47ef-aba0-837b57f48d04',
              unique_name: 'get_info_byskuid-204',
            },
            {
              icon: '',
              name: 'Get Info by brand',
              agent: '46801b83-a4d6-47ef-aba0-837b57f48d04',
              unique_name: 'get_info_by_name-204',
            },
          ],
          is_official: false,
          description:
            'Agente que fornece informações telefônicas e/ou e-mail para assistência técnica especializada no produto ou marca escolhida pelo cliente.',
          mcp: null,
        },
        {
          uuid: '7011b6f4-d946-41e1-8b42-a1c53abcec0e',
          id: 'protocol_agent_televendas',
          name: 'Agente de triagem do atendimento Televendas',
          skills: [
            {
              icon: '',
              name: 'Triagem Televendas',
              agent: '7011b6f4-d946-41e1-8b42-a1c53abcec0e',
              unique_name: 'triagem-209',
            },
          ],
          is_official: false,
          description:
            'Agente responsável por fazer a triagem coletando CEP, modalidade de compra (entrega ou retirada) e forma de pagamento antes de transferir para o atendimento humano do setor Televendas',
          mcp: null,
        },
        {
          uuid: '5b27dc49-a81d-44a6-a9d8-e882a4f8aada',
          id: 'feedback_recorder_2',
          name: 'Feedback Recorder 2.0',
          skills: [
            {
              icon: '',
              name: 'Collect CSAT',
              agent: '5b27dc49-a81d-44a6-a9d8-e882a4f8aada',
              unique_name: 'collect_csat-402',
            },
            {
              icon: '',
              name: 'Record Subject',
              agent: '5b27dc49-a81d-44a6-a9d8-e882a4f8aada',
              unique_name: 'record_subject-402',
            },
          ],
          is_official: true,
          description:
            "This agent handles feedback collection at the end of conversations. KEY COLLABORATION INSTRUCTIONS: 1) Manager must call this agent when a conversation appears to be ending (user sends thank you messages or indicates they're done); 2) This agent should INSTRUCT THE MANAGER to ask the user for a CSAT rating, then WAIT for the user's response, then CALL THE COLLECT_CSAT TOOL with that rating; 3) This agent implicitly determines the conversation subject without asking the user and calls the record_subject tool; 4) All collected information updates the user's contact fields automatically; 5) Never interrupt ongoing productive conversations - only activate when conversation is clearly concluding.",
          mcp: null,
        },
        {
          uuid: '75bf27ed-262d-4a5e-bcc6-cf1aa6829e89',
          id: 'nps_recorder',
          name: 'NPS Recorder',
          skills: [
            {
              icon: '',
              name: 'Collect NPS',
              agent: '75bf27ed-262d-4a5e-bcc6-cf1aa6829e89',
              unique_name: 'collect_nps-403',
            },
          ],
          is_official: true,
          description:
            "This agent handles NPS (Net Promoter Score) collection at the end of conversations. KEY COLLABORATION INSTRUCTIONS: 1) Manager must call this agent when a conversation appears to be ending (user sends thank you messages or indicates they're done); 2) This agent should INSTRUCT THE MANAGER to ask the user for a NPS rating (likelihood to recommend the company on a scale of 0-10), then WAIT for the user's response, then CALL THE COLLECT_NPS TOOL with that rating; 3) This agent implicitly determines the conversation subject without asking the user and calls the record_subject tool; 4) All collected information updates the user's contact fields automatically; 5) Never interrupt ongoing productive conversations - only activate when conversation is clearly concluding.",
          mcp: null,
        },
        {
          uuid: '09f42caa-ef6a-4593-bb31-4c7118213f7a',
          id: 'store_clerk',
          name: 'Balconista de Loja',
          skills: [
            {
              icon: '',
              name: 'Nota/Cupom Fiscal (Loja Física)',
              agent: '09f42caa-ef6a-4593-bb31-4c7118213f7a',
              unique_name: 'get_invoice-1038',
            },
            {
              icon: '',
              name: 'Consulta informações de lojas',
              agent: '09f42caa-ef6a-4593-bb31-4c7118213f7a',
              unique_name: 'get_information-1038',
            },
          ],
          is_official: false,
          description:
            '# Nome e Colaboração\n  * Nome do agente: Balconista de Loja\n  * Este agente NÃO interage diretamente com o usuário final.\n  * Ele colabora com o agente orquestrador "Manager" e responde exclusivamente ao Manager para ajudar no atendimento.\n\n# Objetivo do Agente (via Manager)\n  * Apoiar o Manager em demandas relacionadas a lojas físicas.\n  * Tratar de segunda via de compras realizadas em lojas físicas, disponibilizando Nota/Cupom fiscal com base na data informada.\n  * Localizar informações de unidades/lojas físicas por cidade e bairro\n  * Entrega respostas claras para o Manager repassar ao usuário, com orientações e próximos passos.\n\n# Observações Importantes\n  * Sempre informe ao Manager a data utilizada na busca.\n  * Sempre apresente a Chave da Nota e o LINK_SEFAZ para consulta.\n',
          mcp: null,
        },
        {
          uuid: '1a1ba47f-1b5d-4c29-b0c1-cc5e44d217dc',
          id: 'authenticator',
          name: 'Autenticador de Usuários',
          skills: [
            {
              icon: '',
              name: 'Obter Usuário Autenticado',
              agent: '1a1ba47f-1b5d-4c29-b0c1-cc5e44d217dc',
              unique_name: 'get_user-994',
            },
            {
              icon: '',
              name: 'Enviar Código de Autenticação por E-mail',
              agent: '1a1ba47f-1b5d-4c29-b0c1-cc5e44d217dc',
              unique_name: 'get_code-994',
            },
            {
              icon: '',
              name: 'Efetuar Login (Validar Código)',
              agent: '1a1ba47f-1b5d-4c29-b0c1-cc5e44d217dc',
              unique_name: 'get_login-994',
            },
          ],
          is_official: false,
          description:
            '# Nome e Colaboração\n  * Nome do agente: Autenticador de Usuários\n  * Este agente NÃO interage diretamente com o usuário final.\n  * Ele colabora com o agente orquestrador chamado "Manager", respondendo exclusivamente ao Manager com orientações, decisões e chamadas de ferramenta necessárias para autenticar o usuário e consultar seus dados.\n\n# Objetivo do Agente (via Manager)\n  * Auxiliar o Manager a autenticar o usuário por e-mail (envio de código e validação do código).\n  * Informar ao Manager o status de autenticação atual e, quando autenticado, retornar os dados do usuário.\n  * Fornecer ao Manager mensagens claras e prontas para repassar ao usuário, além de próximos passos práticos.\n\n# Fluxo de Orquestração (sugerido)\n  1) Verificação inicial: ESTE AGENTE chama [tool: get_user] para saber se o usuário já está autenticado no canal atual (contact_urn).\n  2) Se NÃO estiver autenticado: se houver um e‑mail válido disponível (contexto ou informado pelo Manager), ESTE AGENTE chama [tool: get_code] imediatamente para enviar o código. Se o e‑mail não estiver disponível, ESTE AGENTE pede ao Manager que colete o e‑mail com o usuário e retorne para envio do código.\n  3) Após código enviado: ESTE AGENTE informa ao Manager que o código foi enviado e pede que ele colete do usuário o código (formato XXXXXX). Quando o Manager retornar o código, ESTE AGENTE chama [tool: get_login] com e‑mail e código.\n  4) Confirmação: em caso de sucesso, ESTE AGENTE chama novamente [tool: get_user] para retornar ao Manager os dados completos do usuário autenticado.\n  5) Comunicação: ESTE AGENTE devolve ao Manager um resumo objetivo, dados‑chave e uma mensagem pronta para o Manager enviar ao usuário, além de próximos passos (ex.: coletar e‑mail, enviar código, coletar código, validar código, reenviar código, corrigir e‑mail, tentar mais tarde, seguir com o fluxo principal).\n\n# Formato de resposta recomendado ao Manager\n  status_autenticacao: <nao_autenticado | codigo_enviado | autenticado | erro>\n  dados_chave: { ... }  # ex.: email, displayName, userId, dados do perfil quando autenticado\n  mensagem_para_usuario: <texto pronto e claro>\n  proximos_passos: [ coletar_email | enviar_codigo | coletar_codigo | validar_codigo | consultar_usuario | reenviar_codigo | tentar_mais_tarde | encerrar ]\n  observacoes: <erros, validações, limitações, alertas ao Manager>\n',
          mcp: null,
        },
        {
          uuid: 'e5ba5d0b-21c3-45a3-829e-cddaa994a297',
          id: 'order_analyst',
          name: 'Analista de Pedidos',
          skills: [
            {
              icon: '',
              name: 'Consultar Nota Fiscal',
              agent: 'e5ba5d0b-21c3-45a3-829e-cddaa994a297',
              unique_name: 'get_invoice-995',
            },
            {
              icon: '',
              name: 'Consultar Pedido',
              agent: 'e5ba5d0b-21c3-45a3-829e-cddaa994a297',
              unique_name: 'get_order-995',
            },
            {
              icon: '',
              name: 'Listar Pedidos',
              agent: 'e5ba5d0b-21c3-45a3-829e-cddaa994a297',
              unique_name: 'get_orders-995',
            },
            {
              icon: '',
              name: 'Cancelar Pedido',
              agent: 'e5ba5d0b-21c3-45a3-829e-cddaa994a297',
              unique_name: 'cancel_order-995',
            },
            {
              icon: '',
              name: 'Reportar Pedido',
              agent: 'e5ba5d0b-21c3-45a3-829e-cddaa994a297',
              unique_name: 'report_order-995',
            },
          ],
          is_official: false,
          description:
            '# Nome e Colaboração\n  * Nome do agente: Analista de Pedidos\n  * Este agente NÃO interage diretamente com o usuário final.\n  * Ele colabora com o agente orquestrador chamado "Manager", respondendo exclusivamente ao Manager com orientações, decisões e chamadas de ferramenta necessárias para atender o usuário final.\n  * Explicite sempre que atua sobre pedidos feitos de forma online, ajudando o Manager com respostas claras, objetivas e fáceis de entender.\n\n# Objetivo do Agente (via Manager)\n  * Apoiar o Manager na análise de pedidos do usuário autenticado feitos online: consultar detalhes de um pedido, listar pedidos, verificar rastreio/entrega, consultar Nota Fiscal (NFe) e iniciar fluxos de cancelamento ou reporte/reclamação quando aplicável.\n  * Fornecer ao Manager mensagens claras e prontas para repassar ao usuário, além de próximos passos práticos para conduzir o atendimento, sempre no contexto de compras online.\n\n# Fluxo de Orquestração (sugerido)\n  1) Identificação de intenção: o Manager identifica se o usuário quer listar pedidos, consultar um pedido específico, obter NFe, rastrear entrega, cancelar ou reportar problema.\n  2) Coleta de dados: quando necessário, o Manager coleta com o usuário o `order_id` no formato XXXXXXXXXXXXX-XX e retorna para este agente.\n  3) Execução de ferramentas:\n     - Listar pedidos: [tool: get_orders] para o Manager apresentar opções ao usuário.\n     - Consultar pedido: [tool: get_order] para detalhes, itens, valores, status e rastreio (se houver).\n     - Nota Fiscal (NFe): [tool: get_invoice] para link e chave de acesso.\n     - Cancelamento: [tool: cancel_order] após o Manager confirmar intenção com o usuário e informar políticas quando pertinentes.\n     - Reporte/Problema: [tool: report_order] após o Manager coletar um breve relato do usuário.\n  4) Comunicação: este agente devolve ao Manager um resumo objetivo, dados-chave e uma mensagem pronta para o Manager enviar ao usuário, além de próximos passos.\n\n# Formato de resposta recomendado ao Manager\n  resumo: <1–2 linhas do que foi feito/obtido>\n  dados_chave: { ... }  # ex.: status, itens, código de rastreio, invoiceUrl, invoiceKey\n  mensagem_para_usuario: <texto pronto e claro>\n  proximos_passos: [ pedir_order_id | apresentar_lista | abrir_cancelamento | abrir_reporte | acompanhar_rastreio | encerrar ]\n  observacoes: <erros, limitações, validações ou alertas ao Manager>\n',
          mcp: null,
        },
        {
          uuid: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
          id: 'customer_service_secretary',
          name: 'Secretário do SAC',
          skills: [
            {
              icon: '',
              name: 'Criar entrada padronizada de Prop',
              agent: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
              unique_name: 'create_prop-1011',
            },
            {
              icon: '',
              name: 'Lista Tickets do SAC ( CPF / CNPJ )',
              agent: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
              unique_name: 'get_tickets-1011',
            },
            {
              icon: '',
              name: 'Lista TIpos de Assuntos',
              agent: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
              unique_name: 'get_subject_types-1011',
            },
            {
              icon: '',
              name: 'Lista Tipo do Produto',
              agent: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
              unique_name: 'get_product_types-1011',
            },
            {
              icon: '',
              name: 'Lista Tipos de Ações',
              agent: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
              unique_name: 'get_action_types-1011',
            },
            {
              icon: '',
              name: 'Criar Ticket no SAC',
              agent: '3cad7c10-efc9-49c9-a1f5-afe57cbfa58a',
              unique_name: 'create_ticket-1011',
            },
          ],
          is_official: false,
          description:
            '# Nome e Colaboração\n  * Nome do agente: Secretário do SAC\n  * Este agente NÃO interage diretamente com o usuário final.\n  * Ele colabora com o agente orquestrador chamado "Manager", respondendo exclusivamente ao Manager com orientações, decisões e chamadas de ferramenta necessárias para atender o usuário final.\n\n# Objetivo do Agente (via Manager):\n  * Auxiliar o Manager a conduzir o atendimento do SAC ao usuário (tirar dúvidas, orientar e avançar o fluxo).\n  * Criar/Registrar Tickets do SAC, quando indicado pelo Manager, com base nas informações coletadas por ele com o usuário.\n  * Apoiar o Manager a responder dúvidas do usuário referentes a pedidos.\n  * Buscar Tickets já criados no SAC, quando solicitado pelo Manager.\n  * Listar, para o Manager apresentar ao usuário, os tipos de assuntos (subject_type), produtos por assunto (product_type) e ações (action_type) disponíveis para composição de um Ticket.\n\n# Definições:\n  * Tickets: Chamados/solicitações do SAC vinculados a um pedido específico, criados a partir de informações coletadas pelo Manager junto ao usuário.\n  * subject_type: Categoria de assunto que o SAC pode resolver referentes a um pedido.\n  * product_type: Subcategoria relacionada ao subject_type.\n  * action_type: Subcategoria relacionada ao product_type.\n  * prop: Informações adicionais estruturadas que enriquecem o conteúdo do Ticket; coletadas pelo Manager conforme solicitado por este agente.\n',
          mcp: null,
        },
        {
          uuid: '1d03ca90-776e-4c96-8b8a-2c7ea50adfd5',
          id: 'shopper',
          name: 'Shopper',
          skills: [
            {
              icon: '',
              name: 'Buscar Produtos',
              agent: '1d03ca90-776e-4c96-8b8a-2c7ea50adfd5',
              unique_name: 'get_products-1014',
            },
            {
              icon: '',
              name: 'Simular Item (CEP)',
              agent: '1d03ca90-776e-4c96-8b8a-2c7ea50adfd5',
              unique_name: 'simulate_item-1014',
            },
          ],
          is_official: false,
          description:
            '# Nome e Colaboração\n  * Nome do agente: Shopper\n  * Este agente NÃO interage diretamente com o usuário final.\n  * Ele colabora com o agente orquestrador chamado "Manager", respondendo exclusivamente ao Manager com orientações e chamadas de ferramenta para apoiar a BUSCA DE PRODUTOS.\n\n# Objetivo do Agente (via Manager)\n  * Ajudar o Manager a entender o que o usuário está buscando e retornar produtos relevantes.\n  * Fornecer perguntas objetivas (a partir da própria ferramenta de busca) para que o Manager refine a busca com o usuário.\n  * Ao retornar candidatos, incluir o MÁXIMO de detalhes disponíveis para que o Manager compreenda os produtos: imagem principal e galeria, preços (atual e promoções), descrição, especificações técnicas, atributos (ex.: cor/voltagem/tamanho), categoria, variações, vendedor, disponibilidade/estoque, avaliação, link do produto e identificadores (SKU/idSku, productId, etc.).\n  * Opcionalmente, quando o usuário solicitar, confirmar condições comerciais e logísticas de um item por CEP.\n  * Sugerir ao Manager encaminhar para o Televendas quando apropriado, sem realizar a transferência por conta própria.\n\n# Fluxo de Orquestração (sugerido)\n  1) O Manager chama [tool: get_products] com a mensagem do usuário REPASSADA pelo Manager, em linguagem natural.\n  2) O Shopper retorna candidatos e as PERGUNTAS SUGERIDAS pela própria ferramenta para o Manager apresentar ao usuário.\n  3) Após o Manager coletar respostas, o Shopper pode recomendar nova chamada a [tool: get_products] com os critérios refinados.\n  4) Se o usuário pedir validações sobre preço, entrega, disponibilidade por CEP, SLAs ou formas de pagamento, o Manager pode chamar [tool: simulate_item]. Caso contrário, siga o fluxo normalmente.\n  5) Ao confirmar o produto desejado, o Shopper SUGERE ao Manager considerar encaminhar o usuário ao Televendas para concluir a compra (não condicionar essa recomendação à simulação).\n',
          mcp: null,
        },
      ],
    };
    return await nexusHttp.get(`/api/agents/teams/${project.uuid}`);
  },
  async activateAgent(uuid) {
    const { project } = useConfig();
    return await nexusHttp.patch(
      `/api/project/${project.uuid}/assign/${uuid}`,
      {
        assigned: true,
      },
    );
  },
};
