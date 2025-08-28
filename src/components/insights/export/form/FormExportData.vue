<template>
  <section class="export-data-form">
    <header>
      <p class="export-data-form__description">
        {{ $t('export_data.description') }}
      </p>
    </header>
    <section class="export-data-form__content">
      <section class="export-data-form__date-range">
        <UnnnicLabel :label="$t('export_data.select_data.label')" />
        <FilterDate
          v-model="date_range"
          :placeholder="$t('export_data.select_data.placeholder')"
          :options="shortCutOptions"
          :minDate="handleMinDate()"
          :maxDate="handleMaxDate()"
          @update:model-value="updateDateRange"
        />
      </section>

      <section class="export-data-form__chats-status">
        <UnnnicRadio
          :data-testid="'radio-chats-open'"
          :modelValue="selectedChatStatus"
          value="open"
          @update:model-value="updateChatStatus('open')"
        >
          {{ $t('export_data.chats_open') }}
        </UnnnicRadio>
        <UnnnicRadio
          :data-testid="'radio-chats-closed'"
          :modelValue="selectedChatStatus"
          value="closed"
          @update:model-value="updateChatStatus('closed')"
        >
          {{ $t('export_data.chats_closed') }}
        </UnnnicRadio>
      </section>

      <section class="export-data-form__filters">
        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.sector')" />
          <FilterMultiSelect
            v-model="sectors"
            :placeholder="$t('export_data.filters.select_sector')"
            source="sectors"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_sectors')"
            @update:model-value="updateSectors"
          />
        </section>

        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.queue')" />
          <FilterMultiSelect
            v-model="queues"
            :placeholder="$t('export_data.filters.select_queue')"
            source="queues"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_queues')"
            :disabled="!hasSectorsSelected"
            :dependsOnValue="{ sectors: sectorsForDependency }"
            @update:model-value="updateQueues"
          />
        </section>

        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.agent')" />
          <FilterMultiSelect
            v-model="agents"
            :placeholder="$t('export_data.filters.select_agent')"
            source="agents"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_agents')"
            :disabled="!hasSectorsSelected"
            :dependsOnValue="{ sectors: sectorsForDependency }"
            @update:model-value="updateAgents"
          />
        </section>

        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.tag')" />
          <FilterMultiSelect
            v-model="tags"
            :placeholder="$t('export_data.filters.select_tag')"
            source="tags"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_tags')"
            :disabled="!hasSectorsSelected"
            :dependsOnValue="{ sectors: sectorsForDependency }"
            @update:model-value="updateTags"
          />
        </section>
      </section>

      <FormCheckboxsData />

      <section class="export-data-form__format">
        <UnnnicLabel :label="$t('export_data.select_format')" />
        <UnnnicRadio
          :data-testid="'radio-format-csv'"
          :modelValue="selectedFormat"
          value=".csv"
          @update:model-value="updateFormat('.csv')"
        >
          {{ '.CSV' }}
        </UnnnicRadio>
        <UnnnicRadio
          :data-testid="'radio-format-xlsx'"
          :modelValue="selectedFormat"
          value=".xlsx"
          @update:model-value="updateFormat('.xlsx')"
        >
          {{ '.XLSX' }}
        </UnnnicRadio>
      </section>

      <section class="export-data-form__terms">
        <p class="export-data-form__terms-warning">
          <UnnnicIcon
            icon="alert-circle-1"
            filled
            next
            scheme="feedback-yellow"
            size="ant"
          />{{ $t('export_data.warning_terms') }}
        </p>
        <UnnnicCheckbox
          :modelValue="accept_terms"
          :textRight="$t('export_data.accept_terms')"
          @update:model-value="updateAcceptTerms"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import FormCheckboxsData from './FormCheckboxsData.vue';
import { useExportData } from '@/store/modules/export/exportData';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLastNDays, getTodayDate } from '@/utils/time';

const exportDataStore = useExportData();
const {
  setStatusChats,
  setDateRange,
  setSectors,
  setAgents,
  setQueues,
  setTags,
  setType,
  setAcceptTerms,
} = exportDataStore;
const {
  open_chats,
  sectors,
  agents,
  queues,
  tags,
  type,
  accept_terms,
  date_range,
} = storeToRefs(exportDataStore);

const selectedFormat = computed(() => {
  return type.value === '.csv' ? '.csv' : '.xlsx';
});

const selectedChatStatus = computed(() => {
  return open_chats.value ? 'open' : 'closed';
});

const hasSectorsSelected = computed(() => {
  return sectors.value && sectors.value.length > 0;
});

const sectorsForDependency = computed(() => {
  return sectors.value?.map((sector: any) => sector.value).join(',') || '';
});

const updateDateRange = (value: { start: string; end: string }) => {
  setDateRange(value.start, value.end);
};

const updateChatStatus = (status: string) => {
  setStatusChats(status === 'open');
};

const updateSectors = (value: any[]) => {
  setSectors(value);
  setAgents([]);
  setQueues([]);
  setTags([]);
};

const updateAgents = (value: any[]) => {
  setAgents(value);
};

const updateQueues = (value: any[]) => {
  setQueues(value);
};

const updateTags = (value: any[]) => {
  setTags(value);
};

const updateFormat = (format: '.csv' | '.xlsx') => {
  setType(format);
};

const updateAcceptTerms = (value: boolean) => {
  setAcceptTerms(value);
};

const { t } = useI18n();

const shortCutOptions = computed(() => [
  {
    name: t('export_data.select_data.shortcuts.last_7_days'),
    id: 'last-7-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_14_days'),
    id: 'last-14-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_30_days'),
    id: 'last-30-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_60_days'),
    id: 'last-60-days',
  },
  {
    name: t('export_data.select_data.shortcuts.last_90_days'),
    id: 'last-90-days',
  },
  {
    name: t('export_data.select_data.shortcuts.current_month'),
    id: 'current-month',
  },
  {
    name: t('export_data.select_data.shortcuts.previous_month'),
    id: 'previous-month',
  },
]);

const handleMinDate = () => {
  const minDate = getLastNDays(92).start;
  return minDate;
};

const handleMaxDate = () => {
  const maxDate = getTodayDate().start;
  return maxDate;
};
</script>

<style scoped lang="scss">
.export-data-form {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  background: $unnnic-color-neutral-white;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    :deep(.unnnic-label__label) {
      margin: 0;
    }
  }

  &__date-range {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__filters-container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
    flex: 1 1 calc(50% - #{$unnnic-spacing-sm / 2});
    min-width: 0;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-spacing-sm;
  }

  &__chats-status {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__format {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__terms {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__terms-warning {
    display: flex;
    gap: $unnnic-spacing-xs;

    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
