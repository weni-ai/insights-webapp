import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import HeaderGenerateInsightModal from '@/components/insights/Layout/HeaderGenerateInsights/HeaderGenerateInsightModal.vue';
import InsightModalFooter from '@/components/insights/Layout/HeaderGenerateInsights/InsightModalFooter.vue';
import HeaderGenerateInsightText from '@/components/insights/Layout/HeaderGenerateInsights/HeaderGenerateInsightText.vue';
import firebaseService from '@/services/api/resources/GPT';

import { createTestingPinia } from '@pinia/testing';
import { useGpt } from '@/store/modules/gpt';
import { useWidgets } from '@/store/modules/widgets';

vi.mock('@/services/api/resources/GPT');

describe('HeaderGenerateInsightModal.vue', () => {
  let wrapper;

  const footer = () =>
    wrapper.findComponent('[data-testid="insight-modal-footer"]');
  const insightText = () => wrapper.findComponent(HeaderGenerateInsightText);

  const triggerGenerateInsight = async () => {
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    await flushPromises();
  };

  beforeEach(() => {
    const store = createTestingPinia({
      initialState: {
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
          getInsights: vi.fn(() => 'Sample Insight'),
          insights: [{ received: { value: 'Sample Insight' } }],
        },
        user: {
          email: 'test@example.com',
        },
      },
    });

    wrapper = mount(HeaderGenerateInsightModal, {
      global: {
        plugins: [store],
        stubs: {
          InsightModalFooter: true,
          UnnnicIcon: true,
          Transition: true,
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
    const gptStore = useGpt();
    const spyGetInsights = vi.spyOn(gptStore, 'getInsights');
    await triggerGenerateInsight();
    expect(spyGetInsights).toHaveBeenCalled();
  });

  it('handles typing complete event', async () => {
    await insightText().vm.$emit('typing-complete');
    expect(footer().props('isRenderFooterFeedback')).toBe(true);
  });

  it('handles positive feedback', async () => {
    await footer().vm.$emit('handle-positive-feedback');
    expect(footer().props('isBtnYesActive')).toBe(true);
    expect(footer().props('isBtnNoActive')).toBe(false);

    await footer().vm.$emit('handle-negative-feedback');
    await footer().vm.$emit('handle-positive-feedback');
    expect(footer().props('isBtnYesActive')).toBe(true);
    expect(footer().props('isBtnNoActive')).toBe(false);
  });

  it('handles negative feedback', async () => {
    await footer().vm.$emit('handle-negative-feedback');
    expect(footer().props('isBtnNoActive')).toBe(true);
    expect(footer().props('isBtnYesActive')).toBe(false);

    await footer().vm.$emit('handle-positive-feedback');
    await footer().vm.$emit('handle-negative-feedback');
    expect(footer().props('isBtnNoActive')).toBe(true);
    expect(footer().props('isBtnYesActive')).toBe(false);
  });

  it('submits review successfully', async () => {
    firebaseService.createReview.mockResolvedValue();
    await footer().vm.$emit('handle-positive-feedback');
    await footer().vm.$emit('update-feedback-text', 'Great insight!');
    await footer().vm.$emit('submit-review');
    await flushPromises();
    expect(firebaseService.createReview).toHaveBeenCalledWith({
      helpful: true,
      comment: 'Great insight!',
      user: 'test@example.com',
    });
    expect(footer().props('isFeedbackSent')).toBe(true);
  });

  it('handles dynamic param correctly', async () => {
    const widgetsStore = useWidgets();
    widgetsStore.currentDashboardWidgets = [
      {
        type: 'card',
        name: 'TestWidget',
        config: { data_type: 'sec' },
        data: { value: 120 },
      },
    ];
    const gptStore = useGpt();
    const spyGetInsights = vi.spyOn(gptStore, 'getInsights');
    await triggerGenerateInsight();
    expect(spyGetInsights).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('TestWidget 2m'),
      }),
    );
  });

  it('handles dynamic params data undefined correctly', async () => {
    const widgetsStore = useWidgets();
    widgetsStore.currentDashboardWidgets = [
      {
        type: 'card',
        name: 'TestWidget',
        config: { data_type: 'other' },
        data: { value: null },
      },
    ];
    const gptStore = useGpt();
    const spyGetInsights = vi.spyOn(gptStore, 'getInsights');
    await triggerGenerateInsight();
    expect(spyGetInsights).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('0 TestWidget'),
      }),
    );
  });

  it('generates insight correctly', async () => {
    const gptStore = useGpt();
    const spyGetInsights = vi.spyOn(gptStore, 'getInsights');
    await triggerGenerateInsight();
    expect(spyGetInsights).toHaveBeenCalled();
    expect(insightText().props('text')).toBe('Sample Insight');
  });

  it('handles generate insight error', async () => {
    const gptStore = useGpt();

    vi.spyOn(gptStore, 'getInsights').mockRejectedValue(new Error('API Error'));

    await triggerGenerateInsight();
    expect(insightText().props('text')).toBe(
      "Couldn't generate insights. Check your internet connection and try again later.",
    );
    await insightText().vm.$emit('typing-complete');
    expect(footer().props('isRenderFooterFeedback')).toBe(false);
  });

  it('cleans up observer on component unmount', async () => {
    await flushPromises();
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
    wrapper.unmount();
    expect(disconnectSpy).toHaveBeenCalled();
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

    expect(wrapper.find('.gradient-overlay').exists()).toBe(true);

    contentElement.element.scrollTop = 500;
    await contentElement.trigger('scroll');

    expect(wrapper.find('.gradient-overlay').exists()).toBe(false);
  });

  it('emits close when clicking outside with a mouse', async () => {
    const outsideClickEvent = new MouseEvent('click', { bubbles: true });

    Object.defineProperty(outsideClickEvent, 'pointerType', { value: 'mouse' });

    document.body.dispatchEvent(outsideClickEvent);

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should handle feedback text on @update-feedback-text from InsightModalFooter', async () => {
    firebaseService.createReview.mockResolvedValue();
    const text = 'test';
    await footer().vm.$emit('update-feedback-text', text);
    await footer().vm.$emit('submit-review');
    await flushPromises();
    expect(firebaseService.createReview).toHaveBeenCalledWith({
      helpful: false,
      comment: text,
      user: 'test@example.com',
    });
  });
});
