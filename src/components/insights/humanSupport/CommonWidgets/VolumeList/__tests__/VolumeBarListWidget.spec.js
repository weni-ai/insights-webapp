import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick, ref } from 'vue';

import VolumeBarListWidget from '../VolumeBarListWidget.vue';
import { LazyVisibilityKey } from '@/composables/useLazyData';

const hasSectorsConfiguredRef = ref(true);
const appliedFiltersRef = ref({
  sectors: [],
  queues: [],
  tags: [],
  channels: [],
});
const appliedDateRangeRef = ref({ start: '', end: '' });
const refreshDataMonitoringRef = ref(false);
const autoRefreshRef = ref(true);

const mockProjectStore = { $id: 'project' };
const mockHumanSupportStore = { $id: 'humanSupport' };
const mockMonitoringStore = { $id: 'humanSupportMonitoring' };

vi.mock('@/store/modules/project', () => ({
  useProject: () => mockProjectStore,
}));

vi.mock('@/store/modules/humanSupport/humanSupport', () => ({
  useHumanSupport: () => mockHumanSupportStore,
}));

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockMonitoringStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'project') {
        return { hasSectorsConfigured: hasSectorsConfiguredRef };
      }
      if (store?.$id === 'humanSupport') {
        return {
          appliedFilters: appliedFiltersRef,
          appliedDateRange: appliedDateRangeRef,
        };
      }
      if (store?.$id === 'humanSupportMonitoring') {
        return {
          refreshDataMonitoring: refreshDataMonitoringRef,
          autoRefresh: autoRefreshRef,
        };
      }
      return actual.storeToRefs(store);
    },
  };
});

vi.mock('@vueuse/core', () => ({
  useInfiniteScroll: vi.fn(),
  useMouseInElement: () => ({ isOutside: ref(true) }),
}));

const fetchMethod = vi.fn();

const defaultProps = {
  titleKey: 'human_support_dashboard.volume_per_queue.title',
  tabs: () => [
    { name: 'Awaiting', key: 'waiting' },
    { name: 'In Progress', key: 'ongoing' },
  ],
  defaultTab: 'ongoing',
  mock: [{ queue_name: 'Mock Queue', value: 3 }],
  mockItemsCount: 1,
  itemKey: 'queues',
  itemLabelKey: 'queue_name',
  formatFooterText: (_ctx, _tab, count) => (count ? `count:${count}` : ''),
  formatEmptyDataText: () => 'empty',
  seeAllTitleKey: 'human_support_dashboard.volume_per_queue.title',
  fetchMethod: () => fetchMethod,
  context: 'monitoring',
};

const createWrapper = (props = {}, { hasBeenVisible = true } = {}) => {
  const hasBeenVisibleRef = ref(hasBeenVisible);
  return mount(VolumeBarListWidget, {
    props: { ...defaultProps, ...props },
    global: {
      plugins: [createTestingPinia()],
      provide: {
        [LazyVisibilityKey]: {
          hasBeenVisible: hasBeenVisibleRef,
          isVisible: ref(hasBeenVisible),
          forceLoad: vi.fn(),
        },
      },
      stubs: {
        CardBase: {
          name: 'CardBase',
          template: '<div class="card-base-stub"><slot /></div>',
        },
        UnnnicChatsHeader: true,
        UnnnicTabGroup: {
          name: 'UnnnicTabGroup',
          props: ['modelValue', 'tabs'],
          emits: ['update:modelValue'],
          template: '<div class="tabs-stub" />',
        },
        ProgressTable: {
          name: 'ProgressTable',
          props: ['progressItems', 'isLoading', 'emptyText'],
          template: '<div class="progress-stub" />',
        },
        UnnnicButton: {
          name: 'UnnnicButton',
          emits: ['click'],
          template: '<button class="see-all-btn" @click="$emit(\'click\')" />',
        },
        SeeAllDrawer: {
          name: 'SeeAllDrawer',
          props: ['open', 'title'],
          template: '<div class="see-all-drawer-stub" />',
        },
        BlurSetupWidget: true,
      },
    },
  });
};

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
}

describe('VolumeBarListWidget.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    hasSectorsConfiguredRef.value = true;
    appliedFiltersRef.value = {
      sectors: [],
      queues: [],
      tags: [],
      channels: [],
    };
    appliedDateRangeRef.value = { start: '', end: '' };
    refreshDataMonitoringRef.value = false;
    autoRefreshRef.value = true;
    fetchMethod.mockResolvedValue({
      results: [
        {
          sector_name: 'Support',
          is_deleted: false,
          queues: [
            { queue_name: 'VIP', value: 8, is_deleted: false },
            { queue_name: 'Urgent', value: 2, is_deleted: true },
          ],
        },
      ],
      next: null,
      count: 2,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('loads items on mount when sectors are configured', async () => {
    wrapper = createWrapper();
    await flushPromises();

    expect(fetchMethod).toHaveBeenCalledWith(
      expect.objectContaining({
        chip_name: 'ongoing',
        limit: 5,
      }),
    );
    expect(wrapper.vm.itemsCount).toBe(2);
    expect(wrapper.vm.formattedItems.length).toBeGreaterThan(0);
  });

  it('uses mock data when sectors are not configured', async () => {
    hasSectorsConfiguredRef.value = false;
    wrapper = createWrapper();
    await flushPromises();

    expect(fetchMethod).not.toHaveBeenCalled();
    expect(wrapper.vm.activeItemsCount).toBe(1);
    expect(wrapper.vm.formattedItems[0].label).toBe('Mock Queue');
  });

  it('formats deleted tooltips for queues', async () => {
    wrapper = createWrapper();
    await flushPromises();

    const deletedItem = wrapper.vm.formattedItems.find(
      (item) => item.label === 'Urgent',
    );
    expect(deletedItem.labelMuted).toBe(true);
    expect(deletedItem.deletedTooltip).toBeTruthy();
  });

  it('returns undefined deleted tooltip for channels', async () => {
    fetchMethod.mockResolvedValue({
      results: [
        {
          sector_name: 'Support',
          is_deleted: true,
          channels: [{ channel_name: 'WhatsApp', value: 3, is_deleted: true }],
        },
      ],
      next: null,
      count: 1,
    });

    wrapper = createWrapper({
      itemKey: 'channels',
      itemLabelKey: 'channel_name',
    });
    await flushPromises();

    expect(wrapper.vm.formattedItems[0].deletedTooltip).toBeUndefined();
  });

  it('does not fetch when showConfig is true', async () => {
    wrapper = createWrapper({ showConfig: true });
    await flushPromises();

    expect(fetchMethod).not.toHaveBeenCalled();
    expect(wrapper.vm.emptyDataText).toBe('');
  });

  it('handles fetch errors and clears loading', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    fetchMethod.mockRejectedValue(new Error('fail'));

    wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.vm.isLoadingItems).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('concatenates results on infinite scroll load', async () => {
    wrapper = createWrapper();
    await flushPromises();

    fetchMethod.mockResolvedValueOnce({
      results: [{ queue_name: 'Extra', value: 1 }],
      next: null,
      count: 3,
    });

    await wrapper.vm.getItems({ silent: true, concat: true, limit: 20 });
    await flushPromises();

    expect(wrapper.vm.items.length).toBeGreaterThan(1);
  });

  it('opens see all drawer', async () => {
    wrapper = createWrapper();
    await flushPromises();

    wrapper.vm.handleSeeAll();
    expect(wrapper.vm.openSeeAllDrawer).toBe(true);
    expect(wrapper.vm.seeAllDrawerTitle).toContain('In Progress');
  });

  it('reloads when tab changes after visible', async () => {
    wrapper = createWrapper();
    await flushPromises();
    fetchMethod.mockClear();

    wrapper.vm.handleTabChange('waiting');
    await flushPromises();

    expect(fetchMethod).toHaveBeenCalledWith(
      expect.objectContaining({ chip_name: 'waiting' }),
    );
  });

  it('reloads on refreshDataMonitoring when autoRefresh is enabled', async () => {
    wrapper = createWrapper();
    await flushPromises();
    fetchMethod.mockClear();

    refreshDataMonitoringRef.value = true;
    await flushPromises();

    expect(fetchMethod).toHaveBeenCalled();
  });
});
