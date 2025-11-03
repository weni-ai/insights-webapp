<template>
  <ExportCheckboxs
    data-testid="human-support-form-checkbox"
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
import exportService from '@/services/api/resources/export/humanSupport/export';
import { useHumanSupportExport } from '@/store/modules/export/humanSupport/export';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';

const humanSupportExport = useHumanSupportExport();
const { setModelFields, updateModelFieldSelection, toggleModelEnabled } =
  humanSupportExport;
const {
  model_fields,
  selected_fields,
  enabled_models,
  sectors,
  queues,
  agents,
  tags,
} = storeToRefs(humanSupportExport);
const isLoading = ref(false);

const modelFilters = computed(() => [
  {
    modelName: 'sectors',
    filterData: sectors.value,
  },
  {
    modelName: 'queues',
    filterData: queues.value,
  },
  {
    modelName: 'users',
    filterData: agents.value,
  },
  {
    modelName: 'sector_tags',
    filterData: tags.value,
  },
]);

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
