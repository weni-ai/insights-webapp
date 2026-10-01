import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import ChannelIcon from '../ChannelIcon.vue';

const createWrapper = (channel) =>
  mount(ChannelIcon, {
    props: { channel },
  });

describe('ChannelIcon', () => {
  it.each([
    ['email', 'EmailIcon'],
    ['facebook', 'FacebookIcon'],
    ['instagram', 'InstagramIcon'],
    ['others', 'OthersIcon'],
    ['shopping_assistant', 'ShoppingAssistantIcon'],
    ['teams', 'TeamsIcon'],
    ['whatsapp', 'WhatsappIcon'],
  ])('renders %s as %s', (channel, componentName) => {
    const wrapper = createWrapper(channel);

    expect(wrapper.findComponent({ name: componentName }).exists()).toBe(true);
  });

  it('falls back to OthersIcon when the channel is unknown', () => {
    const wrapper = createWrapper('telegram');

    expect(wrapper.findComponent({ name: 'OthersIcon' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'WhatsappIcon' }).exists()).toBe(
      false,
    );
  });

  it('swaps the rendered icon when the channel prop changes', async () => {
    const wrapper = createWrapper('email');

    expect(wrapper.findComponent({ name: 'EmailIcon' }).exists()).toBe(true);

    await wrapper.setProps({ channel: 'teams' });

    expect(wrapper.findComponent({ name: 'EmailIcon' }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: 'TeamsIcon' }).exists()).toBe(true);
  });
});
