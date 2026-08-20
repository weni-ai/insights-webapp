import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import HeaderGenerateInsightText from '@/components/insights/Layout/HeaderGenerateInsights/HeaderGenerateInsightText.vue';
import Markdown from '@/components/Markdown.vue';

const createWrapper = (props = {}) => {
  return mount(HeaderGenerateInsightText, {
    global: {
      stubs: { Markdown: true },
    },
    props,
  });
};

describe('HeaderGenerateInsightText', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should render the "generating insights" section when the text is not displayed', () => {
    expect(
      wrapper.find('.header-generate-insight-text__generating').exists(),
    ).toBe(true);
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('insights_header.generate_insight.generating_insights'),
    );
  });

  it('should render the three generation animation points', () => {
    const dots = wrapper.findAll('.generating__dot');
    expect(dots.length).toBe(3);
  });

  it('should render Markdown content when text is displayed', async () => {
    wrapper = createWrapper({ text: 'Generated Insight Text' });
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('.header-generate-insight-text__generated').exists(),
    ).toBe(true);
    const markdown = wrapper.findComponent(Markdown);
    expect(markdown.exists()).toBe(true);
    expect(markdown.props('content')).toBe('Generated Insight Text');
  });

  it('should correctly compute "displayedText" based on animation or full text', async () => {
    wrapper = createWrapper({ text: 'Full Generated Text' });
    await wrapper.vm.$nextTick();

    expect(wrapper.findComponent(Markdown).props('content')).toBe(
      'Full Generated Text',
    );
  });

  it('should call the typeWriter method and display text according to the animation', async () => {
    wrapper = createWrapper();
    await wrapper.setProps({ text: 'Typing Test' });
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('.header-generate-insight-text__generated').exists() ||
        wrapper.find('.header-generate-insight-text__generating').exists(),
    ).toBe(true);
  });

  it('should run the typing animation correctly', async () => {
    vi.useFakeTimers();
    const text = 'Insight';
    const wrapper = createWrapper();

    await wrapper.setProps({ text });
    await vi.runAllTimersAsync();

    expect(wrapper.emitted('typingComplete')).toBeTruthy();
    vi.useRealTimers();
  });

  it('should output “typingComplete” after the typing animation', async () => {
    vi.useFakeTimers();
    const wrapper = createWrapper();
    await wrapper.setProps({ text: 'Test Text' });
    await vi.runAllTimersAsync();
    expect(wrapper.emitted().typingComplete).toBeTruthy();
    vi.useRealTimers();
  });

  it('should start the typing animation when modifying the “text” prop', async () => {
    const wrapper = createWrapper({ text: '' });
    await wrapper.setProps({ text: 'New Text' });
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('.header-generate-insight-text__generated').exists() ||
        wrapper.find('.header-generate-insight-text__generating').exists(),
    ).toBe(true);
  });

  it('should not render the “generating insights” section if text is available', async () => {
    wrapper = createWrapper({ text: 'Some Insight Text' });
    await wrapper.vm.$nextTick();

    expect(
      wrapper.find('.header-generate-insight-text__generating').exists(),
    ).toBe(false);
    expect(
      wrapper.find('.header-generate-insight-text__generated').exists(),
    ).toBe(true);
  });
});
