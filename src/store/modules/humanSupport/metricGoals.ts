import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import MetricGoalsService from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import RecipientsService from '@/services/api/resources/humanSupport/monitoring/recipients';
import {
  MetricGoal,
  MetricKey,
  TimeUnit,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import { Recipient } from '@/services/api/resources/humanSupport/monitoring/recipients';

import { useConfig } from '@/store/modules/config';
import { moduleStorage } from '@/utils/storage';

const SEEN_POPOVER_KEY = 'operational_alerts_seen_popover';
const OPENED_DRAWER_KEY = 'operational_alerts_opened_drawer';

const DEFAULT_ROOMS_THRESHOLD = 5;

const UNIT_SECONDS: Record<TimeUnit, number> = {
  s: 1,
  m: 60,
  h: 3600,
};

export const METRIC_KEYS: MetricKey[] = [
  'waiting_time',
  'first_response_time',
  'conversation_duration',
];

interface MetricFormState {
  enabled: boolean;
  threshold: number | null;
  unit: TimeUnit;
  recipients: string[];
  roomsThresholdCount: number | null;
}

type OperationalAlertsFormState = Record<MetricKey, MetricFormState>;

const thresholdToSeconds = (threshold: number, unit: TimeUnit): number =>
  Math.round(threshold * UNIT_SECONDS[unit]);

const projectStorageKey = (key: string): string => {
  const { project } = useConfig();
  const projectUuid = project?.uuid || moduleStorage.getItem('projectUuid');
  return projectUuid ? `${key}_${projectUuid}` : key;
};

export const useMetricGoals = defineStore('metricGoals', () => {
  const goals = ref<Partial<Record<MetricKey, MetricGoal>>>({});
  const recipients = ref<Recipient[]>([]);

  const loadingGoals = ref(false);
  const loadingRecipients = ref(false);
  const savingGoals = ref(false);
  const hasLoadedGoals = ref(false);

  const hasSeenPopover = ref<boolean>(
    !!moduleStorage.getItem(projectStorageKey(SEEN_POPOVER_KEY)),
  );
  const hasOpenedDrawer = ref<boolean>(
    !!moduleStorage.getItem(projectStorageKey(OPENED_DRAWER_KEY)),
  );

  const hasConfiguredGoals = computed(() =>
    METRIC_KEYS.some((metric) => !!goals.value[metric]),
  );

  const getGoalForMetric = (metric: MetricKey): MetricGoal | undefined =>
    goals.value[metric];

  const isCardInAlert = (
    metric: MetricKey,
    maxSeconds?: number | null,
  ): boolean => {
    const goal = goals.value[metric];
    if (!goal || maxSeconds === null || maxSeconds === undefined) return false;
    return maxSeconds > goal.threshold_seconds;
  };

  const isValueInAlert = (
    metric: MetricKey,
    seconds?: number | null,
  ): boolean => {
    const goal = goals.value[metric];
    if (!goal || seconds === null || seconds === undefined) return false;
    return seconds > goal.threshold_seconds;
  };

  const setHasSeenPopover = (value: boolean) => {
    hasSeenPopover.value = value;
    moduleStorage.setItem(projectStorageKey(SEEN_POPOVER_KEY), value);
  };

  const setHasOpenedDrawer = (value: boolean) => {
    hasOpenedDrawer.value = value;
    moduleStorage.setItem(projectStorageKey(OPENED_DRAWER_KEY), value);
  };

  const loadGoals = async () => {
    try {
      loadingGoals.value = true;
      const { goals: loadedGoals } = await MetricGoalsService.getMetricGoals();

      goals.value = loadedGoals.reduce(
        (acc, goal) => {
          acc[goal.metric] = goal;
          return acc;
        },
        {} as Partial<Record<MetricKey, MetricGoal>>,
      );
    } catch (error) {
      console.error('Error loading metric goals:', error);
    } finally {
      hasLoadedGoals.value = true;
      loadingGoals.value = false;
    }
  };

  const loadRecipients = async () => {
    try {
      loadingRecipients.value = true;
      recipients.value = await RecipientsService.getRecipients();
    } catch (error) {
      console.error('Error loading metric goals recipients:', error);
      recipients.value = [];
    } finally {
      loadingRecipients.value = false;
    }
  };

  const saveGoals = async (formState: OperationalAlertsFormState) => {
    savingGoals.value = true;
    try {
      const requests: Promise<unknown>[] = [];

      METRIC_KEYS.forEach((metric) => {
        const metricForm = formState[metric];
        const hasExistingGoal = !!goals.value[metric];

        const isValid =
          metricForm?.enabled &&
          metricForm.threshold !== null &&
          metricForm.threshold > 0;

        if (isValid) {
          const emailEnabled = metricForm.recipients.length > 0;
          requests.push(
            MetricGoalsService.saveMetricGoal(metric, {
              threshold_seconds: thresholdToSeconds(
                metricForm.threshold as number,
                metricForm.unit,
              ),
              email_enabled: emailEnabled,
              recipients: emailEnabled ? metricForm.recipients : [],
              rooms_threshold_count: emailEnabled
                ? metricForm.roomsThresholdCount || DEFAULT_ROOMS_THRESHOLD
                : 0,
            }),
          );
        } else if (hasExistingGoal) {
          requests.push(MetricGoalsService.deleteMetricGoal(metric));
        }
      });

      await Promise.all(requests);
      await loadGoals();
    } finally {
      savingGoals.value = false;
    }
  };

  return {
    goals,
    recipients,
    loadingGoals,
    loadingRecipients,
    savingGoals,
    hasLoadedGoals,
    hasSeenPopover,
    hasOpenedDrawer,
    hasConfiguredGoals,
    getGoalForMetric,
    isCardInAlert,
    isValueInAlert,
    setHasSeenPopover,
    setHasOpenedDrawer,
    loadGoals,
    loadRecipients,
    saveGoals,
  };
});

export type { MetricFormState, OperationalAlertsFormState };
