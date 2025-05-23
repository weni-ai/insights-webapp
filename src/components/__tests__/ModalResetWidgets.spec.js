import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import ModalResetWidget from '../ModalResetWidget.vue';
import { useWidgets } from '@/store/modules/widgets';
import Unnnic from '@weni/unnnic-system';

vi.mock('@weni/unnnic-system', () => ({
  default: {
    unnnicCallAlert: vi.fn(),
  },
}));

describe('ModalResetWidget', () => {
  let wrapper;
  const mockWidget = {
    type: 'test_widget',
    config: {},
    name: 'Test Widget',
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
    await wrapper.vm.updateModelValue(false);
    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    expect(wrapper.emitted('update:model-value')[0]).toEqual([false]);
  });

  it('resets widget with empty_column type for specific widget types', async () => {
    const widgetsStore = useWidgets();
    const specialWidget = { ...mockWidget, type: 'vtex_order' };
    await wrapper.setProps({ widget: specialWidget });

    await wrapper.vm.resetWidget();

    expect(widgetsStore.updateWidget).toHaveBeenCalledWith({
      ...specialWidget,
      config: {},
      type: 'empty_column',
      name: '',
    });
  });

  it('resets widget with cleared config for other widget types', async () => {
    const widgetsStore = useWidgets();
    await wrapper.vm.resetWidget();

    expect(widgetsStore.updateWidget).toHaveBeenCalledWith({
      ...mockWidget,
      config: { currency: false },
      name: '',
    });
  });

  it('shows success alert after successful reset', async () => {
    await wrapper.vm.resetWidget();
    expect(Unnnic.unnnicCallAlert).toHaveBeenCalledWith({
      props: {
        text: wrapper.vm.$t('widgets.success_reset'),
        type: 'success',
      },
      seconds: 5,
    });
  });

  it('shows error alert when reset fails', async () => {
    const widgetsStore = useWidgets();
    widgetsStore.updateWidget.mockRejectedValueOnce(new Error('Reset failed'));

    await wrapper.vm.resetWidget();

    expect(Unnnic.unnnicCallAlert).toHaveBeenCalledWith({
      props: {
        text: wrapper.vm.$t('widgets.error_reset'),
        type: 'error',
      },
      seconds: 5,
    });
  });

  it('emits finish-reset after reset attempt', async () => {
    await wrapper.vm.resetWidget();
    expect(wrapper.emitted('finish-reset')).toBeTruthy();
  });

  it('sets loading state during reset operation', async () => {
    expect(wrapper.vm.isLoading).toBe(false);

    const resetPromise = wrapper.vm.resetWidget();
    expect(wrapper.vm.isLoading).toBe(true);

    await resetPromise;
    expect(wrapper.vm.isLoading).toBe(false);
  });
});
