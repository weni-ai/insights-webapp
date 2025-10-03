import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import BetaText from '../BetaText.vue';

describe('BetaText', () => {
  let wrapper;

  const createWrapper = () => mount(BetaText);

  const betaContainer = () => wrapper.find('[data-testid="beta-container"]');
  const betaText = () => wrapper.find('[data-testid="beta-text"]');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render the beta container', () => {
      expect(betaContainer().exists()).toBe(true);
    });

    it('should render the beta text', () => {
      expect(betaText().exists()).toBe(true);
    });

    it('should display "BETA" text', () => {
      expect(betaText().text()).toBe('BETA');
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes on container', () => {
      expect(betaContainer().classes()).toContain('beta_text_container');
    });

    it('should have correct CSS classes on text', () => {
      expect(betaText().classes()).toContain('beta_text');
    });

    it('should render as a section element', () => {
      expect(betaContainer().element.tagName).toBe('SECTION');
    });

    it('should render text as a paragraph element', () => {
      expect(betaText().element.tagName).toBe('P');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
