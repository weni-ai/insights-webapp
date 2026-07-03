import { defineStore } from 'pinia';
import { ref } from 'vue';

import type {
  MetricGoalBreach,
  MetricKey,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import { deriveThresholdFromSeconds } from '@/utils/metricGoalThreshold';

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
    reset,
  };
});

export type {
  ConnectionState,
  MetricGoalSocketResolvedContent,
  MetricGoalSocketViolatedContent,
};
