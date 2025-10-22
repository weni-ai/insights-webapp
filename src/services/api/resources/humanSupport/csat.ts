import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { asyncTimeout } from '@/utils/time';

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
    const { appliedFilters } = useHumanSupportMonitoring();

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

    // TODO: Remove this after testing

    await asyncTimeout(1000);

    return {
      general: { rooms: 1, reviews: 1, avg_rating: 1 },
      next: '?cursor=next',
      previous: null,
      results: [
        {
          agent: { uuid: '1', name: '1', email: '1' },
          rooms: 1,
          reviews: 1,
          avg_rating: 1,
        },
        {
          agent: { uuid: '2', name: '2', email: '2' },
          rooms: 1,
          reviews: 1,
          avg_rating: 1,
        },
        {
          agent: { uuid: '3', name: '3', email: '3' },
          rooms: 1,
          reviews: 1,
          avg_rating: 1,
        },
        {
          agent: { uuid: '4', name: '4', email: '4' },
          rooms: 1,
          reviews: 1,
          avg_rating: 1,
        },
        {
          agent: { uuid: '5', name: '5', email: '5' },
          rooms: 1,
          reviews: 1,
          avg_rating: 1,
        },
      ],
    } as AgentsTotalsResponse;

    // const response = await http.get(
    //   '/metrics/human-support/monitoring/csat/totals/',
    //   {
    //     params: formattedParams,
    //   },
    // );

    // return response.data;
  },

  async getRatingsMonitoring(params: QueryParams): Promise<RatingsResponse> {
    const { project } = useConfig();
    const { appliedFilters } = useHumanSupportMonitoring();

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

    // TODO: Remove this after testing

    await asyncTimeout(1000);

    return {
      '1': { value: 1, full_value: 1 },
      '2': { value: 2, full_value: 2 },
      '3': { value: 3, full_value: 3 },
      '4': { value: 4, full_value: 4 },
      '5': { value: 5, full_value: 5 },
    } as RatingsResponse;

    // const response = await http.get(
    //   '/metrics/human-support/monitoring/csat/ratings/',
    //   {
    //     params: formattedParams,
    //   },
    // );

    // return response.data;
  },
};
