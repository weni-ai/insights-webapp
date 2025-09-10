<template>
  <ExportCheckboxs
    :modelFields="model_fields"
    :selectedFields="selected_fields"
    :enabledModels="enabled_models"
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
const { model_fields, selected_fields, enabled_models } =
  storeToRefs(conversationalExport);
const isLoading = ref(false);

const modelFilters = computed(() => []);

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

const handleModelToggle = (modelName: string, enabled: boolean) => {
  toggleModelEnabled(modelName, enabled);
};

const handleFieldToggle = (
  modelName: string,
  fieldName: string,
  selected: boolean,
) => {
  updateModelFieldSelection(modelName, fieldName, selected);
};

onMounted(() => {
  initializeFields();
});
</script>
