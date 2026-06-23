<template>
  <UnnnicDrawer
    ref="drawer"
    class="operational-alerts-drawer"
    :modelValue="modelValue"
    :title="$t('operational_alerts.drawer.title')"
    :primaryButtonText="$t('save')"
    :disabledPrimaryButton="!isValid"
    :loadingPrimaryButton="savingGoals"
    :secondaryButtonText="$t('cancel')"
    :disabledSecondaryButton="savingGoals"
    wide
    size="xl"
    data-testid="operational-alerts-drawer"
    @primary-button-click="handleSave"
    @secondary-button-click="close"
    @close="close"
  >
    <template #content>
      <section class="operational-alerts-drawer__content">
        <p class="operational-alerts-drawer__description">
          {{ $t('operational_alerts.drawer.description') }}
        </p>
        <section
          v-for="metric in metricKeys"
          :key="metric"
          class="operational-alerts-drawer__section"
          :data-testid="`operational-alerts-section-${metric}`"
        >
          <UnnnicSwitch
            v-model="formState[metric].enabled"
            :textRight="$t(`operational_alerts.sections.${metric}`)"
            :data-testid="`operational-alerts-switch-${metric}`"
          />

          <template v-if="formState[metric].enabled">
            <UnnnicDisclaimer
              v-if="metric === 'first_response_time'"
              type="informational"
              :description="$t('operational_alerts.first_response_info')"
              data-testid="operational-alerts-first-response-info"
            />
            <OperationalAlertForm
              v-model="formState[metric]"
              :metric="metric"
            />
          </template>
        </section>
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script setup lang="ts">
import {
  UnnnicDrawer,
  UnnnicSwitch,
  UnnnicDisclaimer,
  unnnicCallAlert,
} from '@weni/unnnic-system';
import { reactive, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import OperationalAlertForm from './OperationalAlertForm.vue';

import {
  useMetricGoals,
  METRIC_KEYS,
  MetricFormState,
  OperationalAlertsFormState,
} from '@/store/modules/humanSupport/metricGoals';
import {
  MetricKey,
  formatRecipientLabel,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_e: 'close'): void;
  (_e: 'update:modelValue', _value: boolean): void;
}>();

const { t } = useI18n();

const metricGoalsStore = useMetricGoals();
const { savingGoals } = storeToRefs(metricGoalsStore);
const { getGoalForMetric, saveGoals } = metricGoalsStore;

const metricKeys = METRIC_KEYS;

const DEFAULT_ROOMS_THRESHOLD = 5;

const buildMetricFormState = (metric: MetricKey): MetricFormState => {
  const goal = getGoalForMetric(metric);

  if (!goal?.is_active) {
    return {
      enabled: false,
      threshold: null,
      unit: 'm',
      recipients: [],
      roomsThresholdCount: DEFAULT_ROOMS_THRESHOLD,
    };
  }

  return {
    enabled: true,
    threshold: goal.threshold_value,
    unit: goal.unit,
    recipients: [...goal.recipients],
    recipientOptions: goal.recipientDetails.map((recipient) => ({
      value: recipient.uuid,
      label: formatRecipientLabel(recipient),
    })),
    roomsThresholdCount: goal.rooms_threshold_count || DEFAULT_ROOMS_THRESHOLD,
  };
};

const formState = reactive<OperationalAlertsFormState>({
  waiting_time: buildMetricFormState('waiting_time'),
  first_response_time: buildMetricFormState('first_response_time'),
  conversation_duration: buildMetricFormState('conversation_duration'),
});

const isValid = computed(() =>
  metricKeys.every((metric) => {
    const metricForm = formState[metric];
    if (!metricForm.enabled) return true;
    return metricForm.threshold !== null && metricForm.threshold > 0;
  }),
);

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleSave = async () => {
  if (!isValid.value) return;

  try {
    await saveGoals(formState);
    unnnicCallAlert({
      props: {
        text: t('operational_alerts.alerts.save_success'),
        type: 'success',
      },
      seconds: 5,
    });
    close();
  } catch (error) {
    console.error('Error saving operational alerts:', error);
    unnnicCallAlert({
      props: {
        text: t('operational_alerts.alerts.save_error'),
        type: 'error',
      },
      seconds: 5,
    });
  }
};

onMounted(() => {
  metricKeys.forEach((metric) => {
    Object.assign(formState[metric], buildMetricFormState(metric));
  });
});
</script>

<style lang="scss">
.operational-alerts-drawer.unnnic-drawer__container {
  .unnnic-drawer__footer {
    justify-content: flex-end;

    > * {
      flex-grow: 0;
      width: auto;
    }
  }
}
</style>

<style scoped lang="scss">
.operational-alerts-drawer {
  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-6;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }

  &__description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }
}
</style>
