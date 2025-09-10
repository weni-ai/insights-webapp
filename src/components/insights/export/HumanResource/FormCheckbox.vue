<template>
  <ExportCheckboxs
    :modelFields="model_fields"
    :selectedFields="selected_fields"
    :enabledModels="enabled_models"
    :sectors="sectors"
    :queues="queues"
    :agents="agents"
    :tags="tags"
    :isLoading="isLoading"
    @model-toggle="handleModelToggle"
    @field-toggle="handleFieldToggle"
  />
</template>

<script setup lang="ts">
import ExportCheckboxs from '../ExportCheckboxs.vue';
import exportService from '@/services/api/resources/export/export';
import { useHumanResourceExport } from '@/store/modules/export/humanResource/export';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

const humanResourceExport = useHumanResourceExport();
const { setModelFields, updateModelFieldSelection, toggleModelEnabled } =
  humanResourceExport;
const {
  model_fields,
  selected_fields,
  enabled_models,
  sectors,
  queues,
  agents,
  tags,
} = storeToRefs(humanResourceExport);
const isLoading = ref(false);

const fetchModelFields = async () => {
  isLoading.value = true;
  try {
    const modelFields = await exportService.getModelFields();
    const transformedFields: any = {};

    Object.entries(modelFields).forEach(([modelName, fields]) => {
      transformedFields[modelName] = {};
      Object.entries(fields as any).forEach(
        ([fieldName, fieldData]: [string, any]) => {
          transformedFields[modelName][fieldName] = {
            type: fieldData.type,
          };
        },
      );
    });

    setModelFields(transformedFields);
  } catch (error) {
    console.error(error);
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
  fetchModelFields();
});
</script>
