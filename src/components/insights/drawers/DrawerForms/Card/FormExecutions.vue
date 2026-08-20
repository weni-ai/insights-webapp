<template>
  <SelectFlow v-model="config.flow.uuid" />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useWidgets } from '@/store/modules/widgets';
import SelectFlow from '@/components/SelectFlow.vue';

defineOptions({ name: 'FormExecutions' });

const emit = defineEmits<{
  'update:is-valid-form': [value: boolean];
}>();

const widgetsStore = useWidgets();
const { currentWidgetEditing } = storeToRefs(widgetsStore);

const config = ref<{ flow: { uuid: string | null } }>({
  flow: {
    uuid: null,
  },
});

const widgetConfig = computed(() => currentWidgetEditing.value.config);

const isValidForm = computed(() => !!config.value?.flow?.uuid);

watch(
  config,
  (newConfig) => {
    widgetsStore.updateCurrentWidgetEditingConfig({
      ...widgetConfig.value,
      ...newConfig,
    });
  },
  { deep: true },
);

watch(
  isValidForm,
  (newIsValidForm) => {
    emit('update:is-valid-form', newIsValidForm);
  },
  { immediate: true },
);

config.value = {
  flow: {
    uuid: widgetConfig.value.flow?.uuid || '',
  },
};

defineExpose({
  config,
  isValidForm,
  widgetConfig,
  updateCurrentWidgetEditingConfig: (...args: unknown[]) =>
    widgetsStore.updateCurrentWidgetEditingConfig(...(args as [any])),
});
</script>
