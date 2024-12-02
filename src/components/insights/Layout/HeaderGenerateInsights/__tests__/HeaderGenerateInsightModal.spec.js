import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderGenerateInsightModal from '@/components/insights/Layout/HeaderGenerateInsights/HeaderGenerateInsightModal.vue';
import InsightModalFooter from '@/components/insights/Layout/HeaderGenerateInsights/InsightModalFooter.vue';
import HeaderGenerateInsightText from '@/components/insights/Layout/HeaderGenerateInsights/HeaderGenerateInsightText.vue';
import firebaseService from '@/services/api/resources/GPT';

vi.mock('@/services/api/resources/GPT');

describe('HeaderGenerateInsightModal.vue', () => {
  let wrapper;
  let mockStore;

  beforeEach(() => {
    mockStore = {
      state: {
        widgets: {
          currentDashboardWidgets: [
            {
              type: 'card',
              name: 'Widget1',
              config: { data_type: 'sec' },
              data: { value: 60 },
            },
          ],
        },
        gpt: {
          insights: [{ received: { value: 'Sample Insight' } }],
        },
        user: {
          email: 'test@example.com',
        },
      },
      dispatch: vi.fn(),
    };

    wrapper = mount(HeaderGenerateInsightModal, {
      global: {
        stubs: {
          InsightModalFooter: true,
          UnnnicIcon: true,
          Transition: true,
        },
        mocks: {
          $store: mockStore,
          $t: (key) => key,
        },
      },
      props: {
        show: true,
      },
    });
  });

  it('renders modal when show is true', () => {
    expect(wrapper.find('.header-generate-insight-modal').exists()).toBe(true);
  });

  it('emits close event when close button is clicked', async () => {
    await wrapper.find('.header__close-button').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('renders HeaderGenerateInsightText component', () => {
    expect(wrapper.findComponent(HeaderGenerateInsightText).exists()).toBe(
      true,
    );
  });

  it('renders InsightModalFooter component', () => {
    expect(wrapper.findComponent(InsightModalFooter).exists()).toBe(true);
  });

  it('calls generateInsight when show prop changes to true', async () => {
    const generateInsightSpy = vi.spyOn(wrapper.vm, 'generateInsight');
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    expect(generateInsightSpy).toHaveBeenCalled();
  });

  it('handles typing complete event', async () => {
    await wrapper
      .findComponent(HeaderGenerateInsightText)
      .vm.$emit('typing-complete');
    expect(wrapper.vm.isRenderFeedback).toBe(true);
  });

  it('handles positive feedback', async () => {
    await wrapper.vm.handlePositiveFeedback();
    expect(wrapper.vm.isBtnYesActive).toBe(true);
    expect(wrapper.vm.isBtnNoActive).toBe(false);
    await wrapper.vm.$nextTick();
    wrapper.vm.isBtnNoActive = true;
    await wrapper.vm.handlePositiveFeedback();
    expect(wrapper.vm.isBtnYesActive).toBe(false);
    expect(wrapper.vm.isBtnNoActive).toBe(false);
  });

  it('handles negative feedback', async () => {
    await wrapper.vm.handleNegativeFeedback();
    expect(wrapper.vm.isBtnNoActive).toBe(true);
    expect(wrapper.vm.isBtnYesActive).toBe(false);
    await wrapper.vm.$nextTick();
    wrapper.vm.isBtnYesActive = true;
    wrapper.vm.isBtnNoActive = false;
    await wrapper.vm.handleNegativeFeedback();
    expect(wrapper.vm.isBtnNoActive).toBe(true);
    expect(wrapper.vm.isBtnYesActive).toBe(false);
  });

  it('submits review successfully', async () => {
    firebaseService.createReview.mockResolvedValue();
    wrapper.vm.isBtnYesActive = true;
    wrapper.vm.feedbackText = 'Great insight!';
    await wrapper.vm.submitReview();
    expect(firebaseService.createReview).toHaveBeenCalledWith({
      helpful: true,
      comment: 'Great insight!',
      user: 'test@example.com',
    });
    expect(wrapper.vm.isFeedbackSent).toBe(true);
  });

  it('handles dynamic param correctly', () => {
    const widget = {
      type: 'card',
      name: 'TestWidget',
      config: { data_type: 'sec' },
      data: { value: 120 },
    };
    const result = wrapper.vm.handleDynamicParam(widget);
    expect(result).toBe('TestWidget 2m');
  });

  it('handles dynamic params data undefined correctly', () => {
    const widget = {
      type: 'card',
      name: 'TestWidget',
      config: { data_type: 'other' },
      data: { value: null },
    };
    const result = wrapper.vm.handleDynamicParam(widget);
    expect(result).toBe('0 TestWidget');
  });

  it('generates insight correctly', async () => {
    mockStore.dispatch.mockResolvedValue();
    await wrapper.vm.generateInsight();
    expect(mockStore.dispatch).toHaveBeenCalledWith('gpt/getInsights', {
      prompt: expect.any(String),
    });
    expect(wrapper.vm.generatedInsight).toBe('Sample Insight');
  });

  it('handles generate insight error', async () => {
    mockStore.dispatch.mockRejectedValue(new Error('API Error'));
    await wrapper.vm.generateInsight();
    expect(wrapper.vm.generatedInsight).toBe(
      wrapper.vm.$t('insights_header.generate_insight.error'),
    );
    expect(wrapper.vm.generateInsightError).toBe(true);
  });

  it('cleans up observer on component unmount', () => {
    const disconnectMock = vi.fn();
    wrapper.vm.observer = { disconnect: disconnectMock };
    wrapper.unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('updates showGradient based on scroll position', async () => {
    const contentElement = wrapper.find('[data-testid="modal-content"]');

    contentElement.element.scrollTop = 0;
    Object.defineProperty(contentElement.element, 'scrollHeight', {
      value: 1000,
    });
    Object.defineProperty(contentElement.element, 'clientHeight', {
      value: 500,
    });

    await contentElement.trigger('scroll');

    expect(wrapper.vm.showGradient).toBe(true);

    contentElement.element.scrollTop = 500;
    await contentElement.trigger('scroll');

    expect(wrapper.vm.showGradient).toBe(false);
  });

  it('emits close when clicking outside with a mouse', async () => {
    const outsideClickEvent = new MouseEvent('click', { bubbles: true });

    Object.defineProperty(outsideClickEvent, 'pointerType', { value: 'mouse' });

    document.body.dispatchEvent(outsideClickEvent);

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should handle feedback text on @update-feedback-text from InsightModalFooter', async () => {
    const footer = wrapper.findComponent(
      '[data-testid="insight-modal-footer"]',
    );
    const text = 'teste';
    await footer.vm.$emit('update-feedback-text', text);
    expect(wrapper.vm.feedbackText).toBe(text);
  });
});
