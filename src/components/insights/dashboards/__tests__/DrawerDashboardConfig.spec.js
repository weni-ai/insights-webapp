import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';
import DrawerDashboardConfig from '../DrawerDashboardConfig.vue';
import { Dashboards } from '@/services/api';
import { Dashboard } from '@/models';

vi.mock('@/services/api', () => ({
  Dashboards: {
    createFlowsDashboard: vi.fn(),
    updateFlowsDashboard: vi.fn(),
  },
}));

vi.mock('@/models', () => ({
  Dashboard: vi
    .fn()
    .mockImplementation(
      (uuid, name, grid, isDefault, isEditable, isDeletable, config) => ({
        uuid,
        name,
        grid,
        is_default: isDefault,
        is_editable: isEditable,
        is_deletable: isDeletable,
        config,
      }),
    ),
}));

vi.mock('@/components/ProgressBar.vue', () => ({
  default: {
    name: 'ProgressBar',
    template: '<div data-testid="progress-bar"><slot /></div>',
    emits: ['progress-complete'],
  },
}));

vi.mock('./ModalDeleteDashboard.vue', () => ({
  default: {
    name: 'ModalDeleteDashboard',
    template: '<div data-testid="modal-delete-dashboard"><slot /></div>',
    props: ['modelValue', 'dashboard'],
    emits: ['close'],
  },
}));

vi.mock('@/components/insights/dashboards/layout/LayoutSelector.vue', () => ({
  default: {
    name: 'LayoutSelector',
    template: '<div data-testid="layout-selector"><slot /></div>',
    emits: ['layout-selected'],
  },
}));

const createMockRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      {
        path: '/dashboard/:dashboardUuid',
        name: 'dashboard',
        component: { template: '<div>Dashboard</div>' },
      },
    ],
  });
};

const createWrapper = (props = {}, piniaOptions = {}) => {
  const router = createMockRouter();
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    ...piniaOptions,
  });

  const defaultProps = {
    modelValue: true,
    dashboard: undefined,
    ...props,
  };

  return mount(DrawerDashboardConfig, {
    props: defaultProps,
    global: {
      plugins: [pinia, router],
      mocks: {
        $t: (key) => key,
        $router: router,
        $route: router.currentRoute,
      },
      stubs: {
        UnnnicDrawer: {
          template: `
            <div data-testid="unnnic-drawer">
              <slot name="content" />
              <button @click="$emit('primary-button-click')" data-testid="primary-button">Primary</button>
              <button @click="$emit('secondary-button-click')" data-testid="secondary-button">Secondary</button>
              <button @click="$emit('close')" data-testid="close-button">Close</button>
            </div>
          `,
          props: [
            'modelValue',
            'title',
            'primaryButtonText',
            'disabledPrimaryButton',
            'loadingPrimaryButton',
            'secondaryButtonText',
            'disabledSecondaryButton',
            'wide',
          ],
          emits: ['primary-button-click', 'secondary-button-click', 'close'],
          methods: {
            close() {
              this.$emit('close');
            },
          },
        },
        UnnnicLabel: {
          template: '<label><slot /></label>',
          props: ['label'],
        },
        UnnnicInput: {
          template: '<input v-model="modelValue" data-testid="unnnic-input" />',
          props: ['modelValue', 'placeholder'],
          emits: ['update:modelValue'],
        },
        UnnnicSelectSmart: {
          template:
            '<select v-model="modelValue" data-testid="unnnic-select-smart"><option v-for="option in options" :key="option.value" :value="option">{{ option.label }}</option></select>',
          props: ['modelValue', 'options', 'placeholder'],
          emits: ['update:modelValue'],
        },
        UnnnicButton: {
          template:
            '<button @click="$emit(\'click\')" data-testid="unnnic-button"><slot /></button>',
          props: ['type', 'text'],
          emits: ['click'],
        },
      },
    },
  });
};

describe('DrawerDashboardConfig', () => {
  let mockDashboardsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardsStore = {
      dashboards: [],
      currentDashboard: null,
    };
  });

  describe('Component Initialization', () => {
    it('should render correctly for new dashboard', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="unnnic-drawer"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="layout-selector"]').exists()).toBe(
        true,
      );
    });

    it('should render correctly for editing existing dashboard', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        is_deletable: true,
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      expect(wrapper.find('[data-testid="unnnic-drawer"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="layout-selector"]').exists()).toBe(
        false,
      );
      expect(wrapper.find('[data-testid="unnnic-button"]').exists()).toBe(true); // Delete button
    });

    it('should populate form fields when editing dashboard', async () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        is_deletable: true,
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.dashboardForm.name).toBe('Test Dashboard');
      expect(wrapper.vm.dashboardForm.currency[0]?.value).toBe('USD');
    });
  });

  describe('Form Validation', () => {
    it('should validate form correctly for new dashboard', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.isValidConfig).toBe(false);

      wrapper.vm.dashboardForm.name = 'Test Dashboard';
      wrapper.vm.dashboardForm.currency = [{ label: 'USD', value: 'USD' }];
      expect(wrapper.vm.isValidConfig).toBe(true);
    });

    it('should validate form correctly for existing dashboard', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      expect(wrapper.vm.isValidConfig).toBe(true);
    });

    it('should invalidate form when required fields are empty', () => {
      const wrapper = createWrapper();

      wrapper.vm.dashboardForm.name = '';
      wrapper.vm.dashboardForm.currency = [];
      expect(wrapper.vm.isValidConfig).toBe(false);

      wrapper.vm.dashboardForm.name = 'Test';
      wrapper.vm.dashboardForm.currency = [];
      expect(wrapper.vm.isValidConfig).toBe(false);

      wrapper.vm.dashboardForm.name = '';
      wrapper.vm.dashboardForm.currency = [{ label: 'USD', value: 'USD' }];
      expect(wrapper.vm.isValidConfig).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should emit close event when close method is called', () => {
      const wrapper = createWrapper();

      wrapper.vm.close();

      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('should handle layout selection', () => {
      const wrapper = createWrapper();

      wrapper.vm.handleLayoutSelected(3);

      expect(wrapper.vm.dashboardForm.layout).toBe(3);
    });

    it('should emit close when secondary button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="secondary-button"]').trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('should emit close when drawer close event is triggered', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="close-button"]').trigger('click');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('Dashboard Creation', () => {
    it('should create dashboard successfully', async () => {
      const mockResponse = {
        dashboard: {
          uuid: 'new-uuid',
          name: 'New Dashboard',
          grid: [2, 3],
          is_default: false,
          is_editable: true,
          is_deletable: true,
          config: { currency_type: 'USD' },
        },
      };

      Dashboards.createFlowsDashboard.mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      wrapper.vm.dashboardForm.name = 'New Dashboard';
      wrapper.vm.dashboardForm.currency = [{ label: 'USD', value: 'USD' }];
      wrapper.vm.dashboardForm.layout = 2;

      await wrapper.vm.createDashboard();

      expect(Dashboards.createFlowsDashboard).toHaveBeenCalledWith({
        dashboardName: 'New Dashboard',
        funnelAmount: 2,
        currencyType: 'USD',
      });

      expect(wrapper.vm.showProgressBar).toBe(true);
      expect(Dashboard).toHaveBeenCalled();
    });

    it('should trigger create dashboard when primary button is clicked for new dashboard', async () => {
      const wrapper = createWrapper();
      const createDashboardSpy = vi.spyOn(wrapper.vm, 'createDashboard');

      wrapper.vm.dashboardForm.name = 'Test Dashboard';
      wrapper.vm.dashboardForm.currency = [{ label: 'USD', value: 'USD' }];

      await wrapper.find('[data-testid="primary-button"]').trigger('click');

      expect(createDashboardSpy).toHaveBeenCalled();
    });
  });

  describe('Dashboard Update', () => {
    it('should trigger update dashboard when primary button is clicked for existing dashboard', async () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });
      const updateDashboardSpy = vi.spyOn(wrapper.vm, 'updateDashboard');

      await wrapper.find('[data-testid="primary-button"]').trigger('click');

      expect(updateDashboardSpy).toHaveBeenCalled();
    });
  });

  describe('Delete Dashboard Modal', () => {
    it('should show delete dashboard button for deletable dashboard', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        is_deletable: true,
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      expect(wrapper.find('[data-testid="unnnic-button"]').exists()).toBe(true);
    });

    it('should not show delete dashboard button for non-deletable dashboard', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        is_deletable: false,
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      expect(wrapper.find('[data-testid="unnnic-button"]').exists()).toBe(
        false,
      );
    });

    it('should show delete modal when delete button is clicked', async () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        is_deletable: true,
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      await wrapper.find('[data-testid="unnnic-button"]').trigger('click');

      expect(wrapper.vm.showDeleteDashboardModal).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should compute currency options correctly', () => {
      const wrapper = createWrapper();

      expect(wrapper.vm.currencyOptions).toHaveLength(4);
      expect(wrapper.vm.currencyOptions.map((option) => option.value)).toEqual([
        'BRL',
        'USD',
        'EUR',
        'ARS',
      ]);
    });
  });

  describe('Component Lifecycle', () => {
    it('should call handleDashboardFields on mount when dashboard is provided', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        config: { currency_type: 'USD' },
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });
      const handleDashboardFieldsSpy = vi.spyOn(
        wrapper.vm,
        'handleDashboardFields',
      );

      wrapper.vm.handleDashboardFields();

      expect(handleDashboardFieldsSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing currency in dashboard config', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
        config: {},
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      expect(wrapper.vm.dashboardForm.currency).toEqual([]);
    });

    it('should handle dashboard without config', () => {
      const mockDashboard = {
        uuid: 'test-uuid',
        name: 'Test Dashboard',
      };

      const wrapper = createWrapper({ dashboard: mockDashboard });

      expect(wrapper.vm.dashboardForm.currency).toEqual([]);
      expect(wrapper.vm.dashboardForm.name).toBe('Test Dashboard');
    });
  });
});
