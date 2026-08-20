<template>
  <UnnnicDrawer
    v-if="galleryOptions.length && !showDrawerConfigWidget"
    ref="unnnicDrawer"
    class="drawer-config-gallery"
    wide
    :title="t('drawers.config_gallery.title')"
    :description="t('drawers.config_gallery.description')"
    :modelValue="modelValue"
    closeIcon="close"
    @close="closeAllDrawers({ handlerNextStep: false })"
  >
    <template #content>
      <ol
        data-onboarding-id="widget-gallery"
        class="drawer-config-gallery__options"
      >
        <li
          v-for="{ title, description, value } of galleryOptions"
          :key="title"
        >
          <GalleryOption
            :title="title"
            :description="description"
            data-testid="gallery-option"
            @click="setDrawerConfigType(value)"
          />
        </li>
      </ol>
    </template>
  </UnnnicDrawer>
  <DrawerConfigWidgetDynamic
    v-if="showDrawerConfigWidget"
    :modelValue="showDrawerConfigWidget"
    :configType="drawerConfigType"
    @close="closeAllDrawers($event)"
    @back="goToGallery"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useProject } from '@/store/modules/project';
import { useWidgets } from '@/store/modules/widgets';
import { useOnboarding } from '@/store/modules/onboarding';
import { useConfig } from '@/store/modules/config';

import GalleryOption from './GalleryOption.vue';
import DrawerConfigWidgetDynamic from '../DrawerConfigWidgetDynamic.vue';

import { clearDeepValues } from '@/utils/object.js';

defineOptions({ name: 'DrawerConfigGallery' });

const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();

const projectStore = useProject();
const widgetsStore = useWidgets();
const onboardingStore = useOnboarding();
const configStore = useConfig();

const { isLoadedFlows: isLoadedProjectFlows } = storeToRefs(projectStore);
const { currentWidgetEditing: widget } = storeToRefs(widgetsStore);
const { onboardingRefs, showConfigWidgetOnboarding } =
  storeToRefs(onboardingStore);
const { project } = storeToRefs(configStore);

const showDrawerConfigWidget = ref(false);
const drawerConfigType = ref('');

const widgetConfigType = computed(() => {
  if (widget.value.type === 'vtex_order') return 'vtex';
  return widget.value.config?.type;
});

const galleryOptions = computed(() => {
  function createOptions(optionKeys: string[]) {
    return optionKeys.map((option) => ({
      title: t(`drawers.config_gallery.options.${option}.title`),
      description: t(`drawers.config_gallery.options.${option}.description`),
      value: option,
    }));
  }

  const empty_widget_options = [
    'funnel',
    'recurrence',
    'vtex',
    'vtex_conversions',
  ];

  const optionsMap: Record<string, any[]> = {
    card: createOptions(['executions', 'flow_result', 'data_crossing']),
    empty_column: createOptions(empty_widget_options),
  };

  return optionsMap[widget.value?.type] || [];
});

watch(
  () => props.modelValue,
  () => {
    setDrawerConfigType(widgetConfigType.value);

    if (!galleryOptions.value.length) {
      showDrawerConfigWidget.value = true;
    }
  },
  { immediate: true },
);

onBeforeMount(async () => {
  const isVtexWidget = ['vtex_order', 'vtex_conversions'].includes(
    widget.value?.type,
  );
  if (!isLoadedProjectFlows.value && !isVtexWidget) {
    await projectStore.getProjectFlows();
  }
});

function closeAllDrawers({ handleTourNextStep }: any = {}) {
  showDrawerConfigWidget.value = false;
  drawerConfigType.value = '';

  if (handleTourNextStep)
    onboardingStore.callTourNextStep('widgets-onboarding-tour');
  else
    onboardingStore.callTourPreviousStep({ tour: 'widgets-onboarding-tour' });

  emit('close');
}

function setDrawerConfigType(configType: string) {
  drawerConfigType.value = configType;

  if (configType) {
    onboardingStore.callTourNextStep('widgets-onboarding-tour');
    handleShowDrawerConfigWidget();
  }

  if (configType !== widgetConfigType.value) {
    cleanCurrentWidget();
  }
}

function handleShowDrawerConfigWidget() {
  showDrawerConfigWidget.value = true;
}

function cleanCurrentWidget() {
  const cleanWidget = {
    ...widget.value,
    name: '',
    config: clearDeepValues(widget.value.config),
  };

  widgetsStore.updateCurrentWidgetEditing(cleanWidget);
}

function goToGallery() {
  showDrawerConfigWidget.value = false;
  drawerConfigType.value = '';

  onboardingStore.callTourPreviousStep({
    tour: 'widgets-onboarding-tour',
  });

  if (!galleryOptions.value.length) {
    emit('close');
  }
}

defineExpose({
  showDrawerConfigWidget,
  drawerConfigType,
  widgetConfigType,
  galleryOptions,
  closeAllDrawers,
  setDrawerConfigType,
  handleShowDrawerConfigWidget,
  cleanCurrentWidget,
  goToGallery,
});
</script>

<style lang="scss" scoped>
.drawer-config-gallery {
  &__options {
    display: grid;
    gap: $unnnic-space-3;
  }
}
</style>
