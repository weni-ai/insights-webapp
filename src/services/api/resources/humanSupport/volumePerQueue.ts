import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { asyncTimeout } from '@/utils/time';

interface QueryParams {
  cursor?: string;
  chip_name?: string;
  limit?: number;
}

interface VolumePerQueueResult {
  sector_name: string;
  total_queues?: number;
  queues: { queue_name: string; value: number }[];
}

interface VolumePerQueueResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: VolumePerQueueResult[];
}

export default {
  async getVolumePerQueueMonitoring(
    params: QueryParams,
  ): Promise<VolumePerQueueResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();
    const { appliedFilters } = useHumanSupport();

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

    // TODO: remove mock
    await asyncTimeout(5000);

    return {
      count: 9, // count de filas
      next: 'true',
      previous: null,
      results: [
        {
          sector_name: 'setor 0',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 1',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 2',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 0',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 1',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 2',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 0',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 1',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 2',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
      ],
    };

    // const response = (await http.get(
    //   `/dashboards/${currentDashboard.uuid}/monitoring/queue_volume/`,
    //   {
    //     params: formattedParams,
    //   },
    // )) as VolumePerQueueResponse;
    // return response;
  },

  async getVolumePerQueueAnalysis(
    params: QueryParams,
  ): Promise<VolumePerQueueResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();
    const { appliedFilters, appliedDateRange } = useHumanSupport();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
    };

    const formattedParams = {
      project_uuid: project.uuid,
      ...formattedAppliedFilters,
      ...params,
    };
    // TODO: remove mock
    await asyncTimeout(5000);

    return {
      count: 9, // count de filas
      next: null,
      previous: null,
      results: [
        {
          sector_name: 'setor 0',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 1',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 2',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 0',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 1',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 2',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 0',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 1',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
        {
          sector_name: 'setor 2',
          total_queues: 2,
          queues: [
            {
              queue_name: 'fila 1',
              value: 10,
            },
            {
              queue_name: 'fila 2',
              value: 10,
            },
          ],
        },
      ],
    };

    // const response = (await http.get(
    //   `/dashboards/${currentDashboard.uuid}/analysis/queue_volume/`,
    //   {
    //     params: formattedParams,
    //   },
    // )) as VolumePerQueueResponse;
    // return response;
  },
};
