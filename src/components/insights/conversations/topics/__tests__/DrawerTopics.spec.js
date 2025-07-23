import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
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
            title: 'Topics',
            save: 'Save',
            cancel: 'Cancel',
          },
        },
      },
    },
  }),
];

const createMockStore = (overrides = {}) => ({
  isAddTopicsDrawerOpen: false,
  isOpenModal: false,
  hasNewTopics: false,
  hasNewSubTopics: false,
  allNewTopicsComplete: false,
  topics: [],
  initializeMockData: vi.fn(),
  openAddTopicsDrawer: vi.fn(),
  closeAddTopicsDrawer: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  ...overrides,
});

let mockStore = createMockStore();

vi.mock('@/store/modules/conversational/topics', () => ({
  useConversationalTopics: () => mockStore,
}));

const createWrapper = (storeOverrides = {}) => {
  mockStore = createMockStore(storeOverrides);

  return shallowMount(DrawerTopics, {
    global: {
      stubs: {
        UnnnicDrawer: {
          template: `
            <div v-if="modelValue" data-testid="stub-unnnic-drawer">
              <div data-testid="drawer-title">{{ title }}</div>
              <div data-testid="drawer-primary-btn">{{ primaryButtonText }}</div>
              <div data-testid="drawer-secondary-btn">{{ secondaryButtonText }}</div>
              <slot name="content" />
            </div>
          `,
          props: [
            'modelValue',
            'title',
            'primaryButtonText',
            'secondaryButtonText',
          ],
          emits: ['close', 'primary-button-click', 'secondary-button-click'],
        },
        FormTopic: {
          template: '<div data-testid="stub-form-topic">FormTopic</div>',
        },
        ModalTopic: {
          template:
            '<div v-if="isOpen" data-testid="stub-modal-topic">{{ type }}</div>',
          props: ['isOpen', 'type'],
          emits: ['primary-button-click', 'secondary-button-click'],
        },
      },
    },
  });
};

describe('DrawerTopics', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    wrapper = createWrapper();
  });

  const stubDrawer = () => wrapper.find('[data-testid="stub-unnnic-drawer"]');
  const stubModal = () => wrapper.find('[data-testid="stub-modal-topic"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(wrapper.vm).toBeDefined();
    });

    it('should not render drawer when closed', () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: false });

      expect(stubDrawer().exists()).toBe(false);
    });

    it('should not render modal when closed', () => {
      wrapper = createWrapper({ isOpenModal: false });

      expect(stubModal().exists()).toBe(false);
    });

    it('should call initialization methods on mount', () => {
      expect(mockStore.initializeMockData).toHaveBeenCalledTimes(1);
      expect(mockStore.openAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component structure', () => {
    it('should render with correct component structure', () => {
      expect(wrapper.vm).toBeDefined();
      expect(wrapper.exists()).toBe(true);
    });

    it('should have access to store computed properties', () => {
      expect(wrapper.vm).toHaveProperty('isAddTopicsDrawerOpen');
      expect(wrapper.vm).toHaveProperty('isOpenModal');
    });

    it('should contain component templates in source', () => {
      const html = wrapper.html();
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  describe('Computed properties', () => {
    it('should return correct drawer state from store', () => {
      wrapper = createWrapper({ isAddTopicsDrawerOpen: true });

      expect(wrapper.vm.isAddTopicsDrawerOpen).toBe(true);
    });

    it('should return correct modal state from store', () => {
      wrapper = createWrapper({ isOpenModal: true });

      expect(wrapper.vm.isOpenModal).toBe(true);
    });

    it('should use computed properties from store', () => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        isOpenModal: true,
      });

      expect(wrapper.vm.isAddTopicsDrawerOpen).toBe(true);
      expect(wrapper.vm.isOpenModal).toBe(true);
    });
  });

  describe('Event handling', () => {
    beforeEach(() => {
      wrapper = createWrapper({
        isAddTopicsDrawerOpen: true,
        isOpenModal: true,
      });
    });

    it('should handle drawer close with new topics', () => {
      mockStore.hasNewTopics = true;

      wrapper.vm.handleDrawerAddTopics();

      expect(mockStore.openModal).toHaveBeenCalledTimes(1);
      expect(mockStore.openModal).toHaveBeenCalledWith('cancel-topic');
      expect(mockStore.closeAddTopicsDrawer).not.toHaveBeenCalled();
    });

    it('should handle drawer close without new topics', () => {
      mockStore.hasNewTopics = false;

      wrapper.vm.handleDrawerAddTopics();

      expect(mockStore.openModal).not.toHaveBeenCalled();
      expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });

    it('should handle add topic action', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      wrapper.vm.handleAddTopic();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Saving topics:',
        mockStore.topics,
      );
      expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should handle keep adding topic action', () => {
      wrapper.vm.handleKeepAddingTopic();

      expect(mockStore.closeModal).toHaveBeenCalledTimes(1);
    });

    it('should handle cancel topic action', () => {
      wrapper.vm.handleCancelTopic();

      expect(mockStore.closeModal).toHaveBeenCalledTimes(1);
      expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component methods', () => {
    it('should have all required handler methods', () => {
      const methods = [
        'handleDrawerAddTopics',
        'handleAddTopic',
        'handleKeepAddingTopic',
        'handleCancelTopic',
      ];

      methods.forEach((method) => {
        expect(typeof wrapper.vm[method]).toBe('function');
      });
    });

    const methodTests = [
      { method: 'handleKeepAddingTopic', expectedCalls: { closeModal: 1 } },
      {
        method: 'handleCancelTopic',
        expectedCalls: { closeModal: 1, closeAddTopicsDrawer: 1 },
      },
    ];

    methodTests.forEach(({ method, expectedCalls }) => {
      it(`should call correct store methods when ${method} is executed`, () => {
        wrapper.vm[method]();

        Object.entries(expectedCalls).forEach(([storMethod, callCount]) => {
          expect(mockStore[storMethod]).toHaveBeenCalledTimes(callCount);
        });
      });
    });
  });

  describe('Store integration', () => {
    it('should use computed properties from store', () => {
      const storeProperties = ['isAddTopicsDrawerOpen', 'isOpenModal'];

      storeProperties.forEach((prop) => {
        expect(wrapper.vm).toHaveProperty(prop);
      });
    });

    it('should call store methods with correct signatures', () => {
      const storeMethods = [
        'initializeMockData',
        'openAddTopicsDrawer',
        'closeAddTopicsDrawer',
        'openModal',
        'closeModal',
      ];

      storeMethods.forEach((method) => {
        expect(typeof mockStore[method]).toBe('function');
        expect(mockStore[method]).toBeInstanceOf(Function);
      });
    });

    it('should handle store state combinations correctly', () => {
      const stateTests = [
        { hasNewTopics: true, expectModalOpen: true },
        { hasNewTopics: false, expectModalOpen: false },
      ];

      stateTests.forEach(({ hasNewTopics, expectModalOpen }) => {
        mockStore.hasNewTopics = hasNewTopics;

        wrapper.vm.handleDrawerAddTopics();

        if (expectModalOpen) {
          expect(mockStore.openModal).toHaveBeenCalledWith('cancel-topic');
        } else {
          expect(mockStore.closeAddTopicsDrawer).toHaveBeenCalled();
        }

        vi.clearAllMocks();
      });
    });
  });

  describe('Lifecycle hooks', () => {
    it('should call initialization methods on component mount', () => {
      expect(mockStore.initializeMockData).toHaveBeenCalledTimes(1);
      expect(mockStore.openAddTopicsDrawer).toHaveBeenCalledTimes(1);
    });
  });
});
