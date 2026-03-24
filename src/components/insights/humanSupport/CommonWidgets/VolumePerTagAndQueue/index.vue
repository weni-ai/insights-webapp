<template>
  <UnnnicSkeletonLoading
    v-if="!configLoaded"
    width="100%"
    height="503px"
  />
  <section
    v-else
    ref="volumePerTagAndQueue"
    class="volume-per-tag-and-queue"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />
    <div class="volume-per-tag-and-queue__container">
      <PerQueue :context="props.context" />
    </div>
    <div class="volume-per-tag-and-queue__container">
      <PerTag
        :context="props.context"
        :showConfig="showConfigTag"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, useTemplateRef, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMouseInElement } from '@vueuse/core';

import PerQueue from './PerQueue.vue';
import PerTag from './PerTag.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';

import { useProject } from '@/store/modules/project';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

defineOptions({
  name: 'VolumePerTagAndQueueWidget',
});

interface VolumePerTagAndQueueWidgetProps {
  context: 'monitoring' | 'analysis';
}

const projectStore = useProject();
const { hasSectorsConfigured, hasTagsConfigured } = storeToRefs(projectStore);

const humanSupport = useHumanSupport();
const { widgetSetupProps } = storeToRefs(humanSupport);

const props = withDefaults(defineProps<VolumePerTagAndQueueWidgetProps>(), {});

const configLoaded = ref(false);

const volumePerTagAndQueueRef = useTemplateRef<HTMLDivElement>(
  'volumePerTagAndQueue',
);
const { isOutside } = useMouseInElement(volumePerTagAndQueueRef);

const showSetup = computed(() => {
  return !hasSectorsConfigured.value && !isOutside.value;
});

const showConfigTag = computed(() => {
  return hasSectorsConfigured.value && !hasTagsConfigured.value;
});

onMounted(async () => {
  try {
    configLoaded.value = false;
    await Promise.all([
      projectStore.checkHasSectorsConfigured(),
      projectStore.checkHasTagsConfigured(),
    ]);
  } catch (error) {
    console.log(error);
  } finally {
    configLoaded.value = true;
  }
});
</script>

<style scoped lang="scss">
.volume-per-tag-and-queue {
  position: relative;
  display: flex;
  width: 100%;
  gap: $unnnic-space-6;
  min-height: 503px;
  &__container {
    display: flex;
    flex: 1;
    width: 100%;
  }
}
</style>
