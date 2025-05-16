import { mount, config } from '@vue/test-utils';
import { describe, it, expect, afterEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

import AgentStatus from '../AgentStatus.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

// Mock UnnnicIcon component to avoid loading real icons
const UnnnicIconStub = {
  template:
    '<div class="unnnic-icon" :data-icon="icon" :class="$attrs.class" :data-testid="$attrs[\'data-testid\']"><slot /></div>',
  props: ['icon', 'size'],
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
          },
        },
      });

      // Initially no label should be shown
      expect(wrapper.find('[data-testid="agent-status-label"]').exists()).toBe(
        false,
      );

      // Update the props to include a label
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
          },
        },
      });

      // Check initial computed classes
      expect(wrapper.vm.statusClass['agent-status--green']).toBe(true);

      // Update the status prop
      await wrapper.setProps({ status: 'orange' });

      // Check that computed classes updated
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
          },
        },
      });

      // Check initial state
      let icon = wrapper.find('[data-testid="agent-status-icon"]');
      let label = wrapper.find('[data-testid="agent-status-label"]');

      expect(icon.classes()).toContain('agent-status--green');
      expect(label.text()).toBe('Online');

      // Update both props
      await wrapper.setProps({
        status: 'gray',
        label: 'Offline',
      });

      // Check that both updates were applied
      icon = wrapper.find('[data-testid="agent-status-icon"]');
      label = wrapper.find('[data-testid="agent-status-label"]');

      expect(icon.classes()).toContain('agent-status--gray');
      expect(label.text()).toBe('Offline');

      // Remove the label
      await wrapper.setProps({ label: '' });

      // Label should no longer exist in the DOM
      expect(wrapper.find('[data-testid="agent-status-label"]').exists()).toBe(
        false,
      );
    });
  });
});
