import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import OperationalAlertsDrawer from '../OperationalAlertsDrawer.vue';
import { useMetricGoals } from '@/store/modules/humanSupport/metricGoals';
import { unnnicCallAlert } from '@weni/unnnic-system';

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, unnnicCallAlert: vi.fn() };
});

const drawerSlotStub = (name) => ({
  name,
  template: '<div><slot /></div>',
});

const UnnnicDrawerNextStub = {
  name: 'UnnnicDrawerNext',
  props: ['open'],
  emits: ['update:open'],
  provide() {
    return {
      closeOperationalAlertsDrawer: () => this.$emit('update:open', false),
    };
  },
  template: '<div class="drawer-next-stub"><slot /></div>',
};

const UnnnicDrawerContentStub = {
  name: 'UnnnicDrawerContent',
  template: '<div class="drawer-content-stub"><slot /></div>',
};

const UnnnicDrawerFooterStub = {
  name: 'UnnnicDrawerFooter',
  template: '<div class="drawer-footer-stub"><slot /></div>',
};

const UnnnicDrawerCloseStub = {
  name: 'UnnnicDrawerClose',
  inject: {
    closeOperationalAlertsDrawer: {
      default: null,
    },
  },
  template:
    '<div @click="closeOperationalAlertsDrawer && closeOperationalAlertsDrawer()"><slot /></div>',
};

const UnnnicButtonStub = {
  name: 'UnnnicButton',
  props: ['disabled', 'loading', 'text'],
  emits: ['click'],
  template:
    '<button v-bind="$attrs" :disabled="disabled" @click="$emit(\'click\')">{{ text }}</button>',
};

const UnnnicSwitchStub = {
  name: 'UnnnicSwitch',
  props: ['modelValue', 'textRight'],
  emits: ['update:modelValue'],
  template:
    '<button class="switch-stub" @click="$emit(\'update:modelValue\', !modelValue)">{{ textRight }}</button>',
};

const drawerStubs = {
  UnnnicDrawerNext: UnnnicDrawerNextStub,
  UnnnicDrawerContent: UnnnicDrawerContentStub,
  UnnnicDrawerHeader: drawerSlotStub('UnnnicDrawerHeader'),
  UnnnicDrawerTitle: drawerSlotStub('UnnnicDrawerTitle'),
  UnnnicDrawerFooter: UnnnicDrawerFooterStub,
  UnnnicDrawerClose: UnnnicDrawerCloseStub,
  UnnnicButton: UnnnicButtonStub,
  UnnnicSwitch: UnnnicSwitchStub,
  UnnnicDisclaimer: true,
  OperationalAlertForm: true,
};

const createWrapper = (goals = {}) => {
  const wrapper = mount(OperationalAlertsDrawer, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      stubs: drawerStubs,
    },
    props: { modelValue: true },
  });

  const store = useMetricGoals();
  store.getGoalForMetric.mockImplementation((metric) => goals[metric]);

  return { wrapper, store };
};

describe('OperationalAlertsDrawer.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a section for each metric', () => {
    const { wrapper } = createWrapper();
    expect(
      wrapper
        .find('[data-testid="operational-alerts-section-waiting_time"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper
        .find('[data-testid="operational-alerts-section-first_response_time"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper
        .find(
          '[data-testid="operational-alerts-section-conversation_duration"]',
        )
        .exists(),
    ).toBe(true);
  });

  it('should render description in the body, not in the header', () => {
    const { wrapper } = createWrapper();
    const description = wrapper.find(
      '[data-testid="operational-alerts-description"]',
    );
    const body = wrapper.find('.operational-alerts-drawer__body');
    const header = wrapper.findComponent({ name: 'UnnnicDrawerHeader' });

    expect(description.exists()).toBe(true);
    expect(
      body.find('[data-testid="operational-alerts-description"]').exists(),
    ).toBe(true);
    expect(
      header.find('[data-testid="operational-alerts-description"]').exists(),
    ).toBe(false);
  });

  it('should not render separators when all switches are off', () => {
    const { wrapper } = createWrapper();
    expect(
      wrapper.findAll('[data-testid="operational-alerts-separator"]'),
    ).toHaveLength(0);
  });

  it('should render a separator after an enabled non-last section', async () => {
    const { wrapper } = createWrapper();

    wrapper.vm.formState.waiting_time.enabled = true;
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll('[data-testid="operational-alerts-separator"]'),
    ).toHaveLength(1);
  });

  it('should not render a separator after the last section when enabled', async () => {
    const { wrapper } = createWrapper();

    wrapper.vm.formState.conversation_duration.enabled = true;
    await wrapper.vm.$nextTick();

    expect(
      wrapper.findAll('[data-testid="operational-alerts-separator"]'),
    ).toHaveLength(0);
  });

  it('should emit close on cancel button click', async () => {
    const { wrapper } = createWrapper();
    await wrapper.find('.secondary').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
  });

  it('should initialize form state from goals loaded before mount', async () => {
    const waitingGoal = {
      metric: 'waiting_time',
      thresholdSeconds: 300,
      thresholdValue: 5,
      unit: 'm',
      isActive: true,
      emailEnabled: false,
      recipients: [],
      recipientDetails: [],
      roomsThresholdCount: 3,
    };

    const pinia = createTestingPinia({ createSpy: vi.fn });
    const store = useMetricGoals(pinia);
    store.goals = { waiting_time: waitingGoal };
    store.getGoalForMetric.mockImplementation((metric) => store.goals[metric]);

    const wrapper = mount(OperationalAlertsDrawer, {
      global: {
        plugins: [pinia],
        stubs: drawerStubs,
      },
      props: { modelValue: true },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.formState.waiting_time).toMatchObject({
      enabled: true,
      threshold: 5,
      unit: 'm',
      roomsThresholdCount: 3,
    });
  });

  it('should not reset form state after mount', async () => {
    const { wrapper } = createWrapper();

    wrapper.vm.formState.waiting_time.threshold = 99;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.formState.waiting_time.threshold).toBe(99);
  });

  it('should keep save disabled when an enabled metric has no threshold', async () => {
    const { wrapper } = createWrapper();
    await wrapper.findAllComponents(UnnnicSwitchStub)[0].trigger('click');
    expect(wrapper.find('.primary').attributes('disabled')).toBeDefined();
  });

  const enableValidWaitingTime = async (wrapper) => {
    wrapper.vm.formState.waiting_time = {
      enabled: true,
      threshold: 5,
      unit: 'm',
      recipients: [],
      roomsThresholdCount: 5,
    };
    await wrapper.vm.$nextTick();
  };

  it('should save and show success alert when valid', async () => {
    const { wrapper, store } = createWrapper();
    store.saveGoals.mockResolvedValue(undefined);

    await enableValidWaitingTime(wrapper);
    await wrapper.find('.primary').trigger('click');
    await Promise.resolve();

    expect(store.saveGoals).toHaveBeenCalled();
    expect(unnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'success' }),
      }),
    );
  });

  it('should show an error alert when saving fails', async () => {
    const { wrapper, store } = createWrapper();
    store.saveGoals.mockRejectedValue(new Error('fail'));

    await enableValidWaitingTime(wrapper);
    await wrapper.find('.primary').trigger('click');
    await Promise.resolve();
    await Promise.resolve();

    expect(unnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'error' }),
      }),
    );
    expect(wrapper.emitted('close')).toBeFalsy();
  });
});
