import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import HeaderGenerateInsightButton from '@/components/insights/Layout/HeaderGenerateInsights/HeaderGenerateInsightButton.vue';
import { createTestingPinia } from '@pinia/testing';

const createWrapper = (props = {}, storeState = {}) => {
  const store = createTestingPinia({
    initialState: {
      config: { token: 'default-token' },
      widgets: { isLoadingCurrentDashboardWidgets: false },
      ...storeState,
    },
  });

  return mount(HeaderGenerateInsightButton, {
    global: {
      plugins: [store],
      stubs: { HeaderGenerateInsightModal: true },
    },
    props,
  });
};

describe('HeaderGenerateInsightButton', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should render the button with the correct text from i18n', () => {
    expect(wrapper.text()).toContain('Generate insight');
  });

  it('should disable the button when isDisableBtn is true', async () => {
    wrapper = createWrapper(
      {},
      { widgets: { isLoadingCurrentDashboardWidgets: true } },
    );
    const button = wrapper.find('button');
    expect(button.element.disabled).toBe(true);
  });

  it('should enable the button when isDisableBtn is false', async () => {
    const button = wrapper.find('button');
    expect(button.element.disabled).toBe(false);
  });

  it('should open the modal when the button is clicked', async () => {
    const button = wrapper.find('button');
    await button.trigger('click');
    const modal = wrapper.findComponent({ name: 'HeaderGenerateInsightModal' });
    expect(modal.exists()).toBe(true);
    expect(modal.props('show')).toBe(true);
  });

  it('should close the modal when the "close" event is emitted', async () => {
    await wrapper.find('button').trigger('click');

    const modal = wrapper.findComponent({ name: 'HeaderGenerateInsightModal' });
    await modal.vm.$emit('close');

    expect(modal.props('show')).toBe(false);
  });

  it('should pass the correct prop "show" to the HeaderGenerateInsightModal', async () => {
    await wrapper.find('button').trigger('click');

    const modal = wrapper.findComponent({ name: 'HeaderGenerateInsightModal' });
    expect(modal.props('show')).toBe(true);
  });

  it('should render the image inside the button', () => {
    const img = wrapper.find('img');
    expect(img.attributes('src')).toContain('assets/images/shine.svg');
  });

  it('should render with different config store tokens', async () => {
    expect(wrapper.find('button').exists()).toBe(true);

    wrapper = createWrapper({}, { config: { token: 'new-token' } });
    expect(wrapper.find('button').exists()).toBe(true);
  });
});
