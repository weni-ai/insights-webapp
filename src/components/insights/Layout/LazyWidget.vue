<template>
  <div
    ref="lazyRoot"
    class="lazy-widget"
    data-testid="lazy-widget"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, provide, ref, watch, type Ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

import { LazyVisibilityKey } from '@/composables/useLazyData';

const props = withDefaults(
  defineProps<{
    /** Prefetch margin so requests start slightly before the widget is in view. */
    rootMargin?: string;
    /** Force the widget to be treated as visible (e.g. scroll/redirect targets). */
    forceVisible?: boolean;
  }>(),
  {
    rootMargin: '300px 0px',
    forceVisible: false,
  },
);

const lazyRoot = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const hasBeenVisible = ref(false);

const injectedScrollContainer = inject<Ref<HTMLElement | null> | null>(
  'insightsScrollContainer',
  null,
);

const observerRoot = ref<HTMLElement | null>(null);

const forceLoad = () => {
  isVisible.value = true;
  hasBeenVisible.value = true;
};

watch(
  () => props.forceVisible,
  (value) => {
    if (value) forceLoad();
  },
  { immediate: true },
);

onMounted(() => {
  observerRoot.value =
    injectedScrollContainer?.value ??
    (document.querySelector('.insights__main') as HTMLElement | null);
});

useIntersectionObserver(
  lazyRoot,
  ([entry]) => {
    isVisible.value = entry?.isIntersecting ?? false;
    if (isVisible.value) hasBeenVisible.value = true;
  },
  {
    root: observerRoot,
    rootMargin: props.rootMargin,
  },
);

provide(LazyVisibilityKey, { isVisible, hasBeenVisible, forceLoad });

defineExpose({ isVisible, hasBeenVisible, forceLoad });
</script>

<style scoped lang="scss">
.lazy-widget {
  display: flex;
  flex-direction: column;
}
</style>
