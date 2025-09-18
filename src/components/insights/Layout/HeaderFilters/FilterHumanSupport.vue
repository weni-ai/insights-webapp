<template>
  <section class="filter-human-support">
    <UnnnicDropdown
      class="actions__dropdown"
      data-testid="actions-dropdown"
    >
      <template #trigger>
        <UnnnicButton
          data-testid="filter-human-support-button"
          type="secondary"
          iconLeft="filter_list"
          :text="titleButtonFilters"
          @click="openFiltersDropdown"
        />
      </template>

      <UnnnicDropdownItem
        v-for="(action, index) in [
          {
            icon: 'filter_list',
            text: titleButtonFilters,
            onClick: openFiltersDropdown,
          },
        ]"
        :key="index"
        class="dropdown__action"
        data-testid="action"
      >
        <section class="filter-human-support__filters-container">
          <UnnnicLabel :label="$t('export_data.filters.sector')" />
          <FilterMultiSelect
            v-model="sectors"
            class="filter-human-support__filter-multi-select"
            :placeholder="$t('export_data.filters.select_sector')"
            source="sectors"
            keyValueField="uuid"
            :allLabel="$t('export_data.filters.all_sectors')"
          />
        </section>
      </UnnnicDropdownItem>
    </UnnnicDropdown>
  </section>
</template>

<script setup lang="ts">
import { UnnnicButton, UnnnicLabel } from '@weni/unnnic-system';
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

const humanSupportMonitoring = useHumanSupportMonitoring();

const { appliedFiltersLength, sectors } = storeToRefs(humanSupportMonitoring);

const { t } = useI18n();

const openFiltersDropdown = () => {
  console.log('openFiltersDropdown');
};

const titleButtonFilters = computed(() => {
  if (appliedFiltersLength.value > 0) {
    return `${t('insights_header.filters')} (${appliedFiltersLength.value})`;
  }

  return t('insights_header.filters');
});
</script>

<style lang="scss" scoped>
.filter-human-support {
  display: flex;
}

.filter-human-support__filters-container {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}
</style>
