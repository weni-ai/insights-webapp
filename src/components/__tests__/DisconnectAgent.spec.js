import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import DisconnectAgent from '../DisconnectAgent.vue';

const disconnectAgent = vi.fn();
const UnnnicCallAlert = vi.fn();

vi.mock('@/services/api/resources/disconnectAgent', () => ({
  default: {
    disconnectAgent: (...args) => disconnectAgent(...args),
  },
}));

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    UnnnicCallAlert: (...args) => UnnnicCallAlert(...args),
  };
});

const createWrapper = (props = {}) =>
  mount(DisconnectAgent, {
    props: {
      agent: { name: 'Ana Costa', email: 'ana@email.com' },
      ...props,
    },
    global: {
      stubs: {
        UnnnicDialog: {
          name: 'UnnnicDialog',
          props: ['open'],
          template: '<div class="dialog-stub"><slot /></div>',
        },
        UnnnicDialogTrigger: {
          name: 'UnnnicDialogTrigger',
          template: '<div><slot /></div>',
        },
        UnnnicDialogContent: {
          name: 'UnnnicDialogContent',
          template: '<div><slot /></div>',
        },
        UnnnicDialogHeader: {
          name: 'UnnnicDialogHeader',
          template: '<div><slot /></div>',
        },
        UnnnicDialogTitle: {
          name: 'UnnnicDialogTitle',
          template: '<div><slot /></div>',
        },
        UnnnicDialogFooter: {
          name: 'UnnnicDialogFooter',
          template: '<div><slot /></div>',
        },
        UnnnicDialogClose: {
          name: 'UnnnicDialogClose',
          template: '<div><slot /></div>',
        },
        UnnnicToolTip: {
          name: 'UnnnicToolTip',
          props: ['text', 'side', 'enabled'],
          template:
            '<div class="tooltip-stub" :data-text="text" :data-side="side"><slot /></div>',
        },
        UnnnicButton: {
          name: 'UnnnicButton',
          props: ['text', 'type', 'loading', 'disabled', 'iconCenter', 'size'],
          emits: ['click'],
          template:
            '<button class="btn-stub" :disabled="disabled" @click="$emit(\'click\')">{{ text }}</button>',
        },
      },
    },
  });

describe('DisconnectAgent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders disconnect button and enabled tooltip', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[data-testid="disconnect-agent-button"]').exists(),
    ).toBe(true);
    expect(wrapper.vm.handleTooltipText).toBeTruthy();
  });

  it('uses different tooltip text when disabled', () => {
    const enabled = createWrapper();
    const disabled = createWrapper({ disabled: true });

    expect(disabled.vm.handleTooltipText).not.toBe(
      enabled.vm.handleTooltipText,
    );
    expect(disabled.props('disabled')).toBe(true);
  });

  it('applies center container class when containerCenter is true', () => {
    const wrapper = createWrapper({ containerCenter: true });

    expect(wrapper.find('.disconnect-agent-container').classes()).toContain(
      'disconnect-agent-container--center',
    );
  });

  it('disconnects agent successfully and emits request-data', async () => {
    disconnectAgent.mockResolvedValue(undefined);
    const wrapper = createWrapper();

    await wrapper.vm.handleDisconnectModalClick();
    await nextTick();

    expect(disconnectAgent).toHaveBeenCalledWith({ agent: 'ana@email.com' });
    expect(wrapper.emitted('request-data')).toBeTruthy();
    expect(UnnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'success' }),
      }),
    );
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.isOpen).toBe(false);
  });

  it('shows error alert when disconnect fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    disconnectAgent.mockRejectedValue(new Error('failed'));
    const wrapper = createWrapper();

    await wrapper.vm.handleDisconnectModalClick();
    await nextTick();

    expect(UnnnicCallAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({ type: 'error' }),
      }),
    );
    expect(wrapper.emitted('request-data')).toBeFalsy();
    expect(wrapper.vm.isLoading).toBe(false);
    consoleSpy.mockRestore();
  });
});
