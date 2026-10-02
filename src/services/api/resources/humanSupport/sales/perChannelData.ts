import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

type PerChannelType = 'revenue' | 'sale';

interface PerChannelResult {
  channel_name: string;
  total_value: number;
  percentage: number;
}

interface PerChannelMappedResult {
  channel_name: string;
  value: number;
  percentage: number;
}

interface PerChannelDataResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: PerChannelMappedResult[];
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
  type?: PerChannelType;
  chip_name?: string;
  cursor?: string | null;
  limit?: number;
  offset?: number;
}

const MOCK_REVENUE: PerChannelResult[] = [
  { channel_name: 'whatsapp', total_value: 124500, percentage: 29.06 },
  {
    channel_name: 'shopping_assistant',
    total_value: 87300,
    percentage: 20.38,
  },
  { channel_name: 'email', total_value: 68900, percentage: 16.08 },
  { channel_name: 'instagram', total_value: 52150, percentage: 12.17 },
  { channel_name: 'facebook', total_value: 38400, percentage: 8.96 },
  { channel_name: 'teams', total_value: 32100, percentage: 7.5 },
  { channel_name: 'others', total_value: 25050, percentage: 5.85 },
];

const MOCK_SALE: PerChannelResult[] = [
  { channel_name: 'whatsapp', total_value: 1245, percentage: 29.06 },
  { channel_name: 'shopping_assistant', total_value: 873, percentage: 20.38 },
  { channel_name: 'email', total_value: 689, percentage: 16.08 },
  { channel_name: 'instagram', total_value: 522, percentage: 12.17 },
  { channel_name: 'facebook', total_value: 384, percentage: 8.96 },
  { channel_name: 'teams', total_value: 321, percentage: 7.5 },
  { channel_name: 'others', total_value: 251, percentage: 5.85 },
];

const formatResponseItem = (item: PerChannelResult): PerChannelMappedResult => {
  return {
    channel_name: item.channel_name,
    value: item.total_value,
    percentage: item.percentage,
  };
};

const getMockResults = (type: PerChannelType): PerChannelResult[] =>
  type === 'sale' ? MOCK_SALE : MOCK_REVENUE;

export default {
  async getPerChannelData(
    queryParams: QueryParams = {},
  ): Promise<PerChannelDataResponse> {
    const { project } = useConfig();
    const { appliedFilters, appliedDateRange } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const params = createRequestQuery(queryParams);

    const type = (queryParams.type ||
      queryParams.chip_name ||
      'revenue') as PerChannelType;
    const limit = queryParams.limit ?? 5;
    const offset = queryParams.offset ?? 0;

    const formattedParams = {
      project_uuid: project.uuid,
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
      ...formattedAppliedFilters,
      ...params,
      type,
      limit,
      offset,
    };

    // TODO: Remove this mock data
    const allResults = getMockResults(type).map(formatResponseItem);

    return {
      next: null,
      previous: null,
      count: allResults.length,
      results: allResults,
    };

    // const response = (await http.get(
    //   `/dashboards/${currentDashboard.uuid}/sales/per_channel_data/`,
    //   {
    //     params: formattedParams,
    //   },
    // )) as {
    //   next: string | null;
    //   previous: string | null;
    //   count: number;
    //   results: PerChannelResult[];
    // };
    //
    // return {
    //   ...response,
    //   results: response.results.map(formatResponseItem),
    // };
  },
};

export type {
  PerChannelDataResponse,
  PerChannelMappedResult,
  PerChannelResult,
  PerChannelType,
  QueryParams,
};
