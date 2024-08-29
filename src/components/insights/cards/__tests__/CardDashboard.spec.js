import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import CardDashboard from '../CardDashboard.vue';
import CardTitleError from '../CardTitleError.vue';
import IconLoading from '@/components/IconLoading.vue';

const emojis = {
  smile: { skins: [{ native: '😄' }] },
};

const createWraper = (props) => {
  return mount(CardDashboard, {
    props: { metric: '100', configurable: true, configured: true, ...props },
    global: {
      stubs: { CardTitleError: true, IconLoading: true },
      mocks: { emojis },
    },
  });
};

describe('CardDashboard', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = createWraper({});
  });

  it('should render the CardTitleError component when showMetricError is true', async () => {
    await wrapper.setProps({ metric: null });
    expect(wrapper.findComponent(CardTitleError).exists()).toBe(true);
  });

  it('should not render the CardTitleError component when showMetricError is false', async () => {
    expect(wrapper.findComponent(CardTitleError).exists()).toBe(false);
  });

  it('should render the loading icon when isLoading is true', async () => {
    await wrapper.setProps({ isLoading: true });
    expect(wrapper.findComponent(IconLoading).exists()).toBe(true);
  });

  it('should not render the loading icon when isLoading is false', async () => {
    await wrapper.setProps({ isLoading: false });
    expect(wrapper.findComponent(IconLoading).exists()).toBe(false);
  });

  it('should display the metric value correctly when configured is true', async () => {
    expect(
      wrapper.find('[data-testid="card-dashboard-metric-value"]').text(),
    ).toBe('100');
  });

  it('should display "0" as the metric value when configured is false', async () => {
    await wrapper.setProps({ configured: false });
    expect(
      wrapper.find('[data-testid="card-dashboard-metric-value"]').text(),
    ).toBe('0');
  });

  it('should render the configuration button when configurable or !configured is true', async () => {
    expect(
      wrapper.find('[data-testid="card-dashboard-button-config"]').exists(),
    ).toBe(true);
  });

  it('should emit "open-config" event when the configuration button is clicked', async () => {
    const configButton = wrapper.find(
      '[data-testid="card-dashboard-button-config"]',
    );

    await configButton.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
  });

  it('should not render the configuration button when both configurable and configured are false', async () => {
    await wrapper.setProps({ configurable: false });

    expect(
      wrapper.find('[data-testid="card-dashboard-button-config"]').exists(),
    ).toBe(false);
  });

  it('should display the description correctly when configured is true', async () => {
    await wrapper.setProps({
      description: 'Metric description',
    });

    expect(
      wrapper.find('[data-testid="card-dashboard-content-description"]').text(),
    ).toBe('Metric description');
  });

  it('should display the empty metric message when configured is false', async () => {
    await wrapper.setProps({
      description: 'Metric empty',
    });

    expect(
      wrapper.find('[data-testid="card-dashboard-content-description"]').text(),
    ).toBe('Metric empty');
  });

  it('should return an empty string when friendlyId is not provided', async () => {
    await wrapper.setProps({
      friendlyId: '',
    });
    expect(wrapper.vm.friendlyEmoji).toBe('');
  });

  it('should return an empty string when friendlyId is not found in the emojis data', async () => {
    await wrapper.setProps({
      friendlyId: 'nonexistent_id',
    });

    expect(wrapper.vm.friendlyEmoji).toBe('');
  });

  it('should return the correct emoji when friendlyId is valid and found in the emojis data', async () => {
    await wrapper.setProps({
      friendlyId: 'smile',
    });

    expect(wrapper.vm.friendlyEmoji).toBe('😄');
  });
});
