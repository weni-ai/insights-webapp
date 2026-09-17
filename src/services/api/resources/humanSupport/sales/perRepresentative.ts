import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useDashboards } from '@/store/modules/dashboards';
import { createRequestQuery } from '@/utils/request';

type TrendVariationType = 'INCREASE' | 'DECREASE';

interface PerRepresentativeTrend {
  value: number;
  variation_type: TrendVariationType;
}

interface PerRepresentativeResult {
  representative: {
    name: string;
    email: string;
  };
  conversations: number;
  sales: number;
  conversions: number;
  revenue: number;
  average_order_value: number;
  trend: PerRepresentativeTrend;
}

interface PerRepresentativeResponse {
  next: string | null;
  previous: string | null;
  count: number;
  results: PerRepresentativeResult[];
}

interface QueryParams {
  sectors?: string[];
  queues?: string[];
  tags?: string[];
  start_date?: string;
  end_date?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

const MOCK_RESULTS: PerRepresentativeResult[] = [
  {
    representative: { name: 'Emma Wilson', email: 'emma.wilson@example.com' },
    conversations: 612,
    sales: 254,
    conversions: 41.5,
    revenue: 72340,
    average_order_value: 285,
    trend: { value: 12.4, variation_type: 'INCREASE' },
  },
  {
    representative: {
      name: 'Lucas Moreira',
      email: 'lucas.moreira@example.com',
    },
    conversations: 574,
    sales: 218,
    conversions: 38.0,
    revenue: 64120,
    average_order_value: 294,
    trend: { value: 8.1, variation_type: 'INCREASE' },
  },
  {
    representative: {
      name: 'Sofia Almeida',
      email: 'sofia.almeida@example.com',
    },
    conversations: 498,
    sales: 176,
    conversions: 35.3,
    revenue: 58910,
    average_order_value: 335,
    trend: { value: 4.6, variation_type: 'INCREASE' },
  },
  {
    representative: {
      name: 'Daniel Okafor',
      email: 'daniel.okafor@example.com',
    },
    conversations: 531,
    sales: 168,
    conversions: 31.6,
    revenue: 51470,
    average_order_value: 306,
    trend: { value: 2.3, variation_type: 'DECREASE' },
  },
  {
    representative: { name: 'Ana Costa', email: 'ana.costa@example.com' },
    conversations: 487,
    sales: 159,
    conversions: 32.6,
    revenue: 48210,
    average_order_value: 303,
    trend: { value: 1.8, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'João Silva', email: 'joao.silva@example.com' },
    conversations: 452,
    sales: 141,
    conversions: 31.2,
    revenue: 43880,
    average_order_value: 311,
    trend: { value: 3.4, variation_type: 'DECREASE' },
  },
  {
    representative: { name: 'Maria Santos', email: 'maria.santos@example.com' },
    conversations: 421,
    sales: 138,
    conversions: 32.8,
    revenue: 41250,
    average_order_value: 299,
    trend: { value: 5.2, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'Pedro Lima', email: 'pedro.lima@example.com' },
    conversations: 398,
    sales: 124,
    conversions: 31.2,
    revenue: 37640,
    average_order_value: 304,
    trend: { value: 0.9, variation_type: 'DECREASE' },
  },
  {
    representative: { name: 'Carla Mendes', email: 'carla.mendes@example.com' },
    conversations: 376,
    sales: 119,
    conversions: 31.6,
    revenue: 35120,
    average_order_value: 295,
    trend: { value: 6.7, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'Rafael Souza', email: 'rafael.souza@example.com' },
    conversations: 354,
    sales: 108,
    conversions: 30.5,
    revenue: 32890,
    average_order_value: 305,
    trend: { value: 2.1, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Beatriz Rocha',
      email: 'beatriz.rocha@example.com',
    },
    conversations: 341,
    sales: 102,
    conversions: 29.9,
    revenue: 30150,
    average_order_value: 296,
    trend: { value: 4.0, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'Thiago Nunes', email: 'thiago.nunes@example.com' },
    conversations: 328,
    sales: 97,
    conversions: 29.6,
    revenue: 28470,
    average_order_value: 294,
    trend: { value: 1.5, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Fernanda Dias',
      email: 'fernanda.dias@example.com',
    },
    conversations: 312,
    sales: 91,
    conversions: 29.2,
    revenue: 26780,
    average_order_value: 294,
    trend: { value: 3.8, variation_type: 'INCREASE' },
  },
  {
    representative: {
      name: 'Gustavo Pinto',
      email: 'gustavo.pinto@example.com',
    },
    conversations: 298,
    sales: 84,
    conversions: 28.2,
    revenue: 24910,
    average_order_value: 297,
    trend: { value: 5.6, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Helena Barbosa',
      email: 'helena.barbosa@example.com',
    },
    conversations: 281,
    sales: 79,
    conversions: 28.1,
    revenue: 23140,
    average_order_value: 293,
    trend: { value: 2.7, variation_type: 'INCREASE' },
  },
  {
    representative: {
      name: 'Igor Teixeira',
      email: 'igor.teixeira@example.com',
    },
    conversations: 267,
    sales: 72,
    conversions: 27.0,
    revenue: 21480,
    average_order_value: 298,
    trend: { value: 4.4, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Juliana Freitas',
      email: 'juliana.freitas@example.com',
    },
    conversations: 254,
    sales: 68,
    conversions: 26.8,
    revenue: 19870,
    average_order_value: 292,
    trend: { value: 1.1, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'Kaio Martins', email: 'kaio.martins@example.com' },
    conversations: 241,
    sales: 63,
    conversions: 26.1,
    revenue: 18320,
    average_order_value: 291,
    trend: { value: 3.3, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Larissa Campos',
      email: 'larissa.campos@example.com',
    },
    conversations: 229,
    sales: 58,
    conversions: 25.3,
    revenue: 16940,
    average_order_value: 292,
    trend: { value: 0.6, variation_type: 'INCREASE' },
  },
  {
    representative: {
      name: 'Mateus Azevedo',
      email: 'mateus.azevedo@example.com',
    },
    conversations: 216,
    sales: 54,
    conversions: 25.0,
    revenue: 15610,
    average_order_value: 289,
    trend: { value: 2.8, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Natália Vieira',
      email: 'natalia.vieira@example.com',
    },
    conversations: 203,
    sales: 49,
    conversions: 24.1,
    revenue: 14280,
    average_order_value: 291,
    trend: { value: 7.2, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'Otávio Ramos', email: 'otavio.ramos@example.com' },
    conversations: 189,
    sales: 44,
    conversions: 23.3,
    revenue: 12850,
    average_order_value: 292,
    trend: { value: 1.9, variation_type: 'DECREASE' },
  },
  {
    representative: {
      name: 'Patrícia Gomes',
      email: 'patricia.gomes@example.com',
    },
    conversations: 176,
    sales: 40,
    conversions: 22.7,
    revenue: 11590,
    average_order_value: 290,
    trend: { value: 3.1, variation_type: 'INCREASE' },
  },
  {
    representative: { name: 'Renato Cunha', email: 'renato.cunha@example.com' },
    conversations: 162,
    sales: 35,
    conversions: 21.6,
    revenue: 10140,
    average_order_value: 290,
    trend: { value: 6.0, variation_type: 'DECREASE' },
  },
];

const getSortValue = (
  item: PerRepresentativeResult,
  key: string,
): string | number => {
  if (key === 'representative') return item.representative.name;
  return item[key as keyof PerRepresentativeResult] as string | number;
};

const sortMockResults = (
  results: PerRepresentativeResult[],
  ordering: string,
): PerRepresentativeResult[] => {
  const descending = ordering.startsWith('-');
  const key = descending ? ordering.slice(1) : ordering;

  return [...results].sort((first, second) => {
    const firstValue = getSortValue(first, key);
    const secondValue = getSortValue(second, key);

    if (firstValue < secondValue) return descending ? 1 : -1;
    if (firstValue > secondValue) return descending ? -1 : 1;
    return 0;
  });
};

export default {
  async getPerRepresentative(
    queryParams: QueryParams = {},
  ): Promise<PerRepresentativeResponse> {
    const { project } = useConfig();
    const { appliedFilters, appliedDateRange } = useHumanSupport();
    const { currentDashboard } = useDashboards();

    const formattedAppliedFilters = {
      sectors: appliedFilters.sectors.map((sector) => sector.value),
      queues: appliedFilters.queues.map((queue) => queue.value),
      tags: appliedFilters.tags.map((tag) => tag.value),
      ordering: queryParams.ordering ? queryParams.ordering : '-revenue',
    };

    const params = createRequestQuery(queryParams);
    const limit = queryParams.limit ?? 12;
    const offset = queryParams.offset ?? 0;
    const ordering = queryParams.ordering ?? '-revenue';

    const formattedParams = {
      project_uuid: project.uuid,
      start_date: appliedDateRange.start,
      end_date: appliedDateRange.end,
      ...formattedAppliedFilters,
      ...params,
      limit,
      offset,
      ordering,
    };

    // TODO: Remove this mock data
    const sortedResults = sortMockResults(MOCK_RESULTS, ordering);
    const paginatedResults = sortedResults.slice(offset, offset + limit);

    return {
      next: offset + limit < sortedResults.length ? 'next' : null,
      previous: offset > 0 ? 'previous' : null,
      count: sortedResults.length,
      results: paginatedResults,
    };

    // const response = (await http.get(
    //   `/dashboards/${currentDashboard.uuid}/sales/per_representative/`,
    //   {
    //     params: formattedParams,
    //   },
    // )) as PerRepresentativeResponse;
    // return response;
  },
};

export type {
  PerRepresentativeResponse,
  PerRepresentativeResult,
  PerRepresentativeTrend,
  QueryParams,
  TrendVariationType,
};
