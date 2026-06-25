import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';
import {
  MetricGoalBreach,
  MetricGoalBreachApi,
  normalizeMetricGoalBreach,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

interface AverageTimeData {
  average: number;
  max: number;
}

interface TimeMetricsDataResponseApi {
  average_time_is_waiting: AverageTimeData;
  average_time_first_response: AverageTimeData;
  average_time_chat: AverageTimeData;
  waiting_time_goal?: MetricGoalBreachApi;
  first_response_time_goal?: MetricGoalBreachApi;
  conversation_duration_goal?: MetricGoalBreachApi;
}

interface TimeMetricsDataResponse {
  average_time_is_waiting: AverageTimeData;
  average_time_first_response: AverageTimeData;
  average_time_chat: AverageTimeData;
  waiting_time_goal?: MetricGoalBreach;
  first_response_time_goal?: MetricGoalBreach;
  conversation_duration_goal?: MetricGoalBreach;
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
}

const normalizeTimeMetricsResponse = (
  response: TimeMetricsDataResponseApi,
): TimeMetricsDataResponse => ({
  average_time_is_waiting: response.average_time_is_waiting,
  average_time_first_response: response.average_time_first_response,
  average_time_chat: response.average_time_chat,
  waiting_time_goal: response.waiting_time_goal
    ? normalizeMetricGoalBreach(response.waiting_time_goal)
    : undefined,
  first_response_time_goal: response.first_response_time_goal
    ? normalizeMetricGoalBreach(response.first_response_time_goal)
    : undefined,
  conversation_duration_goal: response.conversation_duration_goal
    ? normalizeMetricGoalBreach(response.conversation_duration_goal)
    : undefined,
});

export default {
  async getTimeMetricsData(
    queryParams: QueryParams = {},
  ): Promise<TimeMetricsDataResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const params = createRequestQuery(queryParams);

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = (await http.get(
      `dashboards/${currentDashboard.uuid}/monitoring/average_time_metrics/`,
      {
        params: formattedParams,
      },
    )) as TimeMetricsDataResponseApi;

    return normalizeTimeMetricsResponse(response);
  },
};

export type { TimeMetricsDataResponse, QueryParams, MetricGoalBreach };
export type { TimeUnit } from '@/services/api/resources/humanSupport/monitoring/metricGoals';
