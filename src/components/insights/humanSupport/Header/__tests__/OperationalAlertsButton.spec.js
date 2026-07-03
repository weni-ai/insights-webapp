import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import OperationalAlertsButton from '../OperationalAlertsButton.vue';
import { useMetricGoals } from '@/store/modules/humanSupport/metricGoals';

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  const slotStub = (name) => ({ name, template: '<div><slot /></div>' });
  return {
    ...actual,
    UnnnicPopover: {
      name: 'UnnnicPopover',
      props: ['open'],
      emits: ['update:open'],
      template: '<div><slot /></div>',
    },
    UnnnicPopoverTrigger: slotStub('UnnnicPopoverTrigger'),
    UnnnicPopoverContent: slotStub('UnnnicPopoverContent'),
    UnnnicButton: {
      name: 'UnnnicButton',
      props: ['disabled'],
      template: '<button v-bind="$attrs"><slot /></button>',
    },
    UnnnicIcon: { name: 'UnnnicIcon', template: '<i />' },
    UnnnicTag: {
      name: 'UnnnicTag',
      props: ['text'],
      template: '<span v-bind="$attrs">{{ text }}</span>',
    },
  };
});

const OperationalAlertsDrawerStub = {
  name: 'OperationalAlertsDrawer',
  props: ['modelValue'],
  emits: ['close', 'update:modelValue'],
  template: '<button class="drawer-close" @click="$emit(\'close\')" />',
};

const createWrapper = (initialState = {}) => {
  const wrapper = mount(OperationalAlertsButton, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            project: { hasSectorsConfigured: true },
            ...initialState,
          },
        }),
      ],
      stubs: {
        OperationalAlertsDrawer: OperationalAlertsDrawerStub,
      },
    },
  });

  const store = useMetricGoals();

  return { wrapper, store };
};

describe('OperationalAlertsButton.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should not load goals on mount', () => {
    const { store } = createWrapper();
    expect(store.loadGoals).not.toHaveBeenCalled();
  });

  it('should load goals when the drawer option is clicked', async () => {
    const { wrapper, store } = createWrapper();

    await wrapper
      .find('[data-testid="operational-alerts-option"]')
      .trigger('click');

    expect(store.loadGoals).toHaveBeenCalled();
  });

  it('should render the trigger and the New tag when the drawer was never opened', () => {
    const { wrapper } = createWrapper();
    expect(
      wrapper.find('[data-testid="operational-alerts-trigger"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="operational-alerts-new-tag"]').exists(),
    ).toBe(true);
  });

  it('should hide the New tag once the drawer has been opened', () => {
    const { wrapper } = createWrapper({
      metricGoals: { hasOpenedDrawer: true },
    });
    expect(
      wrapper.find('[data-testid="operational-alerts-new-tag"]').exists(),
    ).toBe(false);
  });

  it('should open the drawer and mark the popover as seen when the option is clicked', async () => {
    const { wrapper, store } = createWrapper();

    await wrapper
      .find('[data-testid="operational-alerts-option"]')
      .trigger('click');

    expect(store.setHasSeenPopover).toHaveBeenCalledWith(true);
    expect(wrapper.findComponent(OperationalAlertsDrawerStub).exists()).toBe(
      true,
    );
  });

  it('should open the drawer even when loading goals fails', async () => {
    const { wrapper, store } = createWrapper();
    store.loadGoals = vi.fn().mockRejectedValue(new Error('network error'));

    await wrapper
      .find('[data-testid="operational-alerts-option"]')
      .trigger('click');
    await vi.waitFor(() =>
      expect(
        wrapper.findComponent(OperationalAlertsDrawerStub).exists(),
      ).toBe(true),
    );
  });

  it('should mark the drawer as opened when it closes', async () => {
    const { wrapper, store } = createWrapper();

    await wrapper
      .find('[data-testid="operational-alerts-option"]')
      .trigger('click');
    await wrapper.find('.drawer-close').trigger('click');

    expect(store.setHasOpenedDrawer).toHaveBeenCalledWith(true);
  });
});
