import {
  inject,
  onMounted,
  ref,
  watch,
  type InjectionKey,
  type Ref,
  type WatchSource,
} from 'vue';

/**
 * Visibility contract provided by `LazyWidget` to its slotted content.
 * Consumed by `useLazyData` to defer API calls until the widget is on screen.
 */
export interface LazyVisibility {
  isVisible: Ref<boolean>;
  hasBeenVisible: Ref<boolean>;
  forceLoad: () => void;
}

export const LazyVisibilityKey: InjectionKey<LazyVisibility> =
  Symbol('LazyVisibility');

interface UseLazyDataOptions {
  /** Callback that performs the API request(s) for the widget. */
  load: () => void | Promise<void>;
  /**
   * Reactive sources (e.g. route query, refresh flags) that should re-run
   * `load` — but only after the widget has already become visible once.
   */
  watchSources?: WatchSource[];
}

/**
 * Gate a widget's data loading behind viewport visibility.
 *
 * When wrapped by a `LazyWidget`, the first `load()` only fires once the
 * widget enters the scroll viewport, and `watchSources` re-fetches are skipped
 * while the widget has never been visible. Without a `LazyWidget` provider it
 * falls back to eager behavior (load on mount), preserving legacy behavior.
 */
export function useLazyData(options: UseLazyDataOptions) {
  const { load, watchSources = [] } = options;

  const injected = inject(LazyVisibilityKey, null);

  const isVisible = injected?.isVisible ?? ref(true);
  const hasBeenVisible = injected?.hasBeenVisible ?? ref(true);

  let hasLoaded = false;

  const triggerInitialLoad = () => {
    if (hasLoaded) return;
    hasLoaded = true;
    load();
  };

  onMounted(() => {
    if (hasBeenVisible.value) triggerInitialLoad();
  });

  watch(hasBeenVisible, (visible) => {
    if (visible) triggerInitialLoad();
  });

  watchSources.forEach((source) => {
    watch(
      source,
      () => {
        if (hasBeenVisible.value) load();
      },
      { deep: true },
    );
  });

  return {
    isVisible,
    hasBeenVisible,
    reload: load,
  };
}
