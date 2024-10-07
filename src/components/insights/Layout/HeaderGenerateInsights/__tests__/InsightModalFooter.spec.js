import { mount, flushPromises } from '@vue/test-utils';
import InsightModalFooter from '@/components/insights/Layout/HeaderGenerateInsights/InsightModalFooter.vue';
import { describe, it, expect, vi } from 'vitest';

describe('InsightModalFooter.vue', () => {
  const defaultProps = {
    generatedInsight: 'Sample Insight',
    isFeedbackSent: false,
    isRenderFooterFeedback: true,
    isBtnYesActive: false,
    isBtnNoActive: false,
    feedbackText: '',
    isSubmitFeedbackLoading: false,
  };

  const mountComponent = (props = {}, stubs = {}) => {
    return mount(InsightModalFooter, {
      attachTo: document.body,
      global: {
        stubs: {
          UnnnicButton: true,
          ...stubs,
        },
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  };

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders footer when generatedInsight is present', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.content__footer').exists()).toBe(true);
  });

  it('shows feedback sent message when isFeedbackSent is true', () => {
    const wrapper = mountComponent({ isFeedbackSent: true });
    expect(wrapper.find('.feedback_sent').exists()).toBe(true);
    expect(wrapper.find('.feedback_sent').text()).toContain(
      `✨${wrapper.vm.$t('insights_header.generate_insight.feedback.complete')}`,
    );
  });

  it('does not show feedback sent message when isFeedbackSent is false', () => {
    const wrapper = mountComponent({ isFeedbackSent: false });
    expect(wrapper.find('.feedback_sent').exists()).toBe(false);
  });

  it('emits "handle-positive-feedback" when positive feedback button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper
      .findComponent('[data-test="feedback-positive-btn"]')
      .trigger('click');
    expect(wrapper.emitted('handle-positive-feedback')).toBeTruthy();
  });

  it('emits "handle-negative-feedback" when negative feedback button is clicked', async () => {
    const wrapper = mountComponent();
    await wrapper
      .findComponent('[data-test="feedback-negative-btn"]')
      .trigger('click');
    expect(wrapper.emitted('handle-negative-feedback')).toBeTruthy();
  });

  it('displays feedback textarea and send button when either button is active', () => {
    const wrapper = mountComponent({
      isBtnYesActive: true,
      isBtnNoActive: false,
    });
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('.footer__feedback__btn_send').exists()).toBe(true);
  });

  it('emits "submit-review" when the send button is clicked', async () => {
    const wrapper = mountComponent({
      isBtnYesActive: true,
    });
    await wrapper.find('.footer__feedback__btn_send').trigger('click');
    expect(wrapper.emitted('submit-review')).toBeTruthy();

    const secondWrapper = mountComponent({
      isBtnNoActive: true,
    });

    await secondWrapper.find('.footer__feedback__btn_send').trigger('click');
    expect(secondWrapper.emitted('submit-review')).toBeTruthy();
  });

  it('handles placeholder text area correctly', async () => {
    const wrapper = mountComponent({ isBtnYesActive: true });
    expect(wrapper.vm.handlePlaceholderTextArea()).toContain(
      wrapper.vm.$t(
        'insights_header.generate_insight.input.placeholder_positive',
      ),
    );
    await wrapper.setProps({ isBtnYesActive: false });
    expect(wrapper.vm.handlePlaceholderTextArea()).toContain(
      wrapper.vm.$t(
        'insights_header.generate_insight.input.placeholder_negative',
      ),
    );
  });

  it('scrolls to the end when isFeedbackSent changes to true', async () => {
    const wrapper = mountComponent({
      isFeedbackSent: false,
    });

    await wrapper.setProps({ isFeedbackSent: true });

    const scrollTargetElement = wrapper.find({ ref: 'scrollTarget' });

    const scrollIntoViewMock = vi.fn();

    Object.defineProperty(scrollTargetElement.element, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
    });

    await wrapper.vm.$nextTick();

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('scrolls to the end when isBtnYesActive changes to true', async () => {
    const wrapper = mountComponent({
      isBtnYesActive: false,
    });

    await wrapper.setProps({ isBtnYesActive: true });

    const scrollTargetElement = wrapper.find({ ref: 'scrollTarget' });

    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(scrollTargetElement.element, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
    });

    await wrapper.vm.$nextTick();

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('scrolls to the end when isBtnNoActive changes to true', async () => {
    const wrapper = mountComponent({
      isBtnNoActive: false,
    });

    await wrapper.setProps({ isBtnNoActive: true });

    const scrollTargetElement = wrapper.find({ ref: 'scrollTarget' });

    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(scrollTargetElement.element, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
    });

    await wrapper.vm.$nextTick();

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('scrollToEnd calls scrollIntoView when scrollTarget exists', () => {
    const wrapper = mountComponent({
      isFeedbackSent: true,
    });

    const scrollTargetElement = wrapper.find({ ref: 'scrollTarget' });

    const scrollIntoViewMock = vi.fn();
    Object.defineProperty(scrollTargetElement.element, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
    });

    wrapper.vm.scrollToEnd();

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('does not call scrollIntoView when scrollTarget does not exist', async () => {
    const wrapper = mountComponent({
      isFeedbackSent: false,
    });

    const scrollIntoViewMock = vi.fn();

    await wrapper.vm.$nextTick();

    wrapper.vm.scrollToEnd();

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('calls the appropriate method when isFeedbackSent changes to true', async () => {
    const wrapper = mountComponent({
      isFeedbackSent: false,
    });

    const scrollTargetElement = wrapper.find({ ref: 'scrollTarget' });

    expect(scrollTargetElement.exists()).toBe(false);

    const scrollToEndMock = vi.spyOn(wrapper.vm, 'scrollToEnd');

    await wrapper.setProps({ isFeedbackSent: true });

    await wrapper.vm.$nextTick();

    expect(wrapper.find({ ref: 'scrollTarget' }).exists()).toBe(true);

    expect(scrollToEndMock).toHaveBeenCalled();

    expect(scrollToEndMock).toHaveBeenCalledTimes(1);
  });
});
