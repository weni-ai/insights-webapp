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

const UnnnicDrawerStub = {
  name: 'UnnnicDrawer',
  props: [
    'modelValue',
    'title',
    'description',
    'primaryButtonText',
    'disabledPrimaryButton',
    'loadingPrimaryButton',
    'secondaryButtonText',
    'disabledSecondaryButton',
    'wide',
  ],
  emits: ['primary-button-click', 'secondary-button-click', 'close'],
  template: `
    <div class="drawer-stub">
      <button class="primary" :disabled="disabledPrimaryButton" @click="$emit('primary-button-click')" />
      <button class="secondary" @click="$emit('secondary-button-click')" />
      <slot name="content" />
    </div>
  `,
};

const UnnnicSwitchStub = {
  name: 'UnnnicSwitch',
  props: ['modelValue', 'textRight'],
  emits: ['update:modelValue'],
  template:
    '<button class="switch-stub" @click="$emit(\'update:modelValue\', !modelValue)">{{ textRight }}</button>',
};

const createWrapper = (goals = {}) => {
  const wrapper = mount(OperationalAlertsDrawer, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })],
      stubs: {
        UnnnicDrawer: UnnnicDrawerStub,
        UnnnicSwitch: UnnnicSwitchStub,
        UnnnicDisclaimer: true,
        OperationalAlertForm: true,
      },
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

  it('should emit close on secondary button click', async () => {
    const { wrapper } = createWrapper();
    await wrapper.find('.secondary').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
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
  });
});
