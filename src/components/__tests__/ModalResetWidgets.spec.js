import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ModalResetWidget from '../ModalResetWidget.vue';
import { useWidgets } from '@/store/modules/widgets';
import { UnnnicCallAlert } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    UnnnicCallAlert: vi.fn(),
  };
});

describe('ModalResetWidget', () => {
  let wrapper;
  const mockWidget = {
    type: 'test_widget',
    config: {},
    name: 'Test Widget',
  };

  const clickReset = async (instance = wrapper) => {
    const buttons = instance.findAllComponents({ name: 'UnnnicButton' });
    const resetButton = buttons.find(
      (button) => button.props('type') === 'primary',
    );
    await resetButton.trigger('click');
  };

  beforeEach(() => {
    wrapper = mount(ModalResetWidget, {
      props: {
        modelValue: true,
        widget: mockWidget,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    });
    vi.clearAllMocks();
  });

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('emits update:model-value when modal is closed', async () => {
    const buttons = wrapper.findAllComponents({ name: 'UnnnicButton' });
    const cancelButton = buttons.find(
      (button) => button.props('type') === 'tertiary',
    );
    await cancelButton.trigger('click');
    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    expect(wrapper.emitted('update:model-value')[0]).toEqual([false]);
  });

  it('resets widget with empty_column type for specific widget types', async () => {
    const widgetsStore = useWidgets();
    const specialWidget = { ...mockWidget, type: 'vtex_order' };
    await wrapper.setProps({ widget: specialWidget });

    await clickReset();

    expect(widgetsStore.updateWidget).toHaveBeenCalledWith({
      ...specialWidget,
      config: {},
      type: 'empty_column',
      name: '',
    });
  });

  it('resets widget with cleared config for other widget types', async () => {
    const widgetsStore = useWidgets();
    await clickReset();

    expect(widgetsStore.updateWidget).toHaveBeenCalledWith({
      ...mockWidget,
      config: { currency: false },
      name: '',
    });
  });

  it('shows success alert after successful reset', async () => {
    await clickReset();
    expect(UnnnicCallAlert).toHaveBeenCalledWith({
      props: {
        text: i18n.global.t('widgets.success_reset'),
        type: 'success',
      },
      seconds: 5,
    });
  });

  it('shows error alert when reset fails', async () => {
    const widgetsStore = useWidgets();
    widgetsStore.updateWidget.mockRejectedValueOnce(new Error('Reset failed'));

    await clickReset();

    expect(UnnnicCallAlert).toHaveBeenCalledWith({
      props: {
        text: i18n.global.t('widgets.error_reset'),
        type: 'error',
      },
      seconds: 5,
    });
  });

  it('emits finish-reset after reset attempt', async () => {
    await clickReset();
    expect(wrapper.emitted('finish-reset')).toBeTruthy();
  });

  it('sets loading state during reset operation', async () => {
    const widgetsStore = useWidgets();
    let resolveReset;
    widgetsStore.updateWidget.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveReset = resolve;
        }),
    );

    const clickPromise = clickReset();
    await wrapper.vm.$nextTick();

    const primaryButton = wrapper
      .findAllComponents({ name: 'UnnnicButton' })
      .find((button) => button.props('type') === 'primary');
    expect(primaryButton.props('loading')).toBe(true);

    resolveReset();
    await clickPromise;
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .findAllComponents({ name: 'UnnnicButton' })
        .find((button) => button.props('type') === 'primary')
        .props('loading'),
    ).toBe(false);
  });
});
