<template>
  <ExportCheckboxs
    data-testid="conversational-form-checkbox"
    :modelFields="translatedModelFields"
    :selectedFields="translatedSelectedFields"
    :enabledModels="translatedEnabledModels"
    :modelFilters="modelFilters"
    :isLoading="isLoading"
    @model-toggle="handleModelToggle"
    @field-toggle="handleFieldToggle"
  />
</template>

<script setup lang="ts">
import ExportCheckboxs from '../ExportCheckboxs.vue';
import { useConversationalExport } from '@/store/modules/export/conversational/export';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';

const conversationalExport = useConversationalExport();
const {
  updateModelFieldSelection,
  toggleModelEnabled,
  initializeDefaultFields,
} = conversationalExport;
const { model_fields, selected_fields, enabled_models, custom_widgets } =
  storeToRefs(conversationalExport);
const isLoading = ref(false);

const modelFilters = computed(() => []);

const getUniqueDisplayName = (widget: any): string => {
  const baseName = widget.name;
  const shortUuid = widget.uuid.slice(0, 8);

  const duplicates = custom_widgets.value.filter((w) => w.name === baseName);

  if (duplicates.length > 1) {
    return `${baseName} (${shortUuid})`;
  }

  return baseName;
};

const translatedSelectedFields = computed(() => {
  const fields = { ...selected_fields.value };

  if (custom_widgets.value.length > 0) {
    custom_widgets.value.forEach((widget) => {
      if (fields[widget.uuid]) {
        const fieldData = fields[widget.uuid];
        delete fields[widget.uuid];
        const uniqueName = getUniqueDisplayName(widget);
        fields[uniqueName] = fieldData;
      }
    });
  }

  return fields;
});

const translatedEnabledModels = computed(() => {
  return enabled_models.value.map((modelKey) => {
    const widget = custom_widgets.value.find((w) => w.uuid === modelKey);
    return widget ? getUniqueDisplayName(widget) : modelKey;
  });
});

const translatedModelFields = computed(() => {
  const fields = { ...model_fields.value };

  if (custom_widgets.value.length > 0) {
    custom_widgets.value.forEach((widget) => {
      if (fields[widget.uuid]) {
        const fieldData = fields[widget.uuid];
        delete fields[widget.uuid];
        const uniqueName = getUniqueDisplayName(widget);
        fields[uniqueName] = fieldData;
      }
    });
  }

  return fields;
});

const initializeFields = () => {
  isLoading.value = true;
  try {
    initializeDefaultFields();
  } catch (error) {
    console.error('Error initializing conversational fields', error);
  } finally {
    isLoading.value = false;
  }
};

const getModelKeyForStore = (displayName: string): string => {
  let widget = custom_widgets.value.find((w) => w.name === displayName);

  if (!widget) {
    const match = displayName.match(/^(.+) \(([a-f0-9-]{8})\)$/);
    if (match) {
      const [, baseName, shortUuid] = match;
      widget = custom_widgets.value.find(
        (w) => w.name === baseName && w.uuid.startsWith(shortUuid),
      );
    }
  }

  return widget ? widget.uuid : displayName;
};

const handleModelToggle = (modelName: string, enabled: boolean) => {
  const storeKey = getModelKeyForStore(modelName);
  toggleModelEnabled(storeKey, enabled);
};

const handleFieldToggle = (
  modelName: string,
  fieldName: string,
  selected: boolean,
) => {
  const storeKey = getModelKeyForStore(modelName);
  updateModelFieldSelection(storeKey, fieldName, selected);
};

onMounted(() => {
  initializeFields();
});
</script>
