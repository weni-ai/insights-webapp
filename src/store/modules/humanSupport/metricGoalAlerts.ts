import { defineStore } from 'pinia';
import { ref } from 'vue';

import type {
  MetricGoalBreach,
  MetricKey,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import type { TimeMetricsDataResponse } from '@/services/api/resources/humanSupport/monitoring/timeMetrics';
import { deriveThresholdFromSeconds } from '@/utils/metricGoalThreshold';
import { registerStoreHMR } from '@/utils/hmr';

const LIVE_METRIC_KEYS: MetricKey[] = [
  'waiting_time',
  'first_response_time',
  'conversation_duration',
];

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface MetricGoalSocketViolatedContent {
  project_uuid: string;
  metric: MetricKey;
  state: 'violating';
  transition: 'new' | 'update';
  violating_count: number;
  max_value_seconds: number;
  threshold_seconds: number;
  rooms_threshold_count: number;
  rooms_threshold_percent: number | null;
  active_rooms_count: number | null;
  detected_at: string;
}

interface MetricGoalSocketResolvedContent {
  project_uuid: string;
  metric: MetricKey;
  state: 'ok';
  detected_at: string;
}

const createEmptyLiveBreaches = (): Record<
  MetricKey,
  MetricGoalBreach | null
> => ({
  waiting_time: null,
  first_response_time: null,
  conversation_duration: null,
});

const mapSocketContentToBreach = (
  content: MetricGoalSocketViolatedContent,
): MetricGoalBreach => {
  const { thresholdValue, unit } = deriveThresholdFromSeconds(
    content.threshold_seconds,
  );

  return {
    thresholdSeconds: content.threshold_seconds,
    thresholdValue,
    unit,
    isBreached: content.state === 'violating',
    breachedRoomsCount: content.violating_count,
  };
};

export const useMetricGoalAlerts = defineStore('metricGoalAlerts', () => {
  const liveBreaches = ref<Record<MetricKey, MetricGoalBreach | null>>(
    createEmptyLiveBreaches(),
  );
  const connectionState = ref<ConnectionState>('disconnected');

  const setConnectionState = (state: ConnectionState) => {
    connectionState.value = state;
  };

  const applyViolated = (content: MetricGoalSocketViolatedContent) => {
    if (!LIVE_METRIC_KEYS.includes(content.metric)) return;

    liveBreaches.value[content.metric] = mapSocketContentToBreach(content);
  };

  const applyUpdate = (content: MetricGoalSocketViolatedContent) => {
    applyViolated(content);
  };

  const applyResolved = (content: MetricGoalSocketResolvedContent) => {
    if (!LIVE_METRIC_KEYS.includes(content.metric)) return;

    liveBreaches.value[content.metric] = null;
  };

  const isMetricBreaching = (metric: MetricKey): boolean =>
    liveBreaches.value[metric]?.isBreached === true;

  const hydrateFromApiGoals = (data: TimeMetricsDataResponse) => {
    const mappings: { metric: MetricKey; goal?: MetricGoalBreach }[] = [
      {
        metric: 'waiting_time',
        goal: data.average_time_is_waiting?.waiting_time_goal,
      },
      {
        metric: 'first_response_time',
        goal: data.average_time_first_response?.first_response_time_goal,
      },
      {
        metric: 'conversation_duration',
        goal: data.average_time_chat?.conversation_duration_goal,
      },
    ];

    mappings.forEach(({ metric, goal }) => {
      if (goal?.isBreached) {
        liveBreaches.value[metric] = goal;
        return;
      }

      if (goal) {
        liveBreaches.value[metric] = null;
      }
    });
  };

  const reset = () => {
    liveBreaches.value = createEmptyLiveBreaches();
    connectionState.value = 'disconnected';
  };

  return {
    liveBreaches,
    connectionState,
    setConnectionState,
    applyViolated,
    applyUpdate,
    applyResolved,
    isMetricBreaching,
    hydrateFromApiGoals,
    reset,
  };
});

export type {
  ConnectionState,
  MetricGoalSocketResolvedContent,
  MetricGoalSocketViolatedContent,
};

registerStoreHMR(useMetricGoalAlerts, import.meta.webpackHot);
