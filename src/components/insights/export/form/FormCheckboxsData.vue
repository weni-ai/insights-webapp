<template>
  <section class="form-checkboxs-data">
    <section class="form-checkboxs-data__models">
      <template
        v-for="(modelData, modelName) in model_fields"
        :key="modelName"
      >
        <section
          v-if="shouldRenderModel(String(modelName))"
          class="form-checkboxs-data__model"
        >
          <div class="form-checkboxs-data__model-header">
            <UnnnicCheckbox
              :modelValue="isModelEnabled(String(modelName))"
              :textRight="getModelLabel(String(modelName))"
              @change="toggleModelEnabled(String(modelName), $event)"
            />
          </div>

          <div
            v-if="
              isModelEnabled(String(modelName)) &&
              getModelFieldsList(String(modelName)).length > 0
            "
            class="form-checkboxs-data__fields"
          >
            <template
              v-for="field in getModelFieldsList(String(modelName))"
              :key="field.name"
            >
              <UnnnicCheckbox
                :modelValue="isFieldSelected(String(modelName), field.name)"
                :textRight="getFieldLabel(field.name)"
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
import { useHumanResourceExport } from '@/store/modules/export/humanResource/export';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const humanResourceExport = useHumanResourceExport();
const { setModelFields, updateModelFieldSelection, toggleModelEnabled } =
  humanResourceExport;
const { t } = useI18n();
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

const isModelEnabled = (modelName: string) => {
  return enabled_models.value.includes(modelName);
};

const shouldRenderModel = (modelName: string) => {
  if (modelName === 'sectors') {
    return sectors.value.length > 0;
  }

  if (modelName === 'queues') {
    return queues.value.length > 0;
  }

  if (modelName === 'users') {
    return agents.value.length > 0;
  }

  if (modelName === 'sector_tags') {
    return tags.value.length > 0;
  }

  return true;
};

const toggleField = (
  modelName: string,
  fieldName: string,
  selected: boolean,
) => {
  updateModelFieldSelection(modelName, fieldName, selected);
};

const getModelLabel = (modelName: string) => {
  const translationKey = `export_data.model_labels.${modelName}`;
  const translation = t(translationKey);

  if (translation && translation !== translationKey) {
    return translation;
  }

  return modelName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getFieldLabel = (fieldName: string) => {
  const translationKey = `export_data.field_labels.${fieldName}`;
  const translation = t(translationKey);

  let fieldLabel;

  if (translation && translation !== translationKey) {
    fieldLabel = translation;
  } else {
    fieldLabel = fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return fieldLabel;
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
