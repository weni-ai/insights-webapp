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

describe('AgentStatus', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  describe('Component rendering', () => {
    it('renders the component with green status', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const container = wrapper.find('[data-testid="agent-status-container"]');
      expect(container.exists()).toBe(true);

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('agent-status--green');
    });

    it('renders the component with gray status', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'gray',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('agent-status--gray');
    });

    it('renders the component with orange status', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.exists()).toBe(true);
      expect(icon.classes()).toContain('agent-status--orange');
    });

    it('displays the label when provided', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          label: 'Online',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe('Online');
    });

    it('does not display the label when not provided', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const label = wrapper.find('[data-testid="agent-status-label"]');
      expect(label.exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('applies the correct css classes based on status prop', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status');
      expect(icon.classes()).toContain('agent-status--orange');
    });

    it('validates the status prop accepts only allowed values', () => {
      const validator = AgentStatus.props.status.validator;

      expect(validator('green')).toBe(true);
      expect(validator('gray')).toBe(true);
      expect(validator('orange')).toBe(true);
      expect(validator('red')).toBe(false);
      expect(validator('')).toBe(false);
      expect(validator(null)).toBe(false);
    });

    it('sets the label prop correctly', async () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          label: '',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

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
    it('computes the correct statusClass for green', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const computedClasses = wrapper.vm.statusClass;
      expect(computedClasses['agent-status']).toBe(true);
      expect(computedClasses['agent-status--green']).toBe(true);
    });

    it('computes the correct statusClass for gray', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'gray',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const computedClasses = wrapper.vm.statusClass;
      expect(computedClasses['agent-status']).toBe(true);
      expect(computedClasses['agent-status--gray']).toBe(true);
    });

    it('computes the correct statusClass for orange', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const computedClasses = wrapper.vm.statusClass;
      expect(computedClasses['agent-status']).toBe(true);
      expect(computedClasses['agent-status--orange']).toBe(true);
    });

    it('updates statusClass when status prop changes', async () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(wrapper.vm.statusClass['agent-status--green']).toBe(true);

      await wrapper.setProps({ status: 'orange' });

      expect(wrapper.vm.statusClass['agent-status--green']).toBe(undefined);
      expect(wrapper.vm.statusClass['agent-status--orange']).toBe(true);

      const icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--orange');
    });
  });

  describe('Edge cases', () => {
    it('handles status changes correctly', async () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      let icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--green');

      await wrapper.setProps({ status: 'gray' });
      icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--gray');

      await wrapper.setProps({ status: 'orange' });
      icon = wrapper.find('[data-testid="agent-status-icon"]');
      expect(icon.classes()).toContain('agent-status--orange');
    });

    it('renders with multiple status changes and label updates', async () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          label: 'Online',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      let icon = wrapper.find('[data-testid="agent-status-icon"]');
      let label = wrapper.find('[data-testid="agent-status-label"]');

      expect(icon.classes()).toContain('agent-status--green');
      expect(label.text()).toBe('Online');

      await wrapper.setProps({
        status: 'gray',
        label: 'Offline',
      });

      icon = wrapper.find('[data-testid="agent-status-icon"]');
      label = wrapper.find('[data-testid="agent-status-label"]');

      expect(icon.classes()).toContain('agent-status--gray');
      expect(label.text()).toBe('Offline');

      await wrapper.setProps({ label: '' });

      expect(wrapper.find('[data-testid="agent-status-label"]').exists()).toBe(
        false,
      );
    });
  });

  describe('DisconnectAgent integration', () => {
    it('renders DisconnectAgent component when status is green', () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(true);
    });

    it('does not render DisconnectAgent component when status is gray', () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'gray',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(false);
    });

    it('renders DisconnectAgent component when status is orange', () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(true);
    });

    it('passes the correct agent prop to DisconnectAgent component', () => {
      const mockAgent = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      const disconnectAgentComponent =
        wrapper.findComponent(DisconnectAgentStub);
      expect(disconnectAgentComponent.exists()).toBe(true);
      expect(disconnectAgentComponent.props('agent')).toEqual(mockAgent);
    });

    it('shows and hides DisconnectAgent when status changes from green to gray', async () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ status: 'gray' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('shows and hides DisconnectAgent when status changes from orange to gray', async () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ status: 'gray' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(false);
    });

    it('keeps DisconnectAgent visible when status changes from green to orange', async () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);

      await wrapper.setProps({ status: 'orange' });

      expect(
        wrapper.find('[data-testid="disconnect-agent-stub"]').exists(),
      ).toBe(true);
    });
  });

  describe('enabledDisconnectAgent computed property', () => {
    it('returns true for green status', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);
    });

    it('returns true for orange status', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);
    });

    it('returns false for gray status', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'gray',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });

    it('updates enabledDisconnectAgent when status prop changes', async () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'gray',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);

      await wrapper.setProps({ status: 'green' });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);

      await wrapper.setProps({ status: 'orange' });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(true);

      await wrapper.setProps({ status: 'gray' });
      expect(wrapper.vm.enabledDisconnectAgent).toBe(false);
    });
  });

  describe('Agent prop', () => {
    it('accepts agent prop with default values', () => {
      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

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

      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          agent: customAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: DisconnectAgentStub,
          },
        },
      });

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
    it('emits request-data event when DisconnectAgent emits it with green status', async () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'green',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: {
              template:
                '<div data-testid="disconnect-agent-stub" @click="$emit(\'request-data\')" />',
              props: ['agent'],
              emits: ['request-data'],
            },
          },
        },
      });

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(true);

      await disconnectAgent.trigger('click');

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')).toHaveLength(1);
    });

    it('emits request-data event when DisconnectAgent emits it with orange status', async () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'orange',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: {
              template:
                '<div data-testid="disconnect-agent-stub" @click="$emit(\'request-data\')" />',
              props: ['agent'],
              emits: ['request-data'],
            },
          },
        },
      });

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(true);

      await disconnectAgent.trigger('click');

      expect(wrapper.emitted('request-data')).toBeTruthy();
      expect(wrapper.emitted('request-data')).toHaveLength(1);
    });

    it('does not emit request-data event when status is gray and DisconnectAgent is not present', async () => {
      const mockAgent = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      wrapper = mount(AgentStatus, {
        props: {
          status: 'gray',
          agent: mockAgent,
        },
        global: {
          plugins: [i18n, UnnnicSystem],
          stubs: {
            UnnnicIcon: UnnnicIconStub,
            DisconnectAgent: {
              template:
                '<div data-testid="disconnect-agent-stub" @click="$emit(\'request-data\')" />',
              props: ['agent'],
              emits: ['request-data'],
            },
          },
        },
      });

      const disconnectAgent = wrapper.find(
        '[data-testid="disconnect-agent-stub"]',
      );
      expect(disconnectAgent.exists()).toBe(false);

      expect(wrapper.emitted('request-data')).toBeFalsy();
    });
  });
});
