<template>
  <section class="form-checkboxs-data">
    <section class="form-checkboxs-data__models">
      <template
        v-for="(modelData, modelName) in modelFields"
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
              @change="handleModelToggle(String(modelName), $event)"
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
                @change="
                  handleFieldToggle(String(modelName), field.name, $event)
                "
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
import { useI18n } from 'vue-i18n';

// Types
interface ModelField {
  type?: string;
}

interface ModelFields {
  [modelName: string]: {
    [fieldName: string]: ModelField;
  };
}

interface FieldItem {
  name: string;
  type?: string;
}

interface FilterItem {
  value: string;
  label: string;
}

interface ModelFilterConfig {
  modelName: string;
  filterData: FilterItem[];
}

// Props
interface Props {
  modelFields: ModelFields;
  selectedFields: { [modelName: string]: string[] };
  enabledModels: string[];
  modelFilters: ModelFilterConfig[];
  isLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelFields: () => ({}),
  selectedFields: () => ({}),
  enabledModels: () => [],
  modelFilters: () => [],
  isLoading: false,
});

// Emits
const emit = defineEmits<{
  'model-toggle': [modelName: string, enabled: boolean];
  'field-toggle': [modelName: string, fieldName: string, selected: boolean];
}>();

const { t } = useI18n();

const getModelFieldsList = (modelName: string): FieldItem[] => {
  const modelData = props.modelFields[modelName];
  if (!modelData) return [];

  return Object.entries(modelData).map(([fieldName, fieldData]) => ({
    name: fieldName,
    type: fieldData.type || 'string',
  }));
};

const isFieldSelected = (modelName: string, fieldName: string): boolean => {
  return props.selectedFields[modelName]?.includes(fieldName) || false;
};

const isModelEnabled = (modelName: string): boolean => {
  return props.enabledModels.includes(modelName);
};

const shouldRenderModel = (modelName: string): boolean => {
  const filterConfig = props.modelFilters.find(
    (filter) => filter.modelName === modelName,
  );

  if (filterConfig) {
    return filterConfig.filterData.length > 0;
  }

  return true;
};

const handleModelToggle = (modelName: string, enabled: boolean): void => {
  emit('model-toggle', modelName, enabled);
};

const handleFieldToggle = (
  modelName: string,
  fieldName: string,
  selected: boolean,
): void => {
  emit('field-toggle', modelName, fieldName, selected);
};

const getModelLabel = (modelName: string): string => {
  const translationKey = `export_data.model_labels.${modelName}`;
  const translation = t(translationKey);

  if (translation && translation !== translationKey) {
    return translation;
  }

  return modelName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getFieldLabel = (fieldName: string): string => {
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
