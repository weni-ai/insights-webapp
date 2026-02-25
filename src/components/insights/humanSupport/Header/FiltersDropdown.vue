<template>
  <section class="filters-dropdown">
    <UnnnicDropdown
      class="filters-dropdown__dropdown"
      data-testid="filters-dropdown"
      :useOpenProp="true"
      :open="isOpenDropdown"
      :forceOpen="isOptionsActive"
      @update:open="handleDropdownToggle"
    >
      <template #trigger>
        <UnnnicButton
          data-testid="filters-dropdown-button"
          type="secondary"
          iconLeft="filter_list"
          :text="titleButton"
          :disabled="!hasChatsSectors"
        />
      </template>

      <section
        class="filters-dropdown__content"
        @click.stop
      >
        <section class="filters-dropdown__container">
          <UnnnicLabel :label="$t('export_data.filters.sector')" />
          <FilterMultiSelect
            v-model="sectors"
            :placeholder="$t('export_data.filters.select_sector')"
            source="sectors"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_sectors')"
            @update:model-value="handleUpdateSectors"
            @on-options-active-change="handleOptionsActiveChange"
          />
        </section>

        <section class="filters-dropdown__container">
          <UnnnicLabel :label="$t('export_data.filters.queue')" />
          <FilterMultiSelect
            v-model="queues"
            :placeholder="$t('export_data.filters.select_queue')"
            source="queues"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_queues')"
            :disabled="!hasSectorsSelected || isManySectorsSelected"
            :dependsOnValue="dependsOnValueQueues"
            @on-options-active-change="handleOptionsActiveChange"
          />
        </section>

        <section class="filters-dropdown__container">
          <UnnnicLabel :label="$t('export_data.filters.tag')" />
          <FilterMultiSelect
            v-model="tags"
            :placeholder="$t('export_data.filters.select_tag')"
            source="tags"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_tags')"
            :disabled="!hasSectorsSelected || isManySectorsSelected"
            :dependsOnValue="dependsOnValueTags"
            @on-options-active-change="handleOptionsActiveChange"
          />
        </section>

        <section class="filters-dropdown__footer">
          <UnnnicButton
            class="filters-dropdown__footer-button"
            :text="$t('insights_header.clear_filters')"
            type="tertiary"
            data-testid="clear-filters-button"
            @click="handleClearFilters"
          />
          <UnnnicButton
            class="filters-dropdown__footer-button"
            :text="$t('insights_header.filtrate')"
            type="primary"
            data-testid="apply-filters-button"
            :disabled="hasAppliedFiltersNoChanges"
            @click="handleApplyFilters"
          />
        </section>
      </section>
    </UnnnicDropdown>
  </section>
</template>

<script setup lang="ts">
import { UnnnicButton, UnnnicDropdown, UnnnicLabel } from '@weni/unnnic-system';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';

import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useProject } from '@/store/modules/project';

const projectStore = useProject();
const { hasChatsSectors } = storeToRefs(projectStore);

const humanSupport = useHumanSupport();
const { clearFilters, saveAppliedFilters } = humanSupport;
const {
  appliedFiltersLength,
  sectors,
  queues,
  tags,
  hasAppliedFiltersNoChanges,
} = storeToRefs(humanSupport);

const { t } = useI18n();

const isOptionsActive = ref(false);
const isOpenDropdown = ref(false);

const handleDropdownToggle = (open: boolean) => {
  if (!open && isOptionsActive.value) {
    isOpenDropdown.value = true;
    return;
  }
  isOpenDropdown.value = open;
};

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

const dependsOnValueTags = computed(() => {
  if (sectors.value?.length === 1 && sectorsForDependency.value !== '__all__') {
    return { sector_id: sectorsForDependency.value };
  }
  return { sectors: sectorsForDependency.value };
});

const handleClearFilters = () => {
  clearFilters();
  isOpenDropdown.value = false;
};

const handleApplyFilters = () => {
  saveAppliedFilters();
  isOpenDropdown.value = false;
};

const handleUpdateSectors = (value: any[]) => {
  sectors.value = value;
  queues.value = [];
  tags.value = [];
};

const handleOptionsActiveChange = (active: boolean) => {
  if (!active) {
    setTimeout(() => {
      isOptionsActive.value = active;
    }, 100);
  } else {
    isOptionsActive.value = active;
  }
};

const titleButton = computed(() => {
  if (appliedFiltersLength.value > 0) {
    return `${t('insights_header.filters')} (${appliedFiltersLength.value})`;
  }

  return t('insights_header.filters');
});
</script>

<style lang="scss" scoped>
.filters-dropdown {
  display: flex;
  padding-right: $unnnic-space-1;

  &__dropdown {
    width: 100%;
  }

  &__content {
    width: 400px;
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-spacing-md;
    padding: $unnnic-space-3 $unnnic-space-2;
  }

  &__container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }

  &__footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: $unnnic-spacing-sm;

    &-button {
      width: 100%;
    }
  }
}
</style>
