import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick, ref } from 'vue';

import VolumePerTagAndQueue from '../index.vue';

const hasSectorsConfiguredRef = ref(true);
const hasTagsConfiguredRef = ref(true);
const widgetSetupPropsRef = ref({
  title: 'Setup',
  description: 'Configure',
});
const isOutsideRef = ref(false);

const checkHasSectorsConfigured = vi.fn();
const checkHasTagsConfigured = vi.fn();

const mockProjectStore = {
  $id: 'project',
  checkHasSectorsConfigured: (...args) => checkHasSectorsConfigured(...args),
  checkHasTagsConfigured: (...args) => checkHasTagsConfigured(...args),
};

const mockHumanSupportStore = {
  $id: 'humanSupport',
};

vi.mock('@/store/modules/project', () => ({
  useProject: () => mockProjectStore,
}));

vi.mock('@/store/modules/humanSupport/humanSupport', () => ({
  useHumanSupport: () => mockHumanSupportStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'project') {
        return {
          hasSectorsConfigured: hasSectorsConfiguredRef,
          hasTagsConfigured: hasTagsConfiguredRef,
        };
      }
      if (store?.$id === 'humanSupport') {
        return { widgetSetupProps: widgetSetupPropsRef };
      }
      return actual.storeToRefs(store);
    },
  };
});

vi.mock('@vueuse/core', () => ({
  useMouseInElement: () => ({ isOutside: isOutsideRef }),
}));

const createWrapper = (props = {}) =>
  mount(VolumePerTagAndQueue, {
    props: { context: 'monitoring', ...props },
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        UnnnicSkeletonLoading: {
          name: 'UnnnicSkeletonLoading',
          template: '<div class="skeleton-stub" />',
        },
        BlurSetupWidget: {
          name: 'BlurSetupWidget',
          template: '<div class="blur-setup-stub" />',
        },
        PerQueue: {
          name: 'PerQueue',
          props: ['context'],
          template: '<div class="per-queue-stub" />',
        },
        PerTag: {
          name: 'PerTag',
          props: ['context', 'showConfig'],
          template: '<div class="per-tag-stub" />',
        },
      },
    },
  });

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
}

describe('VolumePerTagAndQueue/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasSectorsConfiguredRef.value = true;
    hasTagsConfiguredRef.value = true;
    isOutsideRef.value = false;
    checkHasSectorsConfigured.mockResolvedValue(undefined);
    checkHasTagsConfigured.mockResolvedValue(undefined);
  });

  it('shows skeleton until config checks finish', async () => {
    let resolveSectors;
    checkHasSectorsConfigured.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSectors = resolve;
        }),
    );

    const wrapper = createWrapper();
    await nextTick();

    expect(wrapper.find('.skeleton-stub').exists()).toBe(true);

    resolveSectors();
    await flushPromises();

    expect(wrapper.find('.skeleton-stub').exists()).toBe(false);
    expect(wrapper.find('.per-queue-stub').exists()).toBe(true);
    expect(wrapper.find('.per-tag-stub').exists()).toBe(true);
  });

  it('shows setup blur when sectors are not configured', async () => {
    hasSectorsConfiguredRef.value = false;
    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.vm.showSetup).toBe(true);
    expect(wrapper.find('.blur-setup-stub').exists()).toBe(true);
  });

  it('passes showConfig to PerTag when sectors exist but tags do not', async () => {
    hasSectorsConfiguredRef.value = true;
    hasTagsConfiguredRef.value = false;

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.vm.showConfigTag).toBe(true);
    expect(wrapper.findComponent({ name: 'PerTag' }).props('showConfig')).toBe(
      true,
    );
  });

  it('still marks config as loaded when checks fail', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    checkHasSectorsConfigured.mockRejectedValue(new Error('fail'));

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.vm.configLoaded).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('passes context prop to children', async () => {
    const wrapper = createWrapper({ context: 'analysis' });
    await flushPromises();

    expect(wrapper.findComponent({ name: 'PerQueue' }).props('context')).toBe(
      'analysis',
    );
    expect(wrapper.findComponent({ name: 'PerTag' }).props('context')).toBe(
      'analysis',
    );
  });
});
