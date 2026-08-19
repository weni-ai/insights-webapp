<template>
  <section class="content-vtex">
    <UnnnicInput
      :modelValue="widgetName"
      :label="$t('drawers.config_gallery.options.vtex.form.name.label')"
      :placeholder="
        $t('drawers.config_gallery.options.vtex.form.name.placeholder')
      "
      data-testid="widget-name-input"
      @update:model-value="updateWidgetName"
    />
    <UnnnicInput
      :modelValue="utmValue"
      :label="$t('drawers.config_gallery.options.vtex.form.utm.label')"
      :placeholder="
        $t('drawers.config_gallery.options.vtex.form.utm.placeholder')
      "
      data-testid="utm-input"
      @update:model-value="updateUtm"
    />
    <UnnnicButton
      class="clear-button"
      :text="$t('drawers.reset_widget')"
      type="tertiary"
      :disabled="isDisableResetWidget"
      @click="resetWidget"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

defineOptions({ name: 'DrawerConfigContentVtex' });

interface DrawerConfigContentVtexProps {
  modelValue: Record<string, any>;
}

const props = defineProps<DrawerConfigContentVtexProps>();

const emit = defineEmits<{
  'update:model-value': [value: Record<string, any>];
  'reset-widget': [];
  'update-disable-primary-button': [value: boolean];
}>();

const widgetName = ref('');
const utmValue = ref('');
const validForm = ref(false);
const defaultConfigVtex = {
  orders: {
    icon: 'local_activity',
  },
  total_value: {
    icon: 'currency_exchange',
  },
  average_ticket: {
    icon: 'sell',
  },
};

const isDisableResetWidget = computed(() => {
  const isEmptyWidget = props.modelValue?.type === 'empty_column';
  return isEmptyWidget;
});

const updateWidgetData = () => {
  emit('update:model-value', {
    ...props.modelValue,
    name: widgetName.value?.trim() || 'vtex_orders',
    config: {
      ...props.modelValue.config,
      ...defaultConfigVtex,
      filter: {
        utm: utmValue.value,
      },
    },
  });
};

const updateUtm = (utm: string) => {
  utmValue.value = utm;
  updateWidgetData();
};

const updateWidgetName = (name: string) => {
  widgetName.value = name;
  updateWidgetData();
};

const resetWidget = () => {
  emit('reset-widget');
};

const updateValidForm = () => {
  validForm.value = !!utmValue.value.trim();
};

const emitValidForm = () => {
  emit('update-disable-primary-button', !validForm.value);
};

watch(validForm, emitValidForm, { immediate: true });
watch(widgetName, updateValidForm);
watch(utmValue, updateValidForm);

widgetName.value =
  props.modelValue.name === 'vtex_orders' ? '' : props.modelValue.name;
utmValue.value = props.modelValue.config?.filter?.utm || '';

defineExpose({
  widgetName,
  utmValue,
  validForm,
  isDisableResetWidget,
  resetWidget,
  updateUtm,
  updateWidgetName,
  updateWidgetData,
});
</script>

<style lang="scss" scoped>
.content-vtex {
  display: grid;
  gap: $unnnic-space-4;
}
</style>
