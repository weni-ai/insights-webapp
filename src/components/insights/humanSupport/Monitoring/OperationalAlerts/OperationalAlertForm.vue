<template>
  <section
    class="operational-alert-form"
    :data-testid="`operational-alert-form-${metric}`"
  >
    <section class="operational-alert-form__row">
      <section
        class="operational-alert-form__field operational-alert-form__field--threshold"
      >
        <UnnnicLabel :label="$t('operational_alerts.form.threshold_label')" />
        <UnnnicInput
          v-model="thresholdModel"
          type="number"
          nativeType="number"
          :placeholder="$t('operational_alerts.form.threshold_placeholder')"
          :data-testid="`threshold-input-${metric}`"
        />
      </section>
      <section
        class="operational-alert-form__field operational-alert-form__field--unit"
      >
        <UnnnicLabel :label="$t('operational_alerts.form.unit_label')" />
        <UnnnicSelect
          v-model="unitModel"
          :options="unitOptions"
          itemLabel="label"
          itemValue="value"
          :data-testid="`unit-select-${metric}`"
        />
      </section>
    </section>

    <section class="operational-alert-form__field">
      <section class="operational-alert-form__email-label">
        <UnnnicLabel
          :label="$t('operational_alerts.form.email_notification_label')"
        />
        <UnnnicToolTip
          enabled
          :text="$t('operational_alerts.form.email_notification_tooltip')"
          side="top"
          :data-testid="`email-tooltip-${metric}`"
        >
          <UnnnicIcon
            icon="info"
            size="sm"
            filled
            scheme="neutral-cloudy"
          />
        </UnnnicToolTip>
      </section>
      <UnnnicLabel :label="$t('operational_alerts.form.send_email_to_label')" />
      <UnnnicMultiSelect
        v-model="recipientsModel"
        :options="recipientOptions"
        returnObject
        clearable
        :placeholder="$t('operational_alerts.form.send_email_to_placeholder')"
        :data-testid="`recipients-select-${metric}`"
      />
      <p class="operational-alert-form__helper">
        {{ $t('operational_alerts.form.recipients_helper') }}
      </p>
    </section>

    <section
      v-if="hasRecipients"
      class="operational-alert-form__field operational-alert-form__field--when"
    >
      <UnnnicLabel :label="$t('operational_alerts.form.when_label')" />
      <UnnnicInput
        v-model="roomsThresholdModel"
        type="number"
        nativeType="number"
        :data-testid="`when-input-${metric}`"
      />
      <p class="operational-alert-form__helper">
        {{ $t('operational_alerts.form.when_helper') }}
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import {
  UnnnicLabel,
  UnnnicInput,
  UnnnicSelect,
  UnnnicMultiSelect,
  UnnnicToolTip,
  UnnnicIcon,
} from '@weni/unnnic-system';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useMetricGoals } from '@/store/modules/humanSupport/metricGoals';
import { MetricFormState } from '@/store/modules/humanSupport/metricGoals';
import {
  MetricKey,
  TimeUnit,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

interface RecipientOption {
  value: string;
  label: string;
}

defineProps<{
  metric: MetricKey;
}>();

const model = defineModel<MetricFormState>({ required: true });

const { t } = useI18n();

const metricGoalsStore = useMetricGoals();
const { recipients } = storeToRefs(metricGoalsStore);

const unitOptions = computed<{ value: TimeUnit; label: string }[]>(() => [
  { value: 's', label: t('operational_alerts.form.units.seconds') },
  { value: 'm', label: t('operational_alerts.form.units.minutes') },
  { value: 'h', label: t('operational_alerts.form.units.hours') },
]);

const recipientOptions = computed<RecipientOption[]>(() =>
  recipients.value.map((recipient) => {
    const name = `${recipient.first_name} ${recipient.last_name}`.trim();
    return {
      value: recipient.uuid_project_permission,
      label: name || recipient.email,
    };
  }),
);

const thresholdModel = computed<string>({
  get: () =>
    model.value.threshold === null ? '' : String(model.value.threshold),
  set: (value) => {
    const parsed = value === '' ? null : Number(value);
    model.value.threshold =
      parsed === null || Number.isNaN(parsed) ? null : parsed;
  },
});

const unitModel = computed<TimeUnit>({
  get: () => model.value.unit,
  set: (value) => {
    model.value.unit = value;
  },
});

const roomsThresholdModel = computed<string>({
  get: () =>
    model.value.roomsThresholdCount === null
      ? ''
      : String(model.value.roomsThresholdCount),
  set: (value) => {
    const parsed = value === '' ? null : Number(value);
    model.value.roomsThresholdCount =
      parsed === null || Number.isNaN(parsed) ? null : parsed;
  },
});

const recipientsModel = computed<RecipientOption[]>({
  get: () =>
    recipientOptions.value.filter((option) =>
      model.value.recipients.includes(option.value),
    ),
  set: (value) => {
    model.value.recipients = (value || []).map((option) => option.value);
  },
});

const hasRecipients = computed(() => model.value.recipients.length > 0);
</script>

<style scoped lang="scss">
.operational-alert-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__row {
    display: flex;
    gap: $unnnic-space-4;
  }

  &__field {
    display: flex;
    flex-direction: column;

    &--threshold {
      flex: 2;
    }

    &--unit {
      flex: 1;
    }
  }

  &__email-label {
    display: flex;
    align-items: center;
    gap: $unnnic-space-1;
  }

  &__helper {
    margin-top: $unnnic-space-1;
    color: $unnnic-color-fg-muted;
    font: $unnnic-font-caption-2;
  }
}
</style>
