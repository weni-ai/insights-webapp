<template>
  <section
    class="filter-input"
    :data-testid="`filter-input-${type}`"
  >
    <UnnnicInput
      :label="filterLabel"
      :data-testid="`filter-input-field-${type}`"
      :modelValue="modelValue"
      iconLeft="search"
      :placeholder="placeholder"
      size="sm"
      @update:model-value="handleInput"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

type FilterType = 'contact';

interface Props {
  type: FilterType;
  modelValue: string;
}

interface Emits {
  (_e: 'update:modelValue', _value: string): void;
  (_e: 'change', _value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const filterLabel = computed(() =>
  t(`human_support_dashboard.filters.${props.type}.label`),
);

const placeholder = computed(() =>
  t('human_support_dashboard.filters.common.placeholder'),
);

const clearDebounceTimer = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
    debounceTimer.value = null;
  }
};

const handleInput = (value: string) => {
  emit('update:modelValue', value);

  clearDebounceTimer();

  debounceTimer.value = setTimeout(() => {
    emit('change', value);
  }, 500);
};

const clearData = () => {
  clearDebounceTimer();
  emit('update:modelValue', '');
  emit('change', '');
};

onBeforeUnmount(() => {
  clearDebounceTimer();
});

defineExpose({
  clearData,
});
</script>

<style scoped lang="scss">
.filter-input {
  display: flex;
  flex-direction: column;
  flex: 0 0 calc(100% / 4);
  max-width: calc(100% / 4);
  gap: $unnnic-space-1;
}
</style>
