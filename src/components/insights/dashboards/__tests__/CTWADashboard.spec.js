import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import CTWADashboard from '../CTWADashboard.vue';
import { useCTWA } from '@/store/modules/ctwa';

vi.mock('@/components/insights/ctwa/MetricCards.vue', () => ({
  default: { name: 'MetricCards', template: '<div data-testid="metric-cards" />' },
}));

vi.mock('@/components/insights/ctwa/SalesFunnel.vue', () => ({
  default: { name: 'SalesFunnel', template: '<div data-testid="sales-funnel" />' },
}));

vi.mock('@/components/insights/ctwa/PerformanceByCampaign.vue', () => ({
  default: {
    name: 'PerformanceByCampaign',
    template: '<div data-testid="performance-by-campaign" />',
  },
}));

vi.mock('@/components/insights/Layout/LazyWidget.vue', () => ({
  default: {
    name: 'LazyWidget',
    template: '<div data-testid="lazy-widget"><slot /></div>',
  },
}));

describe('CTWADashboard.vue', () => {
  const createWrapper = () =>
    mount(CTWADashboard, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the campaign performance table when no campaign is selected', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('[data-testid="performance-by-campaign"]').exists()).toBe(
      true,
    );
  });

  it('hides the campaign performance table when a campaign is selected', async () => {
    const wrapper = createWrapper();
    const store = useCTWA();

    store.selectedCampaign = 'campaign-uuid';
    await nextTick();

    expect(wrapper.find('[data-testid="performance-by-campaign"]').exists()).toBe(
      false,
    );
  });
});
