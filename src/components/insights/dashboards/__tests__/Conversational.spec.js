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
import { useAutoWidgets } from '@/store/modules/conversational/autoWidgets';

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
vi.mock('@/store/modules/conversational/autoWidgets');

const autoWidgetEntries = [
  { type: 'agent_invocation', uuid: '' },
  { type: 'tool_result', uuid: '' },
];

describe('Conversational.vue', () => {
  let wrapper;
  let conversationalWidgetsStore;
  let widgetsStore;
  let customWidgetsStore;
  let conversationalStore;
  let topicsStore;
  let autoWidgetsStore;

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
      hasEndpointData: false,
      endpointErrors: {
        topics: false,
        header: false,
        widgets: false,
        contacts: false,
      },
      isConfigurationLoaded: ref(true),
      setConfigurationLoaded: vi.fn(),
      setHasEndpointData: vi.fn(),
      setEndpointError: vi.fn(),
    });
    useConversational.mockReturnValue(conversationalStore);

    topicsStore = {
      loadFormTopics: vi.fn().mockResolvedValue(undefined),
    };
    useConversationalTopics.mockReturnValue(topicsStore);

    autoWidgetsStore = {
      hasAgentInvocationData: false,
      hasToolResultData: false,
      loadAllAutoWidgets: vi.fn().mockResolvedValue(undefined),
      resetAutoWidgets: vi.fn(),
    };
    useAutoWidgets.mockReturnValue(autoWidgetsStore);

    wrapper = shallowMount(Conversational, {
      global: {
        stubs: {
          DashboardHeader: true,
          ContactsHeader: true,
          MostTalkedAboutTopicsWidget: true,
          ConversationalDynamicWidget: true,
          CustomizableDrawer: true,
          Info: true,
        },
      },
    });
  });

  describe('Sections layout', () => {
    it('should render the conversations section with the DashboardHeader', () => {
      const section = wrapper.find('[data-testid="conversations-section"]');
      expect(section.exists()).toBe(true);
      expect(section.findComponent({ name: 'DashboardHeader' }).exists()).toBe(
        true,
      );
    });

    it('should render the contacts section with the ContactsHeader', () => {
      const section = wrapper.find('[data-testid="contacts-section"]');
      expect(section.exists()).toBe(true);
      expect(section.findComponent({ name: 'ContactsHeader' }).exists()).toBe(
        true,
      );
    });

    it('should render both section title elements', () => {
      const titles = wrapper.findAll(
        '.dashboard-conversational__section-title',
      );
      expect(titles).toHaveLength(2);
    });
  });

  it('should always include agent_invocation and tool_result first', async () => {
    widgetsStore.currentDashboardWidgets.value = [];
    await nextTick();

    const widgets = wrapper.vm.orderedDynamicWidgets;
    expect(widgets[0]).toEqual({ type: 'agent_invocation', uuid: '' });
    expect(widgets[1]).toEqual({ type: 'tool_result', uuid: '' });
  });

  it('should show csat after auto widgets when csat is configured', async () => {
    conversationalWidgetsStore.isCsatConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [{ type: 'csat' }];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      ...autoWidgetEntries,
      { type: 'csat', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show nps after auto widgets when nps is configured', async () => {
    conversationalWidgetsStore.isNpsConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [{ type: 'nps' }];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      ...autoWidgetEntries,
      { type: 'nps', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show csat and nps widgets after auto widgets when both are configured', async () => {
    conversationalWidgetsStore.isCsatConfigured = true;
    conversationalWidgetsStore.isNpsConfigured = true;

    widgetsStore.currentDashboardWidgets.value = [
      { type: 'csat' },
      { type: 'nps' },
    ];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      ...autoWidgetEntries,
      { type: 'csat', uuid: '' },
      { type: 'nps', uuid: '' },
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show auto widgets and add when no other widgets are configured', async () => {
    widgetsStore.currentDashboardWidgets.value = [];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      ...autoWidgetEntries,
      { type: 'add', uuid: '' },
    ]);
  });

  it('should show no dynamic widgets when loading', async () => {
    widgetsStore.isLoadingCurrentDashboardWidgets.value = true;
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual([]);
  });

  it('should include custom widgets after csat/nps', async () => {
    customWidgetsStore.getCustomWidgets = [
      { uuid: 'custom-1', type: 'custom_widget' },
      { uuid: 'custom-2', type: 'custom_widget' },
    ];

    widgetsStore.currentDashboardWidgets.value = [];
    await nextTick();

    expect(wrapper.vm.orderedDynamicWidgets).toEqual([
      ...autoWidgetEntries,
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
      ...autoWidgetEntries,
      { type: 'csat', uuid: '' },
      { type: 'nps', uuid: '' },
      { type: 'custom', uuid: 'custom-1' },
      { type: 'add', uuid: '' },
    ]);
  });

  describe('isOnlyAddWidget', () => {
    it('should return false for add widget when auto widgets make the count even', async () => {
      widgetsStore.currentDashboardWidgets.value = [];
      await nextTick();

      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        ...autoWidgetEntries,
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('add')).toBe(true);
    });

    it('should return false for add widget when total widget count is even', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [{ type: 'csat' }];
      await nextTick();

      expect(wrapper.vm.orderedDynamicWidgets).toEqual([
        ...autoWidgetEntries,
        { type: 'csat', uuid: '' },
        { type: 'add', uuid: '' },
      ]);
      expect(wrapper.vm.isOnlyAddWidget('add')).toBe(false);
    });

    it('should return false for non-add widgets', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [{ type: 'csat' }];
      await nextTick();

      expect(wrapper.vm.isOnlyAddWidget('csat')).toBe(false);
      expect(wrapper.vm.isOnlyAddWidget('agent_invocation')).toBe(false);
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
            ContactsHeader: true,
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

    it('should include agent_invocation and tool_result in mock mode', async () => {
      await nextTick();
      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
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

  describe('Endpoint data clears mocks reactively', () => {
    beforeEach(async () => {
      conversationalStore.shouldUseMock = true;
      conversationalStore.hasEndpointData = false;
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
            ContactsHeader: true,
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

    it('should clear mocks and rebuild widgets when hasEndpointData becomes true', async () => {
      customWidgetsStore.clearMockWidgets.mockClear();

      conversationalStore.shouldUseMock = false;
      conversationalStore.hasEndpointData = true;

      await nextTick();
      await nextTick();

      expect(customWidgetsStore.clearMockWidgets).toHaveBeenCalled();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
      expect(types).not.toContain('csat');
      expect(types).not.toContain('nps');
      expect(types).not.toContain('sales_funnel');
      expect(types).toContain('add');
    });

    it('should keep configured widgets after endpoint data arrives', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;

      conversationalStore.shouldUseMock = false;
      conversationalStore.hasEndpointData = true;

      await nextTick();
      await nextTick();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
      expect(types).toContain('csat');
      expect(types).not.toContain('nps');
      expect(types).not.toContain('sales_funnel');
      expect(types).toContain('add');
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
            ContactsHeader: true,
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
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
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
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
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
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
      expect(types).toContain('csat');
      expect(types).not.toContain('nps');
      expect(types).not.toContain('sales_funnel');
      expect(types).toContain('add');
    });
  });

  describe('Configured widgets show during initialization', () => {
    it('should show configured widgets before isConfigurationLoaded is true', async () => {
      conversationalStore.shouldUseMock = false;
      conversationalStore.isConfigurationLoaded = false;

      conversationalWidgetsStore.isCsatConfigured = true;
      conversationalWidgetsStore.isNpsConfigured = true;

      widgetsStore.isLoadingCurrentDashboardWidgets = ref(false);
      widgetsStore.currentDashboardWidgets = ref([]);

      customWidgetsStore.getCustomWidgets = [];

      wrapper = shallowMount(Conversational, {
        global: {
          stubs: {
            DashboardHeader: true,
            ContactsHeader: true,
            MostTalkedAboutTopicsWidget: true,
            ConversationalDynamicWidget: true,
            CustomizableDrawer: true,
            Info: true,
          },
        },
      });

      await nextTick();
      await nextTick();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
      expect(types).toContain('csat');
      expect(types).toContain('nps');
      expect(types).toContain('add');
    });

    it('should return empty when dashboard widgets are still loading', async () => {
      conversationalStore.shouldUseMock = false;
      conversationalStore.isConfigurationLoaded = false;

      widgetsStore.isLoadingCurrentDashboardWidgets = ref(true);
      widgetsStore.currentDashboardWidgets = ref([]);

      wrapper = shallowMount(Conversational, {
        global: {
          stubs: {
            DashboardHeader: true,
            ContactsHeader: true,
            MostTalkedAboutTopicsWidget: true,
            ConversationalDynamicWidget: true,
            CustomizableDrawer: true,
            Info: true,
          },
        },
      });

      await nextTick();

      expect(wrapper.vm.orderedDynamicWidgets).toEqual([]);
    });
  });

  describe('Auto widgets ordering', () => {
    beforeEach(async () => {
      conversationalStore.shouldUseMock = false;
      conversationalStore.isConfigurationLoaded = ref(true);

      widgetsStore.isLoadingCurrentDashboardWidgets = ref(false);
      widgetsStore.currentDashboardWidgets = ref([]);

      customWidgetsStore.getCustomWidgets = [];

      wrapper = shallowMount(Conversational, {
        global: {
          stubs: {
            DashboardHeader: true,
            ContactsHeader: true,
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

    it('should always include agent_invocation and tool_result regardless of data', async () => {
      autoWidgetsStore.hasAgentInvocationData = false;
      autoWidgetsStore.hasToolResultData = false;

      widgetsStore.currentDashboardWidgets.value = [];
      await nextTick();
      await nextTick();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      expect(types).toContain('agent_invocation');
      expect(types).toContain('tool_result');
    });

    it('should place auto widgets before csat, nps, and sales_funnel', async () => {
      conversationalWidgetsStore.isCsatConfigured = true;
      conversationalWidgetsStore.isNpsConfigured = true;
      conversationalWidgetsStore.isSalesFunnelConfigured = true;

      widgetsStore.currentDashboardWidgets.value = [];
      await nextTick();
      await nextTick();

      const types = wrapper.vm.orderedDynamicWidgets.map((w) => w.type);
      const agentIdx = types.indexOf('agent_invocation');
      const toolIdx = types.indexOf('tool_result');
      const csatIdx = types.indexOf('csat');
      const npsIdx = types.indexOf('nps');
      const funnelIdx = types.indexOf('sales_funnel');
      const addIdx = types.indexOf('add');

      expect(agentIdx).toBeLessThan(csatIdx);
      expect(toolIdx).toBeLessThan(csatIdx);
      expect(agentIdx).toBeLessThan(npsIdx);
      expect(toolIdx).toBeLessThan(npsIdx);
      expect(funnelIdx).toBeLessThan(addIdx);
    });

    it('should place add widget at the end', async () => {
      widgetsStore.currentDashboardWidgets.value = [];
      await nextTick();
      await nextTick();

      const widgets = wrapper.vm.orderedDynamicWidgets;
      expect(widgets[widgets.length - 1].type).toBe('add');
    });
  });
});
