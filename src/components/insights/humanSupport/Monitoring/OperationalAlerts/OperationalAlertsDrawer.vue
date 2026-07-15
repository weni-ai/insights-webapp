<template>
  <UnnnicDrawerNext
    :open="modelValue"
    @update:open="handleOpenChange"
  >
    <UnnnicDrawerContent
      class="operational-alerts-drawer"
      size="extra-large"
      data-testid="operational-alerts-drawer"
    >
      <UnnnicDrawerHeader>
        <UnnnicDrawerTitle>
          {{ $t('operational_alerts.drawer.title') }}
        </UnnnicDrawerTitle>
      </UnnnicDrawerHeader>

      <section class="operational-alerts-drawer__body">
        <p
          class="operational-alerts-drawer__description"
          data-testid="operational-alerts-description"
        >
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
            :disabled="isViewerPermission"
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
              :readonly="isViewerPermission"
            />
          </template>

          <hr
            v-if="
              formState[metric].enabled &&
              metric !== metricKeys[metricKeys.length - 1]
            "
            class="operational-alerts-drawer__separator"
            data-testid="operational-alerts-separator"
          />
        </section>
      </section>

      <UnnnicDrawerFooter class="operational-alerts-drawer__footer">
        <UnnnicDrawerClose>
          <UnnnicButton
            class="secondary"
            type="tertiary"
            :text="!isViewerPermission ? $t('cancel') : $t('close')"
            :disabled="savingGoals"
          />
        </UnnnicDrawerClose>
        <UnnnicButton
          v-if="!isViewerPermission"
          class="primary"
          type="primary"
          :text="$t('save')"
          :disabled="!isValid || savingGoals"
          :loading="savingGoals"
          @click="handleSave"
        />
      </UnnnicDrawerFooter>
    </UnnnicDrawerContent>
  </UnnnicDrawerNext>
</template>

<script setup lang="ts">
import { unnnicCallAlert } from '@weni/unnnic-system';
import { reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import OperationalAlertForm from './OperationalAlertForm.vue';

import {
  useMetricGoals,
  METRIC_KEYS,
  DEFAULT_ROOMS_THRESHOLD,
  MetricFormState,
  OperationalAlertsFormState,
} from '@/store/modules/humanSupport/metricGoals';

import {
  MetricKey,
  formatRecipientLabel,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

import { useUser } from '@/store/modules/user';

const userStore = useUser();
const { isViewerPermission } = storeToRefs(userStore);

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

const buildMetricFormState = (metric: MetricKey): MetricFormState => {
  const goal = getGoalForMetric(metric);

  if (!goal?.isActive) {
    return {
      enabled: false,
      threshold: null,
      unit: 'm',
      recipients: [],
      roomsThresholdCount: DEFAULT_ROOMS_THRESHOLD,
    };
  }

  console.log({ metric, goal });

  return {
    enabled: true,
    threshold: goal.thresholdValue,
    unit: goal.unit,
    recipients: [...goal.recipients],
    recipientOptions: goal.recipientDetails.map((recipient) => ({
      value: recipient.email,
      label: formatRecipientLabel(recipient),
    })),
    roomsThresholdCount: goal.roomsThresholdCount ?? DEFAULT_ROOMS_THRESHOLD,
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

const handleOpenChange = (open: boolean) => {
  emit('update:modelValue', open);
  if (!open) {
    emit('close');
  }
};

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

defineExpose({ formState });
</script>

<style lang="scss">
.operational-alerts-drawer__footer.unnnic-drawer__footer {
  justify-content: flex-end;

  > * {
    flex-grow: 0;
    width: auto;
  }
}
</style>

<style scoped lang="scss">
.operational-alerts-drawer__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $unnnic-space-6;
  overflow-y: auto;
  padding: $unnnic-space-6;
}

.operational-alerts-drawer__description {
  margin: 0;
  font: $unnnic-font-body;
  color: $unnnic-color-fg-base;
}

.operational-alerts-drawer__section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;
}

.operational-alerts-drawer__separator {
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px solid $unnnic-color-border-soft;
}
</style>
