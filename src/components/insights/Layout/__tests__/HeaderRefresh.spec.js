import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import HeaderRefresh from '../HeaderRefresh.vue';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useConversational } from '@/store/modules/conversational/conversational';

config.global.plugins = [
  createI18n({
    legacy: false,
    messages: {
      en: {
        'insights_header.refresh': 'Refresh',
      },
    },
  }),
];

vi.mock('@/store/modules/humanSupport/monitoring');
vi.mock('@/store/modules/conversational/conversational');
vi.mock('pinia', async () => {
  const actual = await vi.importActual('pinia');
  return {
    ...actual,
    storeToRefs: vi.fn(),
  };
});

const createWrapper = (props = {}, options = {}) => {
  return shallowMount(HeaderRefresh, {
    props: {
      type: 'human-support',
      ...props,
    },
    global: {
      stubs: {
        UnnnicButton: true,
      },
      ...options.global,
    },
    ...options,
  });
};

describe('HeaderRefresh.vue', () => {
  let wrapper;
  let monitoringStore;
  let conversationalStore;
  let mockStoreToRefs;

  beforeEach(async () => {
    setActivePinia(createPinia());

    monitoringStore = {
      isLoadingAllData: false,
      setRefreshDataMonitoring: vi.fn(),
    };

    conversationalStore = {
      isLoadingConversationalData: false,
      setRefreshDataConversational: vi.fn(),
    };

    mockStoreToRefs = {
      isLoadingAllData: ref(false),
    };

    useHumanSupportMonitoring.mockReturnValue(monitoringStore);
    useConversational.mockReturnValue(conversationalStore);
    const { storeToRefs } = await import('pinia');
    storeToRefs.mockReturnValue(mockStoreToRefs);

    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the UnnnicButton component', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.exists()).toBe(true);
    });

    it('should pass correct props to UnnnicButton', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      const props = refreshButton.props();

      expect(props.text).toBe('Refresh');
      expect(props.type).toBe('tertiary');
      expect(props.iconLeft).toBe('refresh');
      expect(refreshButton.attributes('data-testid')).toBe('refresh-button');
    });
  });

  describe('Loading State', () => {
    it('should pass isLoadingAllData to disabled prop', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      expect(refreshButton.props('disabled')).toBe(
        monitoringStore.isLoadingAllData,
      );
    });

    it('should connect disabled prop to loading state', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      expect(refreshButton.props('disabled')).toBe(
        monitoringStore.isLoadingAllData,
      );
    });

    it('should disable button when loading is true', async () => {
      mockStoreToRefs.isLoadingAllData.value = true;
      await nextTick();

      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.props('disabled')).toBe(true);
    });
  });

  describe('User Interactions', () => {
    it('should call refreshData when button is clicked', async () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      await refreshButton.vm.$emit('click');

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenCalledWith(
        true,
      );
    });

    it('should call setRefreshDataMonitoring with true when refreshData is executed', () => {
      wrapper.vm.refreshData();

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenCalledWith(
        true,
      );
    });

    it('should call setRefreshDataMonitoring with false after timeout', async () => {
      vi.useFakeTimers();

      wrapper.vm.refreshData();

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenCalledWith(
        true,
      );

      vi.advanceTimersByTime(500);

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenCalledWith(
        false,
      );

      vi.useRealTimers();
    });

    it('should handle multiple refresh clicks', async () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });

      await refreshButton.vm.$emit('click');
      await refreshButton.vm.$emit('click');
      await refreshButton.vm.$emit('click');

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenCalledTimes(3);
    });

    it('should show disabled state when loading', async () => {
      mockStoreToRefs.isLoadingAllData.value = true;
      await nextTick();

      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.props('disabled')).toBe(true);
    });
  });

  describe('Component Behavior', () => {
    it('should have proper template structure', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.exists()).toBe(true);

      expect(refreshButton.props('type')).toBe('tertiary');
      expect(refreshButton.props('iconLeft')).toBe('refresh');
    });
  });

  describe('Store Integration', () => {
    it('should use the correct store', () => {
      expect(useHumanSupportMonitoring).toHaveBeenCalled();
    });

    it('should have access to store methods', () => {
      expect(typeof wrapper.vm.refreshData).toBe('function');
    });

    it('should access setRefreshDataMonitoring function from store', () => {
      expect(wrapper.vm.setRefreshDataMonitoring).toBe(
        monitoringStore.setRefreshDataMonitoring,
      );
    });
  });

  describe('Component Props and Attributes', () => {
    it('should have correct data-testid', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.attributes('data-testid')).toBe('refresh-button');
    });

    it('should use correct button styling', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      const props = refreshButton.props();

      expect(props.type).toBe('tertiary');
      expect(props.iconLeft).toBe('refresh');
    });
  });

  describe('Edge Cases', () => {
    it('should handle store being defined with expected properties', () => {
      expect(monitoringStore.isLoadingAllData).toBeDefined();
      expect(monitoringStore.setRefreshDataMonitoring).toBeDefined();
      expect(typeof monitoringStore.setRefreshDataMonitoring).toBe('function');
    });

    it('should handle store reactivity changes', async () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.props('disabled')).toBe(false);

      mockStoreToRefs.isLoadingAllData.value = true;
      await nextTick();
      expect(refreshButton.props('disabled')).toBe(true);

      mockStoreToRefs.isLoadingAllData.value = false;
      await nextTick();
      expect(refreshButton.props('disabled')).toBe(false);
    });

    it('should handle missing store methods gracefully', () => {
      const incompleteStore = {
        isLoadingAllData: false,
      };
      useHumanSupportMonitoring.mockReturnValue(incompleteStore);

      expect(() => createWrapper()).not.toThrow();
    });

    it('should handle setTimeout correctly in refreshData', async () => {
      vi.useFakeTimers();

      wrapper.vm.refreshData();

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenNthCalledWith(
        1,
        true,
      );

      vi.advanceTimersByTime(500);

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenNthCalledWith(
        2,
        false,
      );

      vi.useRealTimers();
    });
  });

  describe('Type: conversations', () => {
    beforeEach(() => {
      wrapper = createWrapper({ type: 'conversations' });
    });

    it('should use conversational store for conversations type', () => {
      expect(useConversational).toHaveBeenCalled();
    });

    it('should call setRefreshDataConversational when type is conversations', async () => {
      wrapper.vm.refreshData();

      expect(
        conversationalStore.setRefreshDataConversational,
      ).toHaveBeenCalledWith(true);
    });

    it('should handle loading state from conversational store', () => {
      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.props('disabled')).toBe(
        conversationalStore.isLoadingConversationalData,
      );
    });

    it('should set refresh to false after timeout for conversations', async () => {
      vi.useFakeTimers();

      wrapper.vm.refreshData();

      expect(
        conversationalStore.setRefreshDataConversational,
      ).toHaveBeenCalledWith(true);

      vi.advanceTimersByTime(500);

      expect(
        conversationalStore.setRefreshDataConversational,
      ).toHaveBeenCalledWith(false);

      vi.useRealTimers();
    });

    it('should be disabled when conversational data is loading', () => {
      conversationalStore.isLoadingConversationalData = true;
      wrapper = createWrapper({ type: 'conversations' });

      const refreshButton = wrapper.findComponent({ name: 'UnnnicButton' });
      expect(refreshButton.props('disabled')).toBe(true);
    });
  });

  describe('Type Prop Validation', () => {
    it('should accept human-support type', () => {
      const humanSupportWrapper = createWrapper({ type: 'human-support' });
      expect(humanSupportWrapper.vm.$props.type).toBe('human-support');
    });

    it('should accept conversations type', () => {
      const conversationsWrapper = createWrapper({ type: 'conversations' });
      expect(conversationsWrapper.vm.$props.type).toBe('conversations');
    });

    it('should handle refresh for human-support type', () => {
      const humanWrapper = createWrapper({ type: 'human-support' });
      humanWrapper.vm.refreshData();

      expect(monitoringStore.setRefreshDataMonitoring).toHaveBeenCalledWith(
        true,
      );
      expect(
        conversationalStore.setRefreshDataConversational,
      ).not.toHaveBeenCalled();
    });

    it('should handle refresh for conversations type', () => {
      const convWrapper = createWrapper({ type: 'conversations' });
      convWrapper.vm.refreshData();

      expect(
        conversationalStore.setRefreshDataConversational,
      ).toHaveBeenCalledWith(true);
      expect(monitoringStore.setRefreshDataMonitoring).not.toHaveBeenCalled();
    });
  });
});
