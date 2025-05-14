import http from '@/services/api/http';
import { fullySanitize } from '@/utils/sanatize';
import { parseWhatsAppFormattingToHtml } from '@/utils/whatsapp';

export default {
  async listMetricsSource(source) {
    const url = `/metrics/meta/whatsapp-message-templates/${source}/`;
    const response = await http.get(url);

    return response[source];
  },

  async listWabasId({ project_uuid }) {
    const url = `/metrics/meta/whatsapp-message-templates/wabas/`;
    const params = { project_uuid };
    const { results } = await http.get(url, { params });

    return results;
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
    fields,
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
      fields,
    };

    const { data, paging } = await http.get(url, { params });

    return {
      previous: paging?.cursors?.before,
      next: paging?.cursors?.after,
      results: data,
    };
  },

  async getTemplatePreview({ waba_id, project_uuid, template_id }) {
    const url = '/metrics/meta/whatsapp-message-templates/preview/';
    const params = { waba_id, project_uuid, template_id };

    const response = await http.get(url, { params });

    const title = response.components.find(
      (element) => element.type === 'HEADER' && element.format === 'TEXT',
    )?.text;

    const safeTitle = parseWhatsAppFormattingToHtml(fullySanitize(title));

    const image = response.components.find(
      (element) => element.type === 'HEADER' && element.format === 'IMAGE',
    )?.example?.header_handle?.[0];

    const text = response.components.find(
      (element) => element.type === 'BODY',
    )?.text;

    const safeText = parseWhatsAppFormattingToHtml(fullySanitize(text));

    const hint = '';

    const status = response.status;

    const name = response.name;

    const buttons = response.components.find(
      (element) => element.type === 'BUTTONS',
    )?.buttons;

    const is_favorite = response.is_favorite;

    return {
      title: safeTitle,
      image,
      text: safeText,
      hint,
      status,
      name,
      buttons,
      is_favorite,
    };
  },

  async getTemplateMessagesAnalytics({
    waba_id,
    project_uuid,
    template_id,
    start_date,
    end_date,
  }) {
    const url = '/metrics/meta/whatsapp-message-templates/messages-analytics/';
    const params = { waba_id, project_uuid, template_id, start_date, end_date };

    const { data } = await http.get(url, { params });

    const { sent, delivered, read, clicked } = data.status_count;

    const data_points = data.data_points;

    return {
      status_count: {
        sent: { value: sent.value },
        delivered: {
          value: delivered.value,
          percentage: delivered.percentage,
        },
        read: {
          value: read.value,
          percentage: read.percentage,
        },
        clicked: {
          value: clicked.value,
          percentage: clicked.percentage,
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

    const { data } = await http.get(url, { params });

    return data;
  },

  async getFavoritesTemplates({ dashboard }) {
    const url = '/metrics/meta/whatsapp-message-templates/favorites/';
    const params = {
      dashboard,
      limit: 5,
      offset: 0,
    };
    const response = await http.get(url, { params });

    return response.results.map((favorite) => ({
      name: favorite.name,
      id: favorite.template_id,
    }));
  },

  async favoriteTemplate({ templateUuid, dashboardUuid }) {
    const url =
      '/metrics/meta/whatsapp-message-templates/add-template-to-favorites/';
    const body = { dashboard: dashboardUuid, template_id: templateUuid };

    const response = await http.post(url, body);

    return response;
  },

  async unfavoriteTemplate({ templateUuid, dashboardUuid }) {
    const url =
      '/metrics/meta/whatsapp-message-templates/remove-template-from-favorites/';
    const body = { dashboard: dashboardUuid, template_id: templateUuid };

    const response = await http.post(url, body);

    return response;
  },
};
