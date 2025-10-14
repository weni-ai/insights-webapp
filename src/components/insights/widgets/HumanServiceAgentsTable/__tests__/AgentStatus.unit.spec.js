import { mount, config } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

import AgentStatus from '../AgentStatus.vue';

vi.mock('@/components/DisconnectAgent.vue', () => ({
  default: {
    name: 'DisconnectAgent',
    template: '<div data-testid="disconnect-agent-mock" />',
    props: ['agent'],
  },
}));

vi.mock('@/services/api/resources/disconnectAgent', () => ({
  default: {
    disconnectAgent: vi.fn(),
  },
}));

vi.mock('@/utils/env', () => ({
  default: vi.fn(() => 'http://localhost:3000'),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

const UnnnicIconStub = {
  template:
    '<div class="unnnic-icon" :data-icon="icon" :class="$attrs.class" :data-testid="$attrs[\'data-testid\']"><slot /></div>',
  props: ['icon', 'size'],
};

const DisconnectAgentStub = {
  template: '<div data-testid="disconnect-agent-stub" />',
  props: ['agent'],
};

const DisconnectAgentStubWithEmit = {
  template:
    '<div data-testid="disconnect-agent-stub" @click="$emit(\'request-data\')" />',
  props: ['agent'],
  emits: ['request-data'],
};

const mountAgentStatus = (props = {}, overrides = {}) => {
  return mount(AgentStatus, {
    props,
    global: {
      plugins: [i18n, UnnnicSystem],
      stubs: {
        UnnnicIcon: UnnnicIconStub,
        DisconnectAgent: DisconnectAgentStub,
      },
      ...overrides.global,
    },
    ...overrides,
  });
};

const mockAgentWithEmail = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

const mockAgentAnotherEmail = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
};

describe('AgentStatus', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  describe('Component rendering', () => {
    it('renders the component with online status', () => {
      wrapper = mountAgentStatus({ status: 'online' });

      const container = wrapper.find('[data-testid="agent-status-container"]');
      expect(container.exists()).toBe(true);

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('agent-status--online');
    });

    it('renders the component with offline status', () => {
      wrapper = mountAgentStatus({ status: 'offline' });

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('agent-status--offline');
    });

    it('renders the component with custom status', () => {
      wrapper = mountAgentStatus({ status: 'custom' });

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('agent-status--custom');
    });

    it('displays the label when provided', () => {
      wrapper = mountAgentStatus({ status: 'online', label: 'Online' });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe('Online');
    });

    it('does not display the label when not provided', () => {
      wrapper = mountAgentStatus({ status: 'online' });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('applies the correct css classes based on status prop', () => {
      wrapper = mountAgentStatus({ status: 'custom' });

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status');
      expect(icon.classes()).toContain('agent-status--custom');
    });

    it('validates the status prop accepts only allowed values', () => {
      const validator = AgentStatus.props.status.validator;

      expect(validator('online')).toBe(true);
      expect(validator('offline')).toBe(true);
      expect(validator('custom')).toBe(true);
      expect(validator('red')).toBe(false);
      expect(validator('')).toBe(false);
      expect(validator(null)).toBe(false);
    });

    it('sets the label prop correctly', async () => {
      wrapper = mountAgentStatus({ status: 'online', label: '' });

      expect(wrapper.find('[data-testid="agent-status-label"]').exists()).toBe(
        false,
      );

      await wrapper.setProps({ label: 'Test Label' });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe('Test Label');
    });
  });

  describe('Computed properties', () => {
    it('computes the correct statusClass for online', () => {
      wrapper = mountAgentStatus({ status: 'online' });

      const computedClasses = wrapper.vm.statusClass;
      expect(computedClasses['agent-status']).toBe(true);
      expect(computedClasses['agent-status--online']).toBe(true);
    });

    it('computes the correct statusClass for offline', () => {
      wrapper = mountAgentStatus({ status: 'offline' });

      const computedClasses = wrapper.vm.statusClass;
      expect(computedClasses['agent-status']).toBe(true);
      expect(computedClasses['agent-status--offline']).toBe(true);
    });

    it('computes the correct statusClass for custom', () => {
      wrapper = mountAgentStatus({ status: 'custom' });

      const computedClasses = wrapper.vm.statusClass;
      expect(computedClasses['agent-status']).toBe(true);
      expect(computedClasses['agent-status--custom']).toBe(true);
    });

    it('updates statusClass when status prop changes', async () => {
      wrapper = mountAgentStatus({ status: 'online' });

      expect(wrapper.vm.statusClass['agent-status--online']).toBe(true);

      await wrapper.setProps({ status: 'custom' });

      expect(wrapper.vm.statusClass['agent-status--online']).toBe(undefined);
      expect(wrapper.vm.statusClass['agent-status--custom']).toBe(true);

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--custom');
    });

    it('translates custom label correctly', () => {
      wrapper = mountAgentStatus({ status: 'custom', label: 'custom' });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(true);
      expect(wrapper.vm.renderLabel).toBe('Pause');
    });

    it('capitalizes non-custom labels correctly', () => {
      wrapper = mountAgentStatus({ status: 'online', label: 'online' });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(true);
      expect(wrapper.vm.renderLabel).toBe('Online');
    });
  });

  describe('Edge cases', () => {
    it('handles status changes correctly', async () => {
      wrapper = mountAgentStatus({ status: 'online' });

      let icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--online');

      await wrapper.setProps({ status: 'offline' });
      icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--offline');

      await wrapper.setProps({ status: 'custom' });
      icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--custom');
    });

    it('renders with multiple status changes and label updates', async () => {
      wrapper = mountAgentStatus({ status: 'online', label: 'Online' });

      let icon = wrapper.find('[data-testid="agent-status-icon"]');
      let label = wrapper.find('[data-testid="agent-status-label"]');

      expect(icon.classes()).toContain('agent-status--online');
      expect(label.text()).toBe('Online');

      await wrapper.setProps({ status: 'offline', label: 'Offline' });

      icon = wrapper.find('[data-testid="agent-status-icon"]');
      label = wrapper.find('[data-testid="agent-status-label"]');

      expect(icon.classes()).toContain('agent-status--offline');
      expect(label.text()).toBe('Offline');

      await wrapper.setProps({ label: '' });

      expect(wrapper.find('[data-testid="agent-status-label"]').exists()).toBe(
        false,
      );
    });
  });

  describe('DisconnectAgent integration', () => {
    it('renders DisconnectAgent component when status is online', () => {
      wrapper = mountAgentStatus({
        status: 'online',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);
    });

    it('does not render DisconnectAgent component when status is offline', () => {
      wrapper = mountAgentStatus({
        status: 'offline',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('renders DisconnectAgent component when status is custom', () => {
      wrapper = mountAgentStatus({
        status: 'custom',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);
    });

    it('passes the correct agent prop to DisconnectAgent component', () => {
      wrapper = mountAgentStatus({
        status: 'online',
        agent: mockAgentAnotherEmail,
      });

      const disconnectAgentComponent =
        wrapper.findComponent(DisconnectAgentStub);
      expect(disconnectAgentComponent.exists()).toBe(true);
      expect(disconnectAgentComponent.props('agent')).toEqual(
        mockAgentAnotherEmail,
      );
    });

    it('shows and hides DisconnectAgent when status changes from online to offline', async () => {
      wrapper = mountAgentStatus({
        status: 'online',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ status: 'offline' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('shows and hides DisconnectAgent when status changes from custom to offline', async () => {
      wrapper = mountAgentStatus({
        status: 'custom',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ status: 'offline' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('keeps DisconnectAgent visible when status changes from online to custom', async () => {
      wrapper = mountAgentStatus({
        status: 'online',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ status: 'custom' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);
    });

    it('does not render DisconnectAgent when status is online but no agent email', () => {
      wrapper = mountAgentStatus({ status: 'online' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('does not render DisconnectAgent when status is custom but no agent email', () => {
      wrapper = mountAgentStatus({ status: 'custom' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('shows DisconnectAgent when agent email is added', async () => {
      wrapper = mountAgentStatus({ status: 'online' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);

      await wrapper.setProps({
        agent: { name: 'John', email: 'john@example.com' },
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);
    });

    it('hides DisconnectAgent when agent email is removed', async () => {
      wrapper = mountAgentStatus({
        status: 'online',
        agent: mockAgentWithEmail,
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ agent: { name: 'John', email: '' } });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });
  });

  describe('enabledDisconnectAgent computed property', () => {
    it('returns true for online status with agent email', () => {
      wrapper = mountAgentStatus({
        status: 'online',
        agent: mockAgentWithEmail,
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);
    });

    it('returns false for online status without agent email', () => {
      wrapper = mountAgentStatus({ status: 'online' });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });

    it('returns true for custom status with agent email', () => {
      wrapper = mountAgentStatus({
        status: 'custom',
        agent: mockAgentAnotherEmail,
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);
    });

    it('returns false for custom status without agent email', () => {
      wrapper = mountAgentStatus({ status: 'custom' });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });

    it('returns false for offline status even with agent email', () => {
      wrapper = mountAgentStatus({
        status: 'offline',
        agent: mockAgentWithEmail,
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });

    it('updates enabledDisconnectAgent when status prop changes', async () => {
      wrapper = mountAgentStatus({
        status: 'offline',
        agent: mockAgentWithEmail,
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);

      await wrapper.setProps({ status: 'online' });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);

      await wrapper.setProps({ status: 'custom' });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);

      await wrapper.setProps({ status: 'offline' });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });

    it('updates enabledDisconnectAgent when agent email changes', async () => {
      wrapper = mountAgentStatus({ status: 'online' });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);

      await wrapper.setProps({
        agent: { name: 'John', email: 'john@example.com' },
      });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);

      await wrapper.setProps({ agent: { name: 'John', email: '' } });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });
  });

  describe('Agent prop', () => {
    it('accepts agent prop with default values', () => {
      wrapper = mountAgentStatus({ status: 'online' });

      expect(wrapper.exists()).toBe(true);
      expect(
        wrapper.find('[data-testid="agent-status-container"]').exists(),
      ).toBe(true);
    });

    it('accepts custom agent object', () => {
      const customAgent = {
        name: 'Custom Agent',
        email: 'custom@example.com',
        id: 123,
      };

      wrapper = mountAgentStatus({ status: 'online', agent: customAgent });

      const disconnectAgentComponent =
        wrapper.findComponent(DisconnectAgentStub);
      expect(disconnectAgentComponent.props('agent')).toEqual(customAgent);
    });

    it('validates agent prop structure', () => {
      const agentProp = AgentStatus.props.agent;

      expect(agentProp.type).toBe(Object);
      expect(agentProp.required).toBe(false);
      expect(typeof agentProp.default).toBe('function');

      const defaultAgent = agentProp.default();
      expect(defaultAgent).toEqual({
        name: '',
        email: '',
      });
    });
  });

  describe('Event emission', () => {
    it('emits request-data event when DisconnectAgent emits it with online status', async () => {
      wrapper = mountAgentStatus(
        { status: 'online', agent: mockAgentWithEmail },
        {
          global: {
            stubs: {
              UnnnicIcon: UnnnicIconStub,
              DisconnectAgent: DisconnectAgentStubWithEmit,
            },
          },
        },
      );

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(true);

      await disconnectAgent.trigger('click');

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')).toHaveLength(1);
    });

    it('emits request-data event when DisconnectAgent emits it with custom status', async () => {
      wrapper = mountAgentStatus(
        { status: 'custom', agent: mockAgentWithEmail },
        {
          global: {
            stubs: {
              UnnnicIcon: UnnnicIconStub,
              DisconnectAgent: DisconnectAgentStubWithEmit,
            },
          },
        },
      );

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(true);

      await disconnectAgent.trigger('click');

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')).toHaveLength(1);
    });

    it('does not emit request-data event when status is offline and DisconnectAgent is not present', async () => {
      wrapper = mountAgentStatus(
        { status: 'offline', agent: mockAgentWithEmail },
        {
          global: {
            stubs: {
              UnnnicIcon: UnnnicIconStub,
              DisconnectAgent: DisconnectAgentStubWithEmit,
            },
          },
        },
      );

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(false);

      expect(wrapper.emitted('request-data')).toBeFalsy();
    });
  });
});
