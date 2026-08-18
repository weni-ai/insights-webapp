import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { createRequestQuery } from '@/utils/request';

interface ConversionStageApi {
  total: number;
  percentage: number;
}

interface CTWAConversionsApiResponse {
  conversations_started: ConversionStageApi;
  conversations_qualified: ConversionStageApi;
  conversations_converted: ConversionStageApi;
}

export interface ConversionStage {
  total: number | null;
  percentage: number | null;
}

export interface CTWAConversionsData {
  conversations_started: ConversionStage;
  conversations_qualified: ConversionStage;
  conversations_converted: ConversionStage;
}

interface QueryParams {
  start_date?: string;
  end_date?: string;
  campaign?: string;
}

const mapStage = (stage?: ConversionStageApi): ConversionStage => ({
  total: stage?.total ?? null,
  percentage: stage?.percentage ?? null,
});

export default {
  async getConversionsData(
    queryParams: QueryParams = {},
  ): Promise<CTWAConversionsData> {
    const { project } = useConfig();
    const { appliedFilters } = useCTWA();

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      ...appliedFilters,
      ...params,
    };

    const response = (await http.get(
      `/projects/${project.uuid}/ctwa/conversions/`,
      { params: formattedParams },
    )) as CTWAConversionsApiResponse;

    return {
      conversations_started: mapStage(response.conversations_started),
      conversations_qualified: mapStage(response.conversations_qualified),
      conversations_converted: mapStage(response.conversations_converted),
    };
  },
};

export type { QueryParams };
