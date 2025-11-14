import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

interface QueryParams {
  cursor?: string;
  agent_uuid?: string;
}

export interface AgentsTotalResult {
  agent: { uuid: string; name: string; email: string };
  rooms: number;
  reviews: number;
  avg_rating: number;
}

export interface AgentsTotalsResponse {
  next: string | null;
  previous: string | null;
  general: { rooms: number; reviews: number; avg_rating: number };
  results: AgentsTotalResult[];
}

interface RatingObject {
  value: number;
  full_value: number;
}

export interface RatingsResponse {
  '5': RatingObject;
  '4': RatingObject;
  '3': RatingObject;
  '2': RatingObject;
  '1': RatingObject;
}

export default {
  async getTotalsMonitoring(
    params: QueryParams = {},
  ): Promise<AgentsTotalsResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = await http.get(
      `/dashboards/${currentDashboard.uuid}/monitoring/csat/totals/`,
      {
        params: formattedParams,
      },
    );

    return response.data;
  },

  async getRatingsMonitoring(params: QueryParams): Promise<RatingsResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };

    const response = await http.get(
      `/dashboards/${currentDashboard.uuid}/monitoring/csat/ratings/`,
      {
        params: formattedParams,
      },
    );

    return response.data;
  },
};
