<template>
  <UnnnicSkeletonLoading
    v-if="!configLoaded"
    width="100%"
    height="503px"
  />
  <section
    v-else
    class="volume-per-tag-and-queue"
  >
    <div class="volume-per-tag-and-queue__container">
      <PerQueue
        :context="props.context"
        :showConfig="!hasSectorsConfigured"
      />
    </div>
    <div class="volume-per-tag-and-queue__container">
      <PerTag
        :context="props.context"
        :showConfig="!hasTagsConfigured"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PerQueue from './PerQueue.vue';
import PerTag from './PerTag.vue';

import { useProject } from '@/store/modules/project';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'VolumePerTagAndQueueWidget',
});

interface VolumePerTagAndQueueWidgetProps {
  context: 'monitoring' | 'analysis';
}

const props = withDefaults(defineProps<VolumePerTagAndQueueWidgetProps>(), {});

const projectStore = useProject();

const { hasSectorsConfigured, hasTagsConfigured } = storeToRefs(projectStore);

const configLoaded = ref(false);

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
