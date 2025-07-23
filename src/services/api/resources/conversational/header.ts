import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { createRequestQuery } from '@/utils/request';

interface ConversationMetric {
  value: number;
  percentage: number;
}

interface ConversationalHeaderTotalsResponse {
  total_conversations: ConversationMetric;
  resolved: ConversationMetric;
  unresolved: ConversationMetric;
  abandoned: ConversationMetric;
  transferred_to_human: ConversationMetric;
}

export interface FormattedMetric {
  id: string;
  value: number;
  percentage: number;
}

interface QueryParams {
  start_date?: string;
  end_date?: string;
  [key: string]: string;
}

interface FormattedParams extends QueryParams {
  project_uuid: string;
}

export default {
  async getConversationalHeaderTotals(
    queryParams: QueryParams = {},
  ): Promise<FormattedMetric[]> {
    const { project } = useConfig();

    const params = createRequestQuery(queryParams);

    const formattedParams: FormattedParams = {
      ...params,
      project_uuid: project.uuid,
    };

    const response = (await http.get(`/metrics/conversations/totals/`, {
      params: formattedParams,
    })) as ConversationalHeaderTotalsResponse;

    const formattedResponse: FormattedMetric[] = Object.entries(response).map(
      ([id, data]) => ({
        id,
        value: data.value,
        percentage: data.percentage,
      }),
    );

    return formattedResponse;
  },
};

export type {
  ConversationMetric,
  ConversationalHeaderTotalsResponse,
  QueryParams,
  FormattedParams,
};
