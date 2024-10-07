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

    expect(wrapper.vm.displayedText).toBe('Full Generated Text');

    wrapper.vm.isTyping = true;
    wrapper.vm.animatedText = 'Typing...';
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.displayedText).toBe('Typing...');
  });

  it('should call the typeWriter method and display text according to the animation', async () => {
    wrapper = createWrapper();

    const typeWriterSpy = vi.spyOn(wrapper.vm, 'typeWriter');
    await wrapper.setProps({ text: 'Typing Test' });

    expect(typeWriterSpy).toHaveBeenCalledWith('Typing Test', 1);
  });

  it('should run the typing animation correctly', async () => {
    const text = 'Insight';
    const wrapper = createWrapper();

    await wrapper.vm.typeWriter(text, 1);

    expect(wrapper.vm.animatedText).toBe(text);
    expect(wrapper.vm.isTyping).toBe(false);
    expect(wrapper.emitted('typingComplete')).toBeTruthy();
  });

  it('should output “typingComplete” after the typing animation', async () => {
    const wrapper = createWrapper();
    wrapper.setProps({ text: 'Test Text' });

    await wrapper.vm.typeWriter('Test Text', 1);
    expect(wrapper.vm.isTyping).toBe(false);
    expect(wrapper.emitted().typingComplete).toBeTruthy();
  });

  it('should start the typing animation when modifying the “text” prop', async () => {
    const wrapper = createWrapper({ text: '' });

    const typeWriterSpy = vi.spyOn(wrapper.vm, 'typeWriter');
    await wrapper.setProps({ text: 'New Text' });

    expect(typeWriterSpy).toHaveBeenCalledWith('New Text', 1);
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
