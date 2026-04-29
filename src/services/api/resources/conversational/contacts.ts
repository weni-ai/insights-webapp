import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useConversational } from '@/store/modules/conversational/conversational';
import { createRequestQuery } from '@/utils/request';

interface ContactsUniqueMetric {
  value: number;
}

interface ContactsReturningMetric {
  value: number;
  percentage: number;
}

interface ContactsAvgMetric {
  value: number;
}

interface ConversationalContactsResponse {
  unique: ContactsUniqueMetric;
  returning: ContactsReturningMetric;
  avg_conversations_per_contact: ContactsAvgMetric;
}

export type ContactMetricId =
  | 'unique'
  | 'returning'
  | 'avg_conversations_per_contact';

export interface FormattedContactMetric {
  id: ContactMetricId;
  value: number;
  percentage?: number;
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
  async getConversationalContacts(
    queryParams: QueryParams = {},
  ): Promise<FormattedContactMetric[]> {
    const { project } = useConfig();
    const { appliedFilters } = useConversational();

    const params = createRequestQuery(queryParams);

    const formattedParams: FormattedParams = {
      project_uuid: project.uuid,
      ...appliedFilters,
      ...params,
    };

    const response = (await http.get(`/metrics/conversations/contacts/`, {
      params: formattedParams,
    })) as ConversationalContactsResponse;

    const formattedResponse: FormattedContactMetric[] = Object.entries(
      response,
    ).map(([id, data]) => {
      const metric: FormattedContactMetric = {
        id: id as ContactMetricId,
        value: (data as { value: number }).value,
      };

      if (
        data &&
        typeof (data as { percentage?: number }).percentage === 'number'
      ) {
        metric.percentage = (data as { percentage: number }).percentage;
      }

      return metric;
    });

    return formattedResponse;
  },
};

export type {
  ContactsUniqueMetric,
  ContactsReturningMetric,
  ContactsAvgMetric,
  ConversationalContactsResponse,
  QueryParams,
  FormattedParams,
};
