import { asyncTimeout } from '@/utils/time';

export default {
  async listTemplates(params) {
    await asyncTimeout(3000);
    return {
      next: null,
      previous: null,
      results: [
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
          status: 'APPROVED',
          category: 'MARKETING',
          id: '2',
          waba_id: '123',
        },
        {
          name: 'test_template_3',
          language: 'sq',
          status: 'APPROVED',
          category: 'MARKETING',
          id: '3',
          waba_id: '123',
        },
      ],
    };
  },

  async getTemplatePreview(params) {
    await asyncTimeout(5000);
    return {
      title:
        'VTEX adquire Weni e passa a oferecer solução de IA para transformar o atendimento pós-venda de marcas e varejistas',
      text: 'A aquisição fortalece a jornada omnichannel da VTEX, reduz custos de suporte ao cliente e impulsionada por dados e IA aprimora a experiência pós-venda para marcas e varejistas globais.',
      hint: `Não tem interesse? Toque em 'Parar promoções'`,
      quality: 'high',
      name: 'template_dev',
      image:
        'https://vtexecommercep.wpenginepowered.com/wp-content/uploads/2024/09/Weni-Press-Website-3.png',
      buttons: [
        { type: 'URL', label: 'Acessar notícia' },
        { type: 'QUICK_REPLY', label: 'Parar de receber' },
      ],
    };
  },

  async getTemplateMessagesAnalytics(params) {
    await asyncTimeout(5000);

    return {
      status_count: {
        sent: {
          value: 100,
        },
        delivered: {
          value: 80,
          percentage: 80.0,
        },
        read: {
          value: 10,
          percentage: 10.0,
        },
        clicked: {
          value: 10,
          percentage: 10.0,
        },
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
      ],
    };
  },

  async getTemplateButtonsAnalytics(params) {
    await asyncTimeout(5000);

    return [
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
    ];
  },

  async getFavoritesTemplates(params) {
    await asyncTimeout(2000);
    return [{ name: 'template-2', id: '2' }];
  },

  async favoriteTemplate(templateUuid) {},

  async unfavoriteTemplate(templateUuid) {},
};
