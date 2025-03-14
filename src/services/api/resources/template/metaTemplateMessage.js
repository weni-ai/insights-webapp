import http from '@/services/api/http';
import { getPercentageOf } from '@/utils/number';

import { asyncTimeout } from '@/utils/time';

export default {
  async listMetricsSource(source) {
    await asyncTimeout(2000);

    const url = `/metrics/meta/whatsapp-message-templates/${source}/`;
    // const { data } = await http.get(url);
    const { data } = await asyncTimeout(2000).then(() => {
      return {
        data: {
          [source]: [
            source === 'languages'
              ? {
                  name: 'Português',
                  value: 'pt_BR',
                }
              : {
                  name: 'Marketing',
                  value: 'marketing',
                },
          ],
        },
      };
    });

    return data[source];
  },

  async listTemplates({
    limit,
    after,
    before,
    search,
    category,
    language,
    project_uuid,
    waba_id,
  }) {
    const url = '/metrics/meta/whatsapp-message-templates/list-templates/';

    const params = {
      limit,
      after,
      before,
      search,
      category,
      language,
      project_uuid,
      waba_id,
    };

    // const { data } = await http.get(url, { params });

    const { data } = await asyncTimeout(3000).then(() => {
      return {
        data: {
          data: [
            {
              name: 'test_template_1',
              language: 'sq',
              status: 'APPROVED',
              category: 'MARKETING',
              id: '1',
              waba_id: '123',
            },
            {
              name: 'test_template_2',
              language: 'sq',
              status: 'PENDING',
              category: 'MARKETING',
              id: '2',
              waba_id: '123',
            },
            {
              name: 'test_template_3',
              language: 'sq',
              status: 'REJECTED',
              category: 'MARKETING',
              id: '3',
              waba_id: '123',
            },
          ],
          paging: { cursors: { after: null, before: null } },
        },
      };
    });

    return {
      before: data.paging?.cursors?.before,
      next: data.paging?.cursors?.after,
      results: data.data,
    };
  },

  async getTemplatePreview({ waba_id, project_uuid, template_id }) {
    const url = '/metrics/meta/whatsapp-message-templates/preview/';
    const params = { waba_id, project_uuid, template_id };

    // const { data } = await http.get(url, { params });

    const { data } = await asyncTimeout(5000).then(() => {
      return {
        data: {
          name: 'template_dev',
          parameter_format: 'POSITIONAL',
          components: [
            {
              type: 'HEADER',
              format: 'TEXT',
              text: 'VTEX adquire Weni e passa a oferecer solução de IA para transformar o atendimento pós-venda de marcas e varejistas',
            },
            {
              type: 'HEADER',
              format: 'IMAGE',
              example: {
                header_handle: [
                  'https://vtexecommercep.wpenginepowered.com/wp-content/uploads/2024/09/Weni-Press-Website-3.png',
                ],
              },
            },
            {
              type: 'BODY',
              text: 'A aquisição fortalece a jornada omnichannel da VTEX, reduz custos de suporte ao cliente e impulsionada por dados e IA aprimora a experiência pós-venda para marcas e varejistas globais.',
              example: { body_text: [['test']] },
            },
            {
              type: 'BUTTONS',
              buttons: [
                {
                  type: 'URL',
                  text: 'Acessar notícia',
                  url: 'https://example.local/',
                },
                {
                  type: 'QUICK_REPLY',
                  text: 'Parar de receber',
                },
              ],
            },
          ],
          language: 'en_US',
          status: 'APPROVED',
          category: 'MARKETING',
          id: '1234567890987654',
        },
      };
    });

    const title = data.components.find(
      (element) => element.type === 'HEADER' && element.format === 'TEXT',
    )?.text;

    const image = data.components.find(
      (element) => element.type === 'HEADER' && element.format === 'IMAGE',
    )?.example?.header_handle?.[0];

    const text = data.components.find(
      (element) => element.type === 'BODY',
    )?.text;

    const hint = '';

    const status = data.status;

    const name = data.name;

    const buttons = data.components.find(
      (element) => element.type === 'BUTTONS',
    )?.buttons;

    return { title, image, text, hint, status, name, buttons };
  },

  async getTemplateMessagesAnalytics({
    waba_id,
    project_uuid,
    template_id,
    date_start,
    date_end,
  }) {
    const url = '/metrics/meta/whatsapp-message-templates/messages-analytics/';
    const params = { waba_id, project_uuid, template_id, date_start, date_end };

    // const { data } = await http.get(url, { params });

    const { data } = await asyncTimeout(5000).then(() => {
      return {
        data: {
          data: {
            status_count: {
              sent: 100,
              delivered: 80,
              read: 10,
              clicked: 10,
            },
            data_points: [
              {
                date: '2025-01-22',
                sent: 60,
                delivered: 40,
                read: 30,
                clicked: 20,
              },
              {
                date: '2025-01-23',
                sent: 40,
                delivered: 40,
                read: 20,
                clicked: 20,
              },
              {
                date: '2025-01-24',
                sent: 10,
                delivered: 5,
                read: 2,
                clicked: 1,
              },
            ],
          },
        },
      };
    });

    const { sent, delivered, read, clicked } = data.data.status_count;

    const data_points = data.data.data_points;

    return {
      status_count: {
        sent: { value: sent },
        delivered: {
          value: delivered,
          percentage: getPercentageOf(delivered, sent),
        },
        read: {
          value: read,
          percentage: getPercentageOf(read, sent),
        },
        clicked: {
          value: clicked,
          percentage: getPercentageOf(clicked, sent),
        },
      },
      data_points,
    };
  },

  async getTemplateButtonsAnalytics({
    waba_id,
    project_uuid,
    template_id,
    date_start,
    date_end,
  }) {
    const url = '/metrics/meta/whatsapp-message-templates/buttons-analytics/';
    const params = { waba_id, project_uuid, template_id, date_start, date_end };

    // const { data } = await http.get(url, { params });
    const { data } = await asyncTimeout(5000).then(() => {
      return {
        data: {
          data: [
            {
              label: 'Teste',
              type: 'Type',
              total: 159,
              click_rate: 10.5,
            },
            {
              label: 'Teste 2',
              type: 'Type',
              total: 50,
              click_rate: 20,
            },
            {
              label: 'Teste 3',
              type: 'Type',
              total: 100,
              click_rate: 50,
            },
            {
              label: 'Teste 4',
              type: 'Type',
              total: 100,
              click_rate: 50,
            },
            {
              label: 'Teste 5',
              type: 'Type',
              total: 100,
              click_rate: 50,
            },
            {
              label: 'Teste 6',
              type: 'Type',
              total: 100,
              click_rate: 50,
            },
            {
              label: 'Teste 7',
              type: 'Type',
              total: 100,
              click_rate: 50,
            },
          ],
        },
      };
    });

    return data.data;
  },

  async getFavoritesTemplates(params) {
    await asyncTimeout(2000);
    return [{ name: 'template-2', id: '2' }];
  },

  async favoriteTemplate(templateUuid) {},

  async unfavoriteTemplate(templateUuid) {},
};
