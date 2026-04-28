import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import AgentCard from '../AgentCard.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const defaultProps = {
  title: 'Ana Costa',
  subtitle: '850 chats • 620 reviews',
  rating: 4.9,
};

const createWrapper = (props = {}) => {
  return mount(AgentCard, {
    props: { ...defaultProps, ...props },
  });
};

describe('AgentCard.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the agent card', () => {
      expect(wrapper.find('.agent-card').exists()).toBe(true);
    });

    it('should render the agent name', () => {
      expect(wrapper.find('.agent-card__agent-name').text()).toBe('Ana Costa');
    });

    it('should render the subtitle', () => {
      expect(wrapper.find('.agent-card__agent-subtitle').text()).toBe(
        '850 chats • 620 reviews',
      );
    });
  });

  describe('Active State', () => {
    it('should not have active class by default', () => {
      expect(wrapper.find('.agent-card').classes()).not.toContain('active');
    });

    it('should apply active class when active is true', () => {
      wrapper = createWrapper({ active: true });
      expect(wrapper.find('.agent-card').classes()).toContain('active');
    });
  });

  describe('Deleted State', () => {
    it('should not apply muted class to name by default', () => {
      const name = wrapper.find('.agent-card__agent-name');
      expect(name.classes()).not.toContain('agent-card__agent-name--muted');
    });

    it('should apply muted class to name when isDeleted is true', () => {
      wrapper = createWrapper({ isDeleted: true });
      const name = wrapper.find('.agent-card__agent-name');
      expect(name.classes()).toContain('agent-card__agent-name--muted');
    });

    it('should have deleted tooltip disabled by default', () => {
      const tooltip = wrapper.find(
        '[data-testid="agent-card-deleted-tooltip"]',
      );
      expect(tooltip.attributes('enabled')).toBe('false');
    });

    it('should enable deleted tooltip when deletedTooltip is provided', () => {
      wrapper = createWrapper({
        isDeleted: true,
        deletedTooltip: 'Representative removed from project',
      });
      const tooltip = wrapper.find(
        '[data-testid="agent-card-deleted-tooltip"]',
      );
      expect(tooltip.attributes('enabled')).toBe('true');
    });

    it('should pass correct text to deleted tooltip', () => {
      const tooltipText = 'Representative removed from project';
      wrapper = createWrapper({
        isDeleted: true,
        deletedTooltip: tooltipText,
      });
      const tooltip = wrapper.find(
        '[data-testid="agent-card-deleted-tooltip"]',
      );
      expect(tooltip.attributes('text')).toBe(tooltipText);
    });

    it('should render name with muted class inside tooltip when deleted', () => {
      wrapper = createWrapper({
        isDeleted: true,
        deletedTooltip: 'Representative removed from project',
      });
      const name = wrapper.find('.agent-card__agent-name');
      expect(name.exists()).toBe(true);
      expect(name.classes()).toContain('agent-card__agent-name--muted');
    });

    it('should not affect subtitle styling when agent is deleted', () => {
      wrapper = createWrapper({
        isDeleted: true,
        deletedTooltip: 'Representative removed from project',
      });
      const subtitle = wrapper.find('.agent-card__agent-subtitle');
      expect(subtitle.exists()).toBe(true);
      expect(subtitle.text()).toBe('850 chats • 620 reviews');
    });
  });
});
