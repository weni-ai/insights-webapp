<template>
  <section class="filter-multi-select">
    <UnnnicMultiSelect
      v-model="modelValue"
      :options="options"
      clearable
      :label="filterLabel"
      :placeholder="t('human_support_dashboard.filters.common.placeholder')"
      :data-testid="`detailed-filters-select-${props.type}`"
      enableSearch
      :search="searchValue"
      @update:search="setSearchValue"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import Projects from '@/services/api/resources/projects';

const { t } = useI18n();

interface Props {
  type: string;
  label: string;
  source: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (_e: 'change', _payload: { value: string[]; label: string }): void;
}>();

const modelValue = defineModel<string[]>('modelValue');

const options = computed(() => {
  return [
    {
      value: 'online',
      label: 'Online',
    },
    ...loadedOptions.value,
    {
      value: 'offline',
      label: 'Offline',
    },
  ];
});

const searchValue = ref('');

const setSearchValue = (value: string) => {
  searchValue.value = value;
};

const filterLabel = computed(() =>
  t(`human_support_dashboard.filters.${props.type}.label`),
);

const loadedOptions = ref<{ value: string; label: string }[]>([]);

const loadOptions = async () => {
  try {
    const response = await Projects.getProjectSource(props.source);
    loadedOptions.value = response.map((item: any) => ({
      value: item.value,
      label: item.label,
    }));
  } catch (error) {
    console.error('Error loading options', error);
  }
};

watch(modelValue, (newVal) => {
  emit('change', { value: newVal, label: '' });
});
onMounted(() => {
  loadOptions();
});
</script>

<style lang="scss" scoped>
.filter-multi-select {
  display: flex;
  max-width: 25%;
  flex: 0 0 25%;
  > * {
    width: 100%;
  }
}
</style>
