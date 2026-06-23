import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

type MetricKey =
  | 'waiting_time'
  | 'first_response_time'
  | 'conversation_duration';

type TimeUnit = 's' | 'm' | 'h';

interface MetricGoal {
  metric: MetricKey;
  threshold_seconds: number;
  email_enabled: boolean;
  recipients: string[];
  rooms_threshold_count: number;
}

interface MetricGoalsResponse {
  goals: MetricGoal[];
}

type MetricGoalPayload = Omit<MetricGoal, 'metric'>;

export default {
  async getMetricGoals(): Promise<MetricGoalsResponse> {
    const { project } = useConfig();

    const response = (await http.get(
      `projects/${project.uuid}/metric-goals/`,
    )) as MetricGoalsResponse;

    return { goals: response?.goals || [] };
  },

  async saveMetricGoal(
    metric: MetricKey,
    payload: MetricGoalPayload,
  ): Promise<MetricGoal> {
    const { project } = useConfig();

    const response = (await http.post(
      `projects/${project.uuid}/metric-goals/${metric}/`,
      payload,
    )) as MetricGoal;

    return response;
  },

  async deleteMetricGoal(metric: MetricKey): Promise<void> {
    const { project } = useConfig();

    await http.delete(`projects/${project.uuid}/metric-goals/${metric}/`);
  },
};

export type {
  MetricGoal,
  MetricKey,
  TimeUnit,
  MetricGoalsResponse,
  MetricGoalPayload,
};
