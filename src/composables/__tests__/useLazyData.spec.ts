import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, type Ref } from 'vue';

import { useLazyData, LazyVisibilityKey } from '../useLazyData';

const createHost = (
  load: () => void,
  options: {
    visibility?: {
      isVisible: Ref<boolean>;
      hasBeenVisible: Ref<boolean>;
    };
    watchSource?: Ref<unknown>;
  } = {},
) => {
  const Host = defineComponent({
    setup() {
      useLazyData({
        load,
        watchSources: options.watchSource
          ? [() => options.watchSource.value]
          : [],
      });
      return () => h('div');
    },
  });

  const provide = options.visibility
    ? {
        [LazyVisibilityKey as symbol]: {
          ...options.visibility,
          forceLoad: vi.fn(),
        },
      }
    : {};

  return mount(Host, { global: { provide } });
};

describe('useLazyData', () => {
  let load: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    load = vi.fn();
  });

  describe('without a LazyWidget provider (eager fallback)', () => {
    it('loads on mount', () => {
      createHost(load);
      expect(load).toHaveBeenCalledTimes(1);
    });

    it('reloads when a watch source changes', async () => {
      const source = ref(0);
      createHost(load, { watchSource: source });

      expect(load).toHaveBeenCalledTimes(1);

      source.value = 1;
      await Promise.resolve();

      expect(load).toHaveBeenCalledTimes(2);
    });
  });

  describe('with a LazyWidget provider (gated)', () => {
    it('does not load while never visible', () => {
      const isVisible = ref(false);
      const hasBeenVisible = ref(false);
      createHost(load, { visibility: { isVisible, hasBeenVisible } });

      expect(load).not.toHaveBeenCalled();
    });

    it('loads once when it becomes visible', async () => {
      const isVisible = ref(false);
      const hasBeenVisible = ref(false);
      createHost(load, { visibility: { isVisible, hasBeenVisible } });

      hasBeenVisible.value = true;
      await Promise.resolve();

      expect(load).toHaveBeenCalledTimes(1);
    });

    it('loads immediately if already visible on mount', () => {
      const isVisible = ref(true);
      const hasBeenVisible = ref(true);
      createHost(load, { visibility: { isVisible, hasBeenVisible } });

      expect(load).toHaveBeenCalledTimes(1);
    });

    it('ignores watch source changes while never visible', async () => {
      const isVisible = ref(false);
      const hasBeenVisible = ref(false);
      const source = ref(0);
      createHost(load, {
        visibility: { isVisible, hasBeenVisible },
        watchSource: source,
      });

      source.value = 1;
      await Promise.resolve();

      expect(load).not.toHaveBeenCalled();
    });

    it('reloads on watch source change once it has been visible', async () => {
      const isVisible = ref(true);
      const hasBeenVisible = ref(true);
      const source = ref(0);
      createHost(load, {
        visibility: { isVisible, hasBeenVisible },
        watchSource: source,
      });

      expect(load).toHaveBeenCalledTimes(1);

      source.value = 1;
      await Promise.resolve();

      expect(load).toHaveBeenCalledTimes(2);
    });
  });
});
