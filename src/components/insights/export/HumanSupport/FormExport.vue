<template>
  <section
    class="export-data-form"
    data-testid="export-data-form"
  >
    <header>
      <p
        class="export-data-form__description"
        data-testid="export-data-form-description"
      >
        {{ $t('export_data.description') }}
      </p>
    </header>
    <section
      class="export-data-form__content"
      data-testid="export-data-form-content"
    >
      <ExportFilterDate
        v-model="date_range"
        data-testid="export-data-filter-date"
        :label="$t('export_data.select_data.label')"
        :placeholder="$t('export_data.select_data.placeholder')"
        :options="shortCutOptions"
        :minDate="getMinDate()"
        :maxDate="getMaxDate()"
        @update:model-value="updateDateRange"
        @select-date="updateSelectDateRange"
      />

      <section
        class="export-data-form__chats-status"
        data-testid="export-data-form-chats-status"
      >
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

      <section
        class="export-data-form__filters"
        data-testid="export-data-form-filters"
      >
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
            :disabled="!hasSectorsSelected || isManySectorsSelected"
            :dependsOnValue="dependsOnValueQueues"
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
            :dependsOnValue="dependsOnValueAgents"
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
            :disabled="!hasSectorsSelected || isManySectorsSelected"
            :dependsOnValue="dependsOnValueTags"
            @update:model-value="updateTags"
          />
        </section>
      </section>

      <FormCheckbox data-testid="human-support-form-checkbox-component" />

      <ExportFooter
        data-testid="human-support-export-footer"
        :selectedFormat="selectedFormat"
        :acceptTerms="accept_terms"
        :formatLabel="$t('export_data.select_format')"
        :warningTermsText="$t('export_data.warning_terms')"
        :acceptTermsText="$t('export_data.accept_terms')"
        @format-change="updateFormat"
        @accept-terms-change="updateAcceptTerms"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import FormCheckbox from './FormCheckbox.vue';
import ExportFooter from '../ExportFooter.vue';
import ExportFilterDate from '../ExportFilterDate.vue';
import { useHumanSupportExport } from '@/store/modules/export/humanSupport/export';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, subDays, addDays, isValid, parseISO, isAfter } from 'date-fns';

const humanSupportExport = useHumanSupportExport();
const {
  setStatusChats,
  setDateRange,
  setSectors,
  setAgents,
  setQueues,
  setTags,
  setType,
  setAcceptTerms,
} = humanSupportExport;
const {
  open_chats,
  sectors,
  agents,
  queues,
  tags,
  type,
  accept_terms,
  date_range,
} = storeToRefs(humanSupportExport);

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

const isManySectorsSelected = computed(() => {
  return sectors.value?.length > 1 && sectorsForDependency.value !== '__all__';
});

const dependsOnValueQueues = computed(() => {
  if (sectors.value?.length === 1 && sectorsForDependency.value !== '__all__') {
    return { sector_id: sectorsForDependency.value };
  }
  return { sectors: sectorsForDependency.value };
});

const dependsOnValueAgents = computed(() => {
  if (sectors.value?.length === 1 && sectorsForDependency.value !== '__all__') {
    return { sector_id: sectorsForDependency.value };
  }
  return { sectors: sectorsForDependency.value };
});

const dependsOnValueTags = computed(() => {
  if (sectors.value?.length === 1 && sectorsForDependency.value !== '__all__') {
    return { sector_id: sectorsForDependency.value };
  }
  return { sectors: sectorsForDependency.value };
});

const updateDateRange = (value: { start: string; end: string }) => {
  setDateRange(value.start, value.end);
};

const updateSelectDateRange = (value: { start: string; end: string }) => {
  selectDateRange.value = value;
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

const selectDateRange = ref({ start: '', end: '' });

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

const getMinDate = (): string => {
  const currentSelection = selectDateRange.value;

  const defaultMin = format(subDays(new Date(), 92), 'yyyy-MM-dd');

  if (currentSelection.start === '' && currentSelection.end === '') {
    return null;
  }

  if (!currentSelection || !currentSelection.start) {
    return defaultMin;
  }

  const startDate = parseISO(currentSelection.start);

  if (
    isValid(startDate) &&
    (!currentSelection.end || currentSelection.start === currentSelection.end)
  ) {
    const calculatedMin = format(subDays(startDate, 92), 'yyyy-MM-dd');
    const calculatedMinDate = parseISO(calculatedMin);
    return isValid(calculatedMinDate) ? calculatedMin : defaultMin;
  }

  if (!isValid(startDate)) {
    return null;
  }

  if (isValid(startDate) && defaultMin !== format(startDate, 'yyyy-MM-dd')) {
    return format(subDays(startDate, 92), 'yyyy-MM-dd');
  }

  return defaultMin;
};

const getMaxDate = (): string => {
  const today = new Date();
  const currentSelection = selectDateRange.value;
  const defaultMax = format(today, 'yyyy-MM-dd');

  if (!currentSelection || !currentSelection.start) {
    return defaultMax;
  }

  const startDate = parseISO(currentSelection.start);

  if (
    isValid(startDate) &&
    (!currentSelection.end || currentSelection.start === currentSelection.end)
  ) {
    const calculatedMax = addDays(startDate, 92);
    if (isAfter(calculatedMax, today)) {
      return defaultMax;
    }
    return format(calculatedMax, 'yyyy-MM-dd');
  }

  return defaultMax;
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
}
</style>
