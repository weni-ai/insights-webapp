<template>
  <section class="export-data-form">
    <header>
      <p class="export-data-form__description">
        {{ $t('export_data.description') }}
      </p>
    </header>
    <section class="export-data-form__content">
      <UnnnicLabel :label="$t('export_data.select_data.label')" />
      <FilterDate
        v-model="dateRange"
        :placeholder="$t('export_data.select_data.placeholder')"
        @update:model-value="updateDateRange"
      />

      <section class="export-data-form__filters">
        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.sector')" />
          <FilterMultiSelect
            v-model="sectors"
            :placeholder="$t('export_data.filters.select_sector')"
            source="sectors"
            keyValueField="uuid"
            @update:model-value="updateSectors"
          />
        </section>

        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.agent')" />
          <FilterSelect
            v-model="agents"
            :placeholder="$t('export_data.filters.select_agent')"
            source="agents"
            keyValueField="uuid"
            :disabled="!hasSectorsSelected"
            :dependsOnValue="{ sectors: sectorsForDependency }"
            @update:model-value="updateAgents"
          />
        </section>

        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.queue')" />
          <FilterSelect
            v-model="queues"
            :placeholder="$t('export_data.filters.select_queue')"
            source="queues"
            keyValueField="uuid"
            :disabled="!hasSectorsSelected"
            :dependsOnValue="{ sectors: sectorsForDependency }"
            @update:model-value="updateQueues"
          />
        </section>

        <section class="export-data-form__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.tag')" />
          <FilterSelect
            v-model="tags"
            :placeholder="$t('export_data.filters.select_tag')"
            source="tags"
            keyValueField="uuid"
            :disabled="!hasSectorsSelected"
            :dependsOnValue="{ sectors: sectorsForDependency }"
            @update:model-value="updateTags"
          />
        </section>
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
    </section>
  </section>
</template>

<script setup lang="ts">
import FilterDate from '@/components/insights/Layout/HeaderFilters/FilterDate.vue';
import FilterSelect from '@/components/insights/Layout/HeaderFilters/FilterSelect.vue';
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import { useExportData } from '@/store/modules/export/exportData';
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';

const exportDataStore = useExportData();
const {
  setStatusChats,
  setDateRange,
  setSectors,
  setAgents,
  setQueues,
  setTags,
} = exportDataStore;
const { open_chats, sectors, agents, queues, tags } =
  storeToRefs(exportDataStore);

const dateRange = ref({
  start: '',
  end: '',
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
  dateRange.value = value;
  setDateRange(value.start, value.end);
  console.log('Date range updated:', value);
};

const updateChatStatus = (status: string) => {
  setStatusChats(status === 'open');
};

const updateSectors = (value: any[]) => {
  setSectors(value);
  setAgents('');
  setQueues('');
  setTags('');
};

const updateAgents = (value: string) => {
  setAgents(value);
};

const updateQueues = (value: string) => {
  setQueues(value);
};

const updateTags = (value: string) => {
  setTags(value);
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

    :deep(.unnnic-label__label) {
      margin: 0;
    }
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
