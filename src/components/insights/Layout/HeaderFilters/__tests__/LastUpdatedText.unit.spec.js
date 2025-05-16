import { mount, config } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { expect, vi, describe, it, beforeEach } from 'vitest';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import LastUpdatedText from '../LastUpdatedText.vue';
import * as timeUtils from '@/utils/time';
import { useDashboards } from '@/store/modules/dashboards';

vi.mock('@/utils/time', () => ({
  formatTimeStringWithDayNight: vi.fn().mockReturnValue('3:45 PM (PM)'),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'insights_header.last_updated_at': 'Last updated at:',
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

const globalMocks = {
  $t: (key) =>
    key === 'insights_header.last_updated_at' ? 'Last updated at:' : key,
};

config.global.plugins = [i18n];
config.global.mocks = globalMocks;

describe('LastUpdatedText.vue', () => {
  let store;
  let wrapper;
  const testTimestamp = new Date('2023-07-15T14:30:00');

  const createWrapper = (initialTimestamp = testTimestamp) => {
    store = createTestingPinia({
      initialState: {
        dashboards: {
          last_updated_request: initialTimestamp,
          lastUpdatedAt: (store) => store.last_updated_request,
          updateLastUpdatedRequest: vi.fn(),
        },
      },
    });

    return mount(LastUpdatedText, {
      global: {
        plugins: [store, UnnnicSystem, i18n],
        mocks: globalMocks,
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component correctly', () => {
    wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
    expect(
      wrapper.find('.insights-layout-header-filters_last-updated-at').exists(),
    ).toBe(true);
  });

  it('displays the formatted timestamp from the store', () => {
    wrapper = createWrapper();
    const textElement = wrapper.find(
      '.insights-layout-header-filters_last-updated-at_text',
    );
    expect(textElement.text()).toContain('Last updated at:');
    expect(textElement.text()).toContain('3:45 PM (PM)');
    expect(timeUtils.formatTimeStringWithDayNight).toHaveBeenCalledWith(
      expect.any(Date),
      true,
    );
  });

  it('handles null timestamp correctly', async () => {
    vi.clearAllMocks();
    wrapper = createWrapper(null);

    await nextTick();

    const textElement = wrapper.find(
      '.insights-layout-header-filters_last-updated-at_text',
    );
    expect(textElement.text()).toContain('--:--');
    expect(timeUtils.formatTimeStringWithDayNight).not.toHaveBeenCalled();
  });

  it('reacts to changes in the timestamp', async () => {
    wrapper = createWrapper();
    const dashboardsStore = useDashboards();
    const newTimestamp = new Date('2023-07-15T18:45:00');

    expect(timeUtils.formatTimeStringWithDayNight).toHaveBeenCalledTimes(1);

    dashboardsStore.last_updated_request = newTimestamp;
    await nextTick();

    expect(timeUtils.formatTimeStringWithDayNight).toHaveBeenCalledTimes(2);
    expect(timeUtils.formatTimeStringWithDayNight).toHaveBeenLastCalledWith(
      newTimestamp,
      true,
    );
  });
});
