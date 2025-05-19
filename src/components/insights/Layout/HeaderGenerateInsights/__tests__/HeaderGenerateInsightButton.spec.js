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
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('insights_header.generate_insight.title'),
    );
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
    expect(wrapper.vm.isGenerateInsightModalOpen).toBe(true);
    expect(
      wrapper.findComponent({ name: 'HeaderGenerateInsightModal' }).exists(),
    ).toBe(true);
  });

  it('should close the modal when the "close" event is emitted', async () => {
    wrapper.vm.isGenerateInsightModalOpen = true;
    await wrapper.vm.$nextTick();

    const modal = wrapper.findComponent({ name: 'HeaderGenerateInsightModal' });
    await modal.vm.$emit('close');

    expect(wrapper.vm.isGenerateInsightModalOpen).toBe(false);
  });

  it('should pass the correct prop "show" to the HeaderGenerateInsightModal', async () => {
    wrapper.vm.isGenerateInsightModalOpen = true;
    await wrapper.vm.$nextTick();

    const modal = wrapper.findComponent({ name: 'HeaderGenerateInsightModal' });
    expect(modal.props('show')).toBe(true);
  });

  it('should render the image inside the button', () => {
    const img = wrapper.find('img');
    expect(img.attributes('src')).toBe('/src/assets/images/shine.svg');
  });

  it('should compute the correct token from Vuex store', async () => {
    expect(wrapper.vm.token).toBe('default-token');

    wrapper = createWrapper({}, { config: { token: 'new-token' } });
    expect(wrapper.vm.token).toBe('new-token');
  });
});
