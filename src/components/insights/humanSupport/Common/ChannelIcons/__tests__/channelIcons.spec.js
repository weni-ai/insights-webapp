import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import EmailIcon from '../EmailIcon.vue';
import FacebookIcon from '../FacebookIcon.vue';
import InstagramIcon from '../InstagramIcon.vue';
import OthersIcon from '../OthersIcon.vue';
import ShoppingAssistantIcon from '../ShoppingAssistantIcon.vue';
import TeamsIcon from '../TeamsIcon.vue';
import WhatsappIcon from '../WhatsappIcon.vue';

const tooltipStub = {
  name: 'UnnnicTooltip',
  props: {
    enabled: Boolean,
    text: String,
    side: String,
  },
  template: '<div class="tooltip-stub"><slot /></div>',
};

const iconStub = {
  name: 'UnnnicIcon',
  props: ['icon', 'scheme', 'size'],
  template: '<i class="icon-stub" />',
};

const mountIcon = (component) =>
  shallowMount(component, {
    global: {
      stubs: {
        UnnnicTooltip: tooltipStub,
        UnnnicIcon: iconStub,
      },
    },
  });

const brandedIcons = [
  {
    name: 'WhatsappIcon',
    component: WhatsappIcon,
    text: 'Whatsapp',
    icon: 'thesvg-color:whatsapp',
  },
  {
    name: 'FacebookIcon',
    component: FacebookIcon,
    text: 'Facebook',
    icon: 'thesvg-color:facebook',
  },
  {
    name: 'InstagramIcon',
    component: InstagramIcon,
    text: 'Instagram',
    icon: 'thesvg-color:instagram',
  },
  {
    name: 'TeamsIcon',
    component: TeamsIcon,
    text: 'Teams',
    icon: 'thesvg-color:microsoft-teams',
  },
];

describe('channel icon components', () => {
  describe.each(brandedIcons)('$name', ({ component, text, icon }) => {
    it('shows a right-side tooltip with the channel name', () => {
      const tooltip = mountIcon(component).findComponent({
        name: 'UnnnicTooltip',
      });

      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('enabled')).toBe(true);
      expect(tooltip.props('text')).toBe(text);
      expect(tooltip.props('side')).toBe('right');
    });

    it('renders the brand icon', () => {
      const iconComponent = mountIcon(component).findComponent({
        name: 'UnnnicIcon',
      });

      expect(iconComponent.exists()).toBe(true);
      expect(iconComponent.props('icon')).toBe(icon);
    });
  });

  describe('EmailIcon', () => {
    it('shows a right-side tooltip labeled Email', () => {
      const tooltip = mountIcon(EmailIcon).findComponent({
        name: 'UnnnicTooltip',
      });

      expect(tooltip.props('enabled')).toBe(true);
      expect(tooltip.props('text')).toBe('Email');
      expect(tooltip.props('side')).toBe('right');
    });

    it('renders a mail icon inside the email badge', () => {
      const wrapper = mountIcon(EmailIcon);
      const icon = wrapper.findComponent({ name: 'UnnnicIcon' });

      expect(wrapper.find('.email-icon').exists()).toBe(true);
      expect(icon.props('icon')).toBe('mail');
      expect(icon.props('scheme')).toBe('fg-accent');
      expect(icon.props('size')).toBe('avatar-nano');
    });
  });

  describe('ShoppingAssistantIcon', () => {
    it('shows a right-side tooltip labeled Shopping Assistant', () => {
      const tooltip = mountIcon(ShoppingAssistantIcon).findComponent({
        name: 'UnnnicTooltip',
      });

      expect(tooltip.props('enabled')).toBe(true);
      expect(tooltip.props('text')).toBe('Shopping Assistant');
      expect(tooltip.props('side')).toBe('right');
    });

    it('renders a chat icon inside the shopping assistant badge', () => {
      const wrapper = mountIcon(ShoppingAssistantIcon);
      const icon = wrapper.findComponent({ name: 'UnnnicIcon' });

      expect(wrapper.find('.shopping-assistant-icon').exists()).toBe(true);
      expect(icon.props('icon')).toBe('chat_bubble');
      expect(icon.props('scheme')).toBe('fg-on-primary');
      expect(icon.props('size')).toBe('avatar-nano');
    });
  });

  describe('OthersIcon', () => {
    it('renders the translated others label', () => {
      const wrapper = mountIcon(OthersIcon);

      expect(wrapper.find('.others-icon').text()).toBe('Others');
    });
  });
});
