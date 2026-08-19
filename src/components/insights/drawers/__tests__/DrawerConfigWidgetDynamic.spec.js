import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createTestingPinia } from '@pinia/testing';
import { moduleStorage } from '@/utils/storage';
import { useWidgets } from '@/store/modules/widgets';
import { useOnboarding } from '@/store/modules/onboarding';

import DrawerConfigWidgetDynamic from '../DrawerConfigWidgetDynamic.vue';
import DrawerConfigContentCard from '../DrawerConfigContentCard.vue';
import DrawerConfigContentFunnel from '../DrawerConfigContentFunnel.vue';
import DrawerConfigContentVtex from '../DrawerConfigContentVtex.vue';
import DrawerConfigContentVtexConversions from '../DrawerConfigContentVtexConversions.vue';
import DrawerConfigContentRecurrence from '../DrawerConfigContentRecurrence.vue';
import ModalResetWidget from '@/components/ModalResetWidget.vue';

const mockWidget = {
  uuid: 'test-uuid',
  type: 'card',
  config: {
    name: 'Test Widget',
    flow: {
      uuid: 'flow-uuid',
      result: 'test-result',
    },
    operation: 'count',
  },
};

const mockProjectFlows = [
  {
    value: 'flow-uuid',
    label: 'Test Flow',
    results: [{ value: 'test-result', label: 'Test Result' }],
  },
];

const createWrapper = (props = {}, storeState = {}) => {
  const store = createTestingPinia({
    initialState: {
      project: {
        isLoadingFlows: false,
        flows: mockProjectFlows,
        ...storeState.project,
      },
      widgets: {
        currentWidgetEditing: mockWidget,
        updateWidget: vi.fn(),
        getCurrentDashboardWidgetData: vi.fn(),
        getWidgetGraphFunnelData: vi.fn(),
        getWidgetRecurrenceData: vi.fn(),
        getWidgetVtexOrderData: vi.fn(),
        ...storeState.widgets,
      },
      onboarding: {
        onboardingRefs: {
          'widgets-onboarding-tour': {
            currentStep: 1,
            steps: [1, 2, 3],
            nextStep: vi.fn(),
          },
        },
        showConfigWidgetOnboarding: false,
        callTourNextStep: vi.fn(),
        callTourPreviousStep: vi.fn(),
        setShowCompleteOnboardingModal: vi.fn(),
        ...storeState.onboarding,
      },
    },
  });

  return mount(DrawerConfigWidgetDynamic, {
    props: {
      modelValue: true,
      ...props,
    },
    global: {
      plugins: [store],
      mocks: {},
      stubs: {
        UnnnicDrawer: {
          template: '<div><slot name="content" /></div>',
          props: [
            'modelValue',
            'title',
            'description',
            'primaryButtonText',
            'secondaryButtonText',
            'disabledPrimaryButton',
            'loadingPrimaryButton',
            'wide',
            'distinctCloseBack',
            'size',
            'data-onboarding-id',
          ],
          methods: {
            close: vi.fn(),
          },
        },
        DrawerConfigContentCard,
        DrawerConfigContentFunnel,
        DrawerConfigContentVtex,
        DrawerConfigContentVtexConversions,
        DrawerConfigContentRecurrence,
        ModalResetWidget,
        SkeletonConfigContentCard: { template: '<div>Skeleton Card</div>' },
        SkeletonConfigContentFunnel: { template: '<div>Skeleton Funnel</div>' },
        SkeletonConfigContentVtex: { template: '<div>Skeleton Vtex</div>' },
        SkeletonConfigContentVtexConversions: {
          template: '<div>Skeleton Vtex Conversions</div>',
        },
        SkeletonConfigContentRecurrence: {
          template: '<div>Skeleton Recurrence</div>',
        },
      },
    },
  });
};

describe('DrawerConfigWidgetDynamic.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should mount component correctly', () => {
      wrapper = createWrapper();
      expect(wrapper.vm).toBeTruthy();
    });
  });

  describe('Computed Properties', () => {
    describe('drawerProps', () => {
      it('should return correct props for graph_funnel type', () => {
        wrapper = createWrapper(
          {},
          {
            widgets: {
              currentWidgetEditing: { ...mockWidget, type: 'graph_funnel' },
            },
          },
        );

        const props = wrapper.vm.drawerProps;
        expect(props.title).toBe('Set metrics for the chart');
        expect(props.description).toBe(
          'Select at least three flows to fetch the funnel chart view',
        );
      });

      it('should return correct props for card type with executions config', () => {
        wrapper = createWrapper({ configType: 'executions' });

        const props = wrapper.vm.drawerProps;
        expect(props.title).toBe('Runs');
        expect(props.description).toBe('View the total runs of a flow');
      });
    });

    describe('content', () => {
      it('should return correct content for card type', () => {
        wrapper = createWrapper();

        const content = wrapper.vm.content;
        expect(content.component).toBe(DrawerConfigContentCard);
        expect(content.loading).toBeDefined();
      });

      it('should return correct content for funnel type', () => {
        wrapper = createWrapper({ configType: 'funnel' });

        const content = wrapper.vm.content;
        expect(content.component).toBe(DrawerConfigContentFunnel);
        expect(content.loading).toBeDefined();
      });

      it('should return loading component when isLoadingProjectFlows is true', () => {
        wrapper = createWrapper(
          {},
          {
            project: {
              isLoadingFlows: true,
              flows: mockProjectFlows,
            },
          },
        );

        const content = wrapper.vm.content;
        expect(content.loading).toBeDefined();
      });
    });

    describe('contentProps', () => {
      it('should return correct props for non-card type', () => {
        wrapper = createWrapper(
          {},
          {
            widgets: {
              currentWidgetEditing: { ...mockWidget, type: 'graph_funnel' },
            },
          },
        );

        const props = wrapper.vm.contentProps;
        expect(props.modelValue).toEqual({
          ...mockWidget,
          type: 'graph_funnel',
        });
        expect(props.type).toBeUndefined();
      });
    });

    describe('contentEvents', () => {
      it('should return correct events', () => {
        wrapper = createWrapper();

        const events = wrapper.vm.contentEvents;
        expect(events['update:model-value']).toBeDefined();
        expect(events['update-disable-primary-button']).toBeDefined();
        expect(events['reset-widget']).toBeDefined();
      });
    });

    describe('treatedWidget', () => {
      it('should return correct widget for card type', () => {
        wrapper = createWrapper();

        const widget = wrapper.vm.treatedWidget;
        expect(widget.name).toBe('Test Widget');
        expect(widget.source).toBe('flowruns');
        expect(widget.config).toEqual(mockWidget.config);
      });

      it('should return correct widget for graph_funnel type', () => {
        wrapper = createWrapper(
          {},
          {
            widgets: {
              currentWidgetEditing: { ...mockWidget, type: 'graph_funnel' },
            },
          },
        );

        wrapper.vm.config = [
          { name: 'Metric 1', flow: 'flow-1' },
          { name: 'Metric 2', flow: 'flow-2' },
        ];

        const widget = wrapper.vm.treatedWidget;
        expect(widget.type).toBe('graph_funnel');
        expect(widget.config.metric_1).toBeDefined();
        expect(widget.config.metric_2).toBeDefined();
      });

      it('should return correct widget for recurrence type', () => {
        wrapper = createWrapper(
          { configType: 'recurrence' },
          {
            widgets: {
              currentWidgetEditing: { ...mockWidget, type: 'empty_column' },
            },
          },
        );

        const widget = wrapper.vm.treatedWidget;
        expect(widget.type).toBe('recurrence');
        expect(widget.config.operation).toBe('recurrence');
        expect(widget.config.type).toBe('flow_result');
      });
    });
  });

  describe('Methods', () => {
    describe('internalClose', () => {
      it('should call tour previous step', async () => {
        wrapper = createWrapper();

        const onboardingStore = useOnboarding();
        const tourSpy = vi.spyOn(onboardingStore, 'callTourPreviousStep');

        await wrapper.vm.internalClose();

        expect(tourSpy).toHaveBeenCalledWith({
          tour: 'widgets-onboarding-tour',
          qtdSteps: 2,
          timeout: 300,
        });
      });

      it('should call tour previous step with correct steps for non-card widget', async () => {
        wrapper = createWrapper(
          {},
          {
            widgets: {
              currentWidgetEditing: { ...mockWidget, type: 'graph_funnel' },
            },
          },
        );

        const onboardingStore = useOnboarding();
        const tourSpy = vi.spyOn(onboardingStore, 'callTourPreviousStep');

        await wrapper.vm.internalClose();

        expect(tourSpy).toHaveBeenCalledWith({
          tour: 'widgets-onboarding-tour',
          qtdSteps: 1,
          timeout: 300,
        });
      });
    });

    describe('updateWidgetConfig', () => {
      it('should update widget successfully for card type', async () => {
        wrapper = createWrapper();
        const widgetsStore = useWidgets();
        const updateWidgetSpy = vi.spyOn(widgetsStore, 'updateWidget');
        const getDataSpy = vi.spyOn(
          widgetsStore,
          'getCurrentDashboardWidgetData',
        );

        await wrapper.vm.updateWidgetConfig();

        expect(updateWidgetSpy).toHaveBeenCalled();
        expect(getDataSpy).toHaveBeenCalled();
        expect(wrapper.emitted('close')).toBeTruthy();
      });

      it('should update widget successfully', async () => {
        wrapper = createWrapper({ configType: 'vtex' });
        const widgetsStore = useWidgets();
        const updateWidgetSpy = vi.spyOn(widgetsStore, 'updateWidget');

        await wrapper.vm.updateWidgetConfig();

        expect(updateWidgetSpy).toHaveBeenCalled();
      });

      it('should update widget successfully for recurrence type', async () => {
        wrapper = createWrapper({ configType: 'recurrence' });
        const widgetsStore = useWidgets();
        const updateWidgetSpy = vi.spyOn(widgetsStore, 'updateWidget');
        const getRecurrenceDataSpy = vi.spyOn(
          widgetsStore,
          'getWidgetRecurrenceData',
        );

        await wrapper.vm.updateWidgetConfig();

        expect(updateWidgetSpy).toHaveBeenCalled();
        expect(getRecurrenceDataSpy).toHaveBeenCalled();
      });

      it('should handle onboarding completion when on last step', async () => {
        wrapper = createWrapper(
          {},
          {
            onboarding: {
              showConfigWidgetOnboarding: true,
              onboardingRefs: {
                'widgets-onboarding-tour': {
                  currentStep: 3,
                  steps: [1, 2, 3],
                  nextStep: vi.fn(),
                },
              },
            },
          },
        );
        const onboardingStore = useOnboarding();
        const tourNextStepSpy = vi.spyOn(onboardingStore, 'callTourNextStep');
        const setModalSpy = vi.spyOn(
          onboardingStore,
          'setShowCompleteOnboardingModal',
        );

        await wrapper.vm.updateWidgetConfig();

        expect(tourNextStepSpy).toHaveBeenCalledWith('widgets-onboarding-tour');
        expect(setModalSpy).toHaveBeenCalledWith(true);
        expect(moduleStorage.getItem('hasWidgetsOnboardingComplete')).toBe(
          true,
        );
      });

      it('should handle error during update', async () => {
        wrapper = createWrapper();
        const widgetsStore = useWidgets();
        const updateWidgetSpy = vi.spyOn(widgetsStore, 'updateWidget');
        updateWidgetSpy.mockRejectedValue(new Error('Update failed'));

        await wrapper.vm.updateWidgetConfig();

        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });
  });

  describe('ModalResetWidget Integration', () => {
    it('should show ModalResetWidget when showModalResetWidget is true', async () => {
      wrapper = createWrapper();
      wrapper.vm.showModalResetWidget = true;
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent(ModalResetWidget);
      expect(modal.exists()).toBe(true);
      expect(modal.props('modelValue')).toBe(true);
    });

    it('should handle finish-reset event from ModalResetWidget', async () => {
      wrapper = createWrapper();
      wrapper.vm.showModalResetWidget = true;
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent(ModalResetWidget);
      await modal.vm.$emit('finish-reset');

      expect(wrapper.emitted('close')).toBeTruthy();
      expect(wrapper.emitted('close')[0][0]).toEqual({
        handleTourNextStep: false,
      });
    });
  });

  describe('Watchers', () => {
    it('should call internalClose when isLoadingUpdateConfig changes to false', async () => {
      wrapper = createWrapper();
      const onboardingStore = useOnboarding();
      const tourSpy = vi.spyOn(onboardingStore, 'callTourPreviousStep');

      wrapper.vm.isLoadingUpdateConfig = true;
      await wrapper.vm.$nextTick();
      wrapper.vm.isLoadingUpdateConfig = false;
      await wrapper.vm.$nextTick();

      expect(tourSpy).toHaveBeenCalled();
    });
  });

  describe('Content Events', () => {
    it('should update config when update:model-value is emitted', async () => {
      wrapper = createWrapper();
      const newConfig = { name: 'Updated Config' };

      await wrapper.vm.contentEvents['update:model-value'](newConfig);

      expect(wrapper.vm.config).toEqual(newConfig);
    });

    it('should update disablePrimaryButton when update-disable-primary-button is emitted', async () => {
      wrapper = createWrapper();

      await wrapper.vm.contentEvents['update-disable-primary-button'](true);

      expect(wrapper.vm.disablePrimaryButton).toBe(true);
    });

    it('should show modal when reset-widget is emitted', async () => {
      wrapper = createWrapper();

      await wrapper.vm.contentEvents['reset-widget']();

      expect(wrapper.vm.showModalResetWidget).toBe(true);
    });
  });
});
