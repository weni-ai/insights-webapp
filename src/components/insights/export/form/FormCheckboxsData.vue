<template>
  <section class="form-checkboxs-data">
    <section class="form-checkboxs-data__models">
      <template
        v-for="(modelData, modelName) in model_fields"
        :key="modelName"
      >
        <section class="form-checkboxs-data__model">
          <div class="form-checkboxs-data__model-header">
            <UnnnicCheckbox
              :modelValue="isModelSelected(String(modelName))"
              :textRight="getModelLabel(String(modelName))"
              :indeterminate="isModelIndeterminate(String(modelName))"
              @change="toggleModel(String(modelName), $event)"
            />
          </div>

          <div
            v-if="getModelFieldsList(String(modelName)).length > 0"
            class="form-checkboxs-data__fields"
          >
            <template
              v-for="field in getModelFieldsList(String(modelName))"
              :key="field.name"
            >
              <UnnnicCheckbox
                :modelValue="isFieldSelected(String(modelName), field.name)"
                :textRight="getFieldLabel(field.name, field.type)"
                @change="toggleField(String(modelName), field.name, $event)"
              />
            </template>
          </div>
        </section>
      </template>
    </section>
    <section
      v-if="isLoading"
      class="form-checkboxs-data__loading"
    >
      <UnnnicSkeletonLoading
        v-for="i in 5"
        :key="i"
        width="100%"
        height="26px"
        data-testid="form-checkboxs-data-loading"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import exportService from '@/services/api/resources/export/export';
import { useExportData } from '@/store/modules/export/exportData';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

const exportDataStore = useExportData();
const { setModelFields, updateModelFieldSelection } = exportDataStore;
const { model_fields, selected_fields } = storeToRefs(exportDataStore);
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

const getModelFieldsList = (modelName: string) => {
  const modelData = model_fields.value[modelName];
  if (!modelData) return [];

  return Object.entries(modelData).map(([fieldName, fieldData]) => ({
    name: fieldName,
    type: fieldData.type,
  }));
};

const isFieldSelected = (modelName: string, fieldName: string) => {
  return selected_fields.value[modelName]?.includes(fieldName) || false;
};

const isModelSelected = (modelName: string) => {
  const modelFields = getModelFieldsList(modelName);
  const selectedFields = selected_fields.value[modelName] || [];
  return modelFields.length > 0 && selectedFields.length === modelFields.length;
};

const isModelIndeterminate = (modelName: string) => {
  const modelFields = getModelFieldsList(modelName);
  const selectedFields = selected_fields.value[modelName] || [];
  return (
    selectedFields.length > 0 && selectedFields.length < modelFields.length
  );
};

const toggleField = (
  modelName: string,
  fieldName: string,
  selected: boolean,
) => {
  updateModelFieldSelection(modelName, fieldName, selected);
};

const toggleModel = (modelName: string, selected: boolean) => {
  const modelFields = getModelFieldsList(modelName);

  if (selected) {
    const allFieldNames = modelFields.map((field) => field.name);
    if (!selected_fields.value[modelName]) {
      selected_fields.value[modelName] = [];
    }
    selected_fields.value[modelName] = allFieldNames;
  } else {
    selected_fields.value[modelName] = [];
  }
};

const getModelLabel = (modelName: string) => {
  return modelName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getFieldLabel = (fieldName: string, fieldType: string) => {
  const formattedName = fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return `${formattedName} (${fieldType})`;
};

onMounted(() => {
  fetchModelFields();
});
</script>

<style scoped lang="scss">
.form-checkboxs-data {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__models {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-md;
  }

  &__model {
    &-header {
      margin-bottom: $unnnic-spacing-xs;

      :deep(.unnnic-checkbox) {
        font-weight: $unnnic-font-weight-bold;
        color: $unnnic-color-neutral-darkest;
      }
    }
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
    padding-left: $unnnic-spacing-md;
    margin-left: $unnnic-spacing-xs;

    :deep(.unnnic-checkbox) {
      font-size: $unnnic-font-size-body-md;
      color: $unnnic-color-neutral-dark;
    }
  }

  &__loading {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }
}
</style>
