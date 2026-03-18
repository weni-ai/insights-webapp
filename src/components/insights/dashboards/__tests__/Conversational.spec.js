import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick, ref, reactive } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import Conversational from '../Conversational.vue';
import { createI18n } from 'vue-i18n';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useConversationalTopics } from '@/store/modules/conversational/topics';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

vi.mock('@/store/modules/conversational/widgets');
vi.mock('@/store/modules/widgets');
vi.mock('@/store/modules/conversational/customWidgets');
vi.mock('@/store/modules/conversational/conversational');
vi.mock('@/store/modules/conversational/topics');

describe('Conversational.vue', () => {
  let wrapper;
  let conversationalWidgetsStore;
  let widgetsStore;
  let customWidgetsStore;
  let conversationalStore;
  let topicsStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    conversationalWidgetsStore = {
      isCsatConfigured: false,
      isNpsConfigured: false,
      isSalesFunnelConfigured: false,
    };
    useConversationalWidgets.mockReturnValue(conversationalWidgetsStore);

    widgetsStore = {
      isLoadingCurrentDashboardWidgets: ref(false),
      currentDashboardWidgets: ref([]),
      getCurrentDashboardWidgets: vi.fn().mockResolvedValue([]),
    };
    useWidgets.mockReturnValue(widgetsStore);

    customWidgetsStore = {
      getCustomWidgets: [],
      injectMockWidgets: vi.fn(),
      clearMockWidgets: vi.fn(),
    };
    useCustomWidgets.mockReturnValue(customWidgetsStore);

    conversationalStore = reactive({
      shouldUseMock: false,
      hasEndpointErrors: false,
      endpointErrors: { topics: false, header: false, widgets: false },
      isConfigurationLoaded: ref(true),
      setConfigurationLoaded: vi.fn(),
      setEndpointError: vi.fn(),
    });
    useConversational.mockReturnValue(conversationalStore);

    topicsStore = {
      loadFormTopics: vi.fn().mockResolvedValue(undefined),
    };
    useConversationalTopics.mockReturnValue(topicsStore);

    wrapper = shallowMount(Conversational, {
      global: {
        stubs: {
          DashboardHeader: true,
          MostTalkedAboutTopicsWidget: true,
          ConversationalDynamicWidget: true,
          CustomizableDrawer: true,
          Info: true,
        },
      },
    });
  });

  it('should show csat and add widgets when only csat is configured and widgets are less than 2', async () => {
    conversationalWidgetsStore.isCsatConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [{ type: 'csat' }];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'csat', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show nps and add widgets when only nps is configured and widgets are less than 2', async () => {
    conversationalWidgetsStore.isNpsConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [{ type: 'nps' }];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'nps', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show csat and nps widgets when both are configured', async () => {
    conversationalWidgetsStore.isCsatConfigured = true;
    conversationalWidgetsStore.isNpsConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [
      { type: 'csat' },
      { type: 'nps' },
    ];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'csat', uuid: '' },
      { type: 'nps', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show only add widget when no dynamic widgets are configured', async () => {
    widgetsStore.currentDashboardWidgets.value = [];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'add', uuid: '' },
    ]);
  });

  it('should maintain csat first, then nps order when both are present', async () => {
    conversationalWidgetsStore.isCsatConfigured = true;
    conversationalWidgetsStore.isNpsConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [
      { type: 'csat' },
      { type: 'nps' },
    ];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'csat', uuid: '' },
      { type: 'nps', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show no dynamic widgets when loading', async () => {
    widgetsStore.isLoadingCurrentDashboardWidgets.value = true;
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual([]);
  });

  it('should include custom widgets when they exist', async () => {
    customWidgetsStore.getCustomWidgets = [
      { uuid: 'custom-1', type: 'custom_widget' },
      { uuid: 'custom-2', type: 'custom_widget' },
    ];

    widgetsStore.currentDashboardWidgets.value = [];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'custom', uuid: 'custom-1' },
      { type: 'custom', uuid: 'custom-2' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should include custom widgets along with csat and nps', async () => {
    conversationalWidgetsStore.isCsatConfigured = true;
    conversationalWidgetsStore.isNpsConfigured = true;
    customWidgetsStore.getCustomWidgets = [
      { uuid: 'custom-1', type: 'custom_widget' },
    ];

    widgetsStore.currentDashboardWidgets.value = [
      { type: 'csat' },
      { type: 'nps' },
    ];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      { type: 'csat', uuid: '' },
      { type: 'nps', uuid: '' },
      { type: 'custom', uuid: 'custom-1' },
      { type: 'add', uuid: '' },
    ]);
  });

  describe('isOnlyAddWidget', () => {
    it('should return true for add widget when there is an odd number of widgets', async () => {
      widgetsStore.currentDashboardWidgets.value = [];
      await nextTick();

      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('add')).toBe(true);
      expect(wrapper.vm.isOnlyAddWidget('csat')).toBe(false);
      expect(wrapper.vm.isOnlyAddWidget('nps')).toBe(false);
    });

    it('should return true for add widget when there are 3 widgets (odd)', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;
      conversationalWidgetsStore.isNpsConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [
        { type: 'csat' },
        { type: 'nps' },
      ];
      await nextTick();
      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        { type: 'csat', uuid: '' },
        { type: 'nps', uuid: '' },
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('add')).toBe(true);
      expect(wrapper.vm.isOnlyAddWidget('csat')).toBe(false);
      expect(wrapper.vm.isOnlyAddWidget('nps')).toBe(false);
    });

    it('should return true for add widget when there are 3 widgets (csat, nps, add - odd)', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;
      conversationalWidgetsStore.isNpsConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [
        { type: 'csat' },
        { type: 'nps' },
      ];
      await nextTick();
      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        { type: 'csat', uuid: '' },
        { type: 'nps', uuid: '' },
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('add')).toBe(true);
      expect(wrapper.vm.isOnlyAddWidget('csat')).toBe(false);
      expect(wrapper.vm.isOnlyAddWidget('nps')).toBe(false);
    });

    it('should return false for add widget when there would be an even number of widgets', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [{ type: 'csat' }];
      await nextTick();
      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        { type: 'csat', uuid: '' },
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('add')).toBe(false);
      expect(wrapper.vm.isOnlyAddWidget('csat')).toBe(false);
    });

    it('should return false for non-add widgets even with odd number of widgets', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;
      conversationalWidgetsStore.isNpsConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [
        { type: 'csat' },
        { type: 'nps' },
      ];
      await nextTick();
      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        { type: 'csat', uuid: '' },
        { type: 'nps', uuid: '' },
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('csat')).toBe(false);
      expect(wrapper.vm.isOnlyAddWidget('nps')).toBe(false);
    });
  });

  describe('Mock mode (shouldUseMock = true)', () => {
    beforeEach(async () => {
      conversationalStore.shouldUseMock = true;
      conversationalStore.isConfigurationLoaded = ref(true);

      conversationalWidgetsStore.isCsatConfigured = false;
      conversationalWidgetsStore.isNpsConfigured = false;
      conversationalWidgetsStore.isSalesFunnelConfigured = false;

      customWidgetsStore.getCustomWidgets = [];

      widgetsStore.isLoadingCurrentDashboardWidgets = ref(false);
      widgetsStore.currentDashboardWidgets = ref([]);

      wrapper = shallowMount(Conversational, {
        global: {
          stubs: {
            DashboardHeader: true,
            MostTalkedAboutTopicsWidget: true,
            ConversationalDynamicWidget: true,
            CustomizableDrawer: true,
            Info: true,
          },
        },
      });

      await nextTick();
      await nextTick();
    });

    it('should call injectMockWidgets when shouldUseMock is true', () => {
      expect(customWidgetsStore.injectMockWidgets).toHaveBeenCalled();
    });

    it('should include csat, nps, and sales_funnel widgets in mock mode', async () => {
      await nextTick();
      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('csat');
      expect(types).toContain('nps');
      expect(types).toContain('sales_funnel');
    });

    it('should include add widget at the end in mock mode', async () => {
      await nextTick();
      const widgets = wrapper.vm.orderedDynamicWidgets;
      expect(widgets[widgets.length - 1].type).toBe('add');
    });
  });

  describe('Endpoint error clears mocks reactively', () => {
    beforeEach(async () => {
      conversationalStore.shouldUseMock = true;
      conversationalStore.hasEndpointErrors = false;
      conversationalStore.isConfigurationLoaded = ref(true);

      conversationalWidgetsStore.isCsatConfigured = false;
      conversationalWidgetsStore.isNpsConfigured = false;
      conversationalWidgetsStore.isSalesFunnelConfigured = false;

      customWidgetsStore.getCustomWidgets = [];

      widgetsStore.isLoadingCurrentDashboardWidgets = ref(false);
      widgetsStore.currentDashboardWidgets = ref([]);

      wrapper = shallowMount(Conversational, {
        global: {
          stubs: {
            DashboardHeader: true,
            MostTalkedAboutTopicsWidget: true,
            ConversationalDynamicWidget: true,
            CustomizableDrawer: true,
            Info: true,
          },
        },
      });

      await nextTick();
      await nextTick();
    });

    it('should show mock widgets initially when no errors', () => {
      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('csat');
      expect(types).toContain('nps');
      expect(types).toContain('sales_funnel');
    });

    it('should clear mocks and remove mock widgets when an endpoint error is detected', async () => {
      customWidgetsStore.clearMockWidgets.mockClear();

      conversationalStore.shouldUseMock = false;
      conversationalStore.hasEndpointErrors = true;

      await nextTick();
      await nextTick();

      expect(customWidgetsStore.clearMockWidgets).toHaveBeenCalled();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).not.toContain('csat');
      expect(types).not.toContain('nps');
      expect(types).not.toContain('sales_funnel');
      expect(types).toContain('add');
    });

    it('should keep only configured widgets after endpoint error', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;

      conversationalStore.shouldUseMock = false;
      conversationalStore.hasEndpointErrors = true;

      await nextTick();
      await nextTick();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('csat');
      expect(types).not.toContain('nps');
      expect(types).not.toContain('sales_funnel');
      expect(types).toContain('add');
    });
  });
});
