import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createI18n } from 'vue-i18n';

import DrawerTopics from '../DrawerTopics.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        conversations_dashboard: {
          form_topic: {
            title: 'Add Topics',
            save: 'Save',
            cancel: 'Cancel',
            disclaimer: 'This is a disclaimer message for adding topics',
          },
        },
      },
    },
  }),
];

const isAddTopicsDrawerOpenRef = ref(false);
const isOpenModalRef = ref(false);
const isSavingTopicsRef = ref(false);
const allNewTopicsCompleteRef = ref(true);
const hasNewTopicsRef = ref(false);
const hasNewSubTopicsRef = ref(false);

const mockStore = {
  get isAddTopicsDrawerOpen() {
    return isAddTopicsDrawerOpenRef.value;
  },
  get isOpenModal() {
    return isOpenModalRef.value;
  },
  get isSavingTopics() {
    return isSavingTopicsRef.value;
  },
  get allNewTopicsComplete() {
    return allNewTopicsCompleteRef.value;
  },
  get hasNewTopics() {
    return hasNewTopicsRef.value;
  },
  get hasNewSubTopics() {
    return hasNewSubTopicsRef.value;
  },
  loadFormTopics: vi.fn(),
  closeAddTopicsDrawer: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  saveAllNewTopics: vi.fn(() => Promise.resolve(true)),
};

vi.mock('@/store/modules/conversational/topics', () => ({
  useConversationalTopics: () => mockStore,
}));

const createWrapper = (storeState = {}) => {
  const newState = {
    isAddTopicsDrawerOpen: false,
    isOpenModal: false,
    isSavingTopics: false,
    allNewTopicsComplete: true,
    hasNewTopics: false,
    hasNewSubTopics: false,
    ...storeState,
  };

  isAddTopicsDrawerOpenRef.value = newState.isAddTopicsDrawerOpen;
  isOpenModalRef.value = newState.isOpenModal;
  isSavingTopicsRef.value = newState.isSavingTopics;
  allNewTopicsCompleteRef.value = newState.allNewTopicsComplete;
  hasNewTopicsRef.value = newState.hasNewTopics;
  hasNewSubTopicsRef.value = newState.hasNewSubTopics;

  return shallowMount(DrawerTopics, {
    global: {
      stubs: {
        UnnnicDrawer: true,
        UnnnicDisclaimer: true,
        FormTopic: true,
        ModalTopic: true,
      },
    },
  });
};

describe('DrawerTopics', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    isAddTopicsDrawerOpenRef.value = false;
    isOpenModalRef.value = false;
    isSavingTopicsRef.value = false;
    allNewTopicsCompleteRef.value = true;
    hasNewTopicsRef.value = false;
    hasNewSubTopicsRef.value = false;
    wrapper = createWrapper();
  });

  describe('Conditional rendering', () => {
    it('should render drawer when isAddTopicsDrawerOpen is true', async () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });
      await nextTick();

      expect(wrapper.findComponent({ name: 'UnnnicDrawer' }).exists()).toBe(
        true,
      );
    });

    it('should not render drawer when isAddTopicsDrawerOpen is false', async () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: false });
      await nextTick();

      expect(wrapper.findComponent({ name: 'UnnnicDrawer' }).exists()).toBe(
        false,
      );
    });

    it('should always render modal component', async () => {
      wrapper = createWrapper({ isOpenModal: true });
      await nextTick();

      expect(wrapper.findComponent({ name: 'ModalTopic' }).exists()).toBe(true);
    });

    it('should render drawer component with proper structure when open', async () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });
      await nextTick();

      expect(wrapper.findComponent({ name: 'UnnnicDrawer' }).exists()).toBe(
        true,
      );

      const drawerComponent = wrapper.findComponent({ name: 'UnnnicDrawer' });
      expect(drawerComponent.attributes('modelvalue')).toBe('true');
    });

    it('should not render disclaimer when drawer is closed', async () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: false });
      await nextTick();

      expect(wrapper.findComponent({ name: 'UnnnicDisclaimer' }).exists()).toBe(
        false,
      );
    });
  });

  describe('Store integration', () => {
    it('should call loadFormTopics when drawer opens via watcher', async () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });
      await nextTick();

      expect(mockStore.loadFormTopics).toHaveBeenCalled();
    });
  });

  describe('Event handlers', () => {
    it('should close drawer when no new topics exist', async () => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        hasNewTopics: false,
        hasNewSubTopics: false,
      });
      await nextTick();

      await wrapper.vm.handleDrawerAddTopics();

      expect(mockStore.openModal).not.toHaveBeenCalled();
      expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });

    it('should open modal when closing drawer with new topics', async () => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        hasNewTopics: true,
      });
      await nextTick();

      await wrapper.vm.handleDrawerAddTopics();

      expect(mockStore.openModal).toHaveBeenCalledWith('cancel-topic');
      expect(mockStore.closeAddTopicsDrawer).not.toHaveBeenCalled();
    });

    it('should open modal when closing drawer with new sub topics', async () => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        hasNewSubTopics: true,
      });
      await nextTick();

      await wrapper.vm.handleDrawerAddTopics();

      expect(mockStore.openModal).toHaveBeenCalledWith('cancel-topic');
      expect(mockStore.closeAddTopicsDrawer).not.toHaveBeenCalled();
    });

    it('should handle successful topic save', async () => {
      mockStore.saveAllNewTopics.mockResolvedValue(true);
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });
      await nextTick();

      await wrapper.vm.handleAddTopic();

      expect(mockStore.saveAllNewTopics).toHaveBeenCalledTimes(1);
      expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });

    it('should handle failed topic save', async () => {
      mockStore.saveAllNewTopics.mockResolvedValue(false);
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });
      await nextTick();

      await wrapper.vm.handleAddTopic();

      expect(mockStore.saveAllNewTopics).toHaveBeenCalledTimes(1);
      expect(mockStore.closeAddTopicsDrawer).not.toHaveBeenCalled();
    });

    it('should handle keep adding topic', async () => {
      wrapper = createWrapper();
      await nextTick();

      await wrapper.vm.handleKeepAddingTopic();

      expect(mockStore.closeModal).toHaveBeenCalledTimes(1);
    });

    it('should handle cancel topic', async () => {
      wrapper = createWrapper();
      await nextTick();

      await wrapper.vm.handleCancelTopic();

      expect(mockStore.closeModal).toHaveBeenCalledTimes(1);
      expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed properties', () => {
    it('should compute disabledPrimaryButton correctly', async () => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        allNewTopicsComplete: false,
      });
      await nextTick();

      expect(wrapper.vm.disabledPrimaryButton).toBe(true);
    });

    it('should enable primary button when allNewTopicsComplete is true', async () => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        allNewTopicsComplete: true,
      });
      await nextTick();

      expect(wrapper.vm.disabledPrimaryButton).toBe(false);
    });
  });

  describe('Component structure validation', () => {
    it('should render drawer with appropriate data-testid', () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });

      const drawerComponent = wrapper.findComponent({ name: 'UnnnicDrawer' });
      expect(drawerComponent.exists()).toBe(true);
      expect(drawerComponent.attributes('data-testid')).toBe(
        'drawer-topics-drawer',
      );
    });
  });
});
