<template>
  <section
    class="operational-alert-form"
    :data-testid="`operational-alert-form-${metric}`"
  >
    <section class="operational-alert-form__time">
      <section class="operational-alert-form__row">
        <section
          class="operational-alert-form__field operational-alert-form__field--threshold"
        >
          <UnnnicLabel
            :label="$t(`operational_alerts.form.threshold_labels.${metric}`)"
          />
          <UnnnicInput
            v-model="thresholdModel"
            type="number"
            nativeType="number"
            :placeholder="
              $t(`operational_alerts.form.threshold_placeholders.${metric}`)
            "
            :disabled="readonly"
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
            :disabled="readonly"
            :data-testid="`unit-select-${metric}`"
          />
        </section>
      </section>
    </section>

    <section class="operational-alert-form__email">
      <section class="operational-alert-form__email-label">
        <UnnnicLabel
          :label="$t('operational_alerts.form.email_notification_label')"
        />
        <UnnnicToolTip
          enabled
          :text="$t('operational_alerts.form.email_notification_tooltip')"
          side="right"
          maxWidth="570px"
          :data-testid="`email-tooltip-${metric}`"
        >
          <UnnnicIcon
            icon="info"
            size="sm"
            scheme="neutral-cloudy"
          />
        </UnnnicToolTip>
      </section>

      <section class="operational-alert-form__row">
        <section
          class="operational-alert-form__field operational-alert-form__field--recipients"
        >
          <UnnnicLabel
            :label="$t('operational_alerts.form.send_email_to_label')"
          />
          <FilterMultiSelect
            ref="filterMultiSelectRef"
            :modelValue="selectedRecipients"
            source="agents"
            keyValueField="email"
            :fetchRequest="Projects.getProjectManagers"
            :disabled="readonly"
            :placeholder="
              $t('operational_alerts.form.send_email_to_placeholder')
            "
            :data-testid="`recipients-select-${metric}`"
            @update:model-value="updateRecipients"
          />
          <p class="operational-alert-form__helper">
            {{ $t('operational_alerts.form.recipients_helper') }}
          </p>
        </section>

        <section
          class="operational-alert-form__field operational-alert-form__field--when"
        >
          <UnnnicLabel :label="$t('operational_alerts.form.when_label')" />
          <UnnnicInput
            v-model="roomsThresholdModel"
            type="number"
            nativeType="number"
            :placeholder="$t('operational_alerts.form.when_placeholder')"
            :disabled="readonly"
            :data-testid="`when-input-${metric}`"
          />
          <p class="operational-alert-form__helper">
            {{ $t('operational_alerts.form.when_helper') }}
          </p>
        </section>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import {
  UnnnicLabel,
  UnnnicInput,
  UnnnicSelect,
  UnnnicToolTip,
  UnnnicIcon,
} from '@weni/unnnic-system';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';

import Projects from '@/services/api/resources/projects';

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
  readonly?: boolean;
}>();

const model = defineModel<MetricFormState>({ required: true });

const { t } = useI18n();

const filterMultiSelectRef = useTemplateRef('filterMultiSelectRef');
const selectedRecipients = ref<RecipientOption[]>([]);

const unitOptions = computed<{ value: TimeUnit; label: string }[]>(() => [
  { value: 's', label: t('operational_alerts.form.units.seconds') },
  { value: 'm', label: t('operational_alerts.form.units.minutes') },
  { value: 'h', label: t('operational_alerts.form.units.hours') },
]);

const syncRecipientsFromModel = () => {
  const loadedOptions = filterMultiSelectRef.value?.options || [];
  const presetOptions = model.value.recipientOptions || [];

  selectedRecipients.value = model.value.recipients.map((recipientId) => {
    const fromOptions = loadedOptions.find(
      (option) => option.value === recipientId,
    );
    const fromPreset = presetOptions.find(
      (option) => option.value === recipientId,
    );
    const fromSelected = selectedRecipients.value.find(
      (option) => option.value === recipientId,
    );

    return (
      fromOptions ||
      fromPreset ||
      fromSelected || { value: recipientId, label: recipientId }
    );
  });
};

watch(() => model.value.recipients, syncRecipientsFromModel, {
  immediate: true,
  deep: true,
});

watch(() => filterMultiSelectRef.value?.options, syncRecipientsFromModel, {
  deep: true,
});

const updateRecipients = (value: RecipientOption[]) => {
  selectedRecipients.value = value || [];
  model.value.recipients = selectedRecipients.value.map(
    (option) => option.value,
  );
};

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
</script>

<style scoped lang="scss">
.operational-alert-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__time {
    display: flex;
    flex-direction: column;
  }

  &__email {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }

  &__row {
    display: flex;
    gap: $unnnic-space-4;
  }

  &__field {
    display: flex;
    flex-direction: column;

    &--threshold {
      flex: 1;
    }

    &--unit {
      flex: 1;
    }

    &--recipients {
      flex: 1;
    }

    &--when {
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
