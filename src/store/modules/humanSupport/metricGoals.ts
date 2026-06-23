import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import MetricGoalsService from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import {
  MetricGoal,
  MetricKey,
  TimeUnit,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

import { useConfig } from '@/store/modules/config';
import { moduleStorage } from '@/utils/storage';

const SEEN_POPOVER_KEY = 'operational_alerts_seen_popover';
const OPENED_DRAWER_KEY = 'operational_alerts_opened_drawer';

const DEFAULT_ROOMS_THRESHOLD = 5;

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
  recipientOptions?: { value: string; label: string }[];
  roomsThresholdCount: number | null;
}

type OperationalAlertsFormState = Record<MetricKey, MetricFormState>;

const projectStorageKey = (key: string): string => {
  const { project } = useConfig();
  const projectUuid = project?.uuid || moduleStorage.getItem('projectUuid');
  return projectUuid ? `${key}_${projectUuid}` : key;
};

export const useMetricGoals = defineStore('metricGoals', () => {
  const goals = ref<Partial<Record<MetricKey, MetricGoal>>>({});

  const loadingGoals = ref(false);
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
              threshold: metricForm.threshold as number,
              unit: metricForm.unit,
              is_active: true,
              email_enabled: emailEnabled,
              recipients: emailEnabled
                ? metricForm.recipients.map((permissionUuid) => ({
                    uuid_project_permission: permissionUuid,
                  }))
                : [],
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
    loadingGoals,
    savingGoals,
    hasLoadedGoals,
    hasSeenPopover,
    hasOpenedDrawer,
    hasConfiguredGoals,
    getGoalForMetric,
    setHasSeenPopover,
    setHasOpenedDrawer,
    loadGoals,
    saveGoals,
  };
});

export type { MetricFormState, OperationalAlertsFormState };
