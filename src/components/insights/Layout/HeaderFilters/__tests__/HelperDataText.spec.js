import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { format, subDays } from 'date-fns';
import HelperDataText from '../HelperDataText.vue';

let mockStore = { appliedFilters: {}, lastUpdatedAt: null };

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => mockStore,
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      data_period: {
        label: 'Data period',
        until: 'until',
        range: '{start} – {end}',
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const createWrapper = (filters = {}, lastUpdatedAt = null) => {
  mockStore.appliedFilters = filters;
  mockStore.lastUpdatedAt = lastUpdatedAt;

  return mount(HelperDataText);
};

describe('HelperDataText.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with correct data-testid', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="helper-data-text"]').exists()).toBe(
        true,
      );
    });

    it('should render empty text when no dates provided', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('[data-testid="helper-data-text"]').text()).toBe('');
    });

    it('should render empty text when dates missing', () => {
      const cases = [
        { ended_at: { __lte: '2024-01-31' } },
        { ended_at: { __gte: '2024-01-01' } },
      ];

      cases.forEach((filters) => {
        const wrapper = createWrapper(filters);
        expect(wrapper.find('[data-testid="helper-data-text"]').text()).toBe(
          '',
        );
      });
    });
  });

  describe('Yesterday Only Format', () => {
    it('should format as "until HH:MM" when only yesterday with lastUpdatedAt', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-07T10:00:00'));

      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const wrapper = createWrapper(
        { ended_at: { __gte: yesterday, __lte: yesterday } },
        new Date('2024-11-07T15:30:00'),
      );

      const text = wrapper.find('[data-testid="helper-data-text"]').text();
      expect(text).toContain('Data period: until 15:30');
      expect(text).toContain('06/11/2024');

      vi.useRealTimers();
    });

    it('should use range format when only yesterday without lastUpdatedAt', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-07T10:00:00'));

      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const wrapper = createWrapper(
        { ended_at: { __gte: yesterday, __lte: yesterday } },
        null,
      );

      const text = wrapper.find('[data-testid="helper-data-text"]').text();
      expect(text).toContain('Data period:');
      expect(text).toContain('23:59');

      vi.useRealTimers();
    });
  });

  describe('Date Range Format', () => {
    it('should format range with fixed times for non-yesterday dates', () => {
      const wrapper = createWrapper(
        { ended_at: { __gte: '2024-10-01', __lte: '2024-10-31' } },
        new Date('2024-11-06T15:00:00'),
      );

      const text = wrapper.find('[data-testid="helper-data-text"]').text();
      expect(text).toContain('Data period:');
      expect(text).toContain('00:00 (01/10/2024)');
      expect(text).toContain('23:59 (31/10/2024)');
    });

    it('should use lastUpdatedAt time when end date is yesterday', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-07T10:00:00'));

      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const wrapper = createWrapper(
        { ended_at: { __gte: '2024-10-01', __lte: yesterday } },
        new Date('2024-11-07T15:00:00'),
      );

      const text = wrapper.find('[data-testid="helper-data-text"]').text();
      expect(text).toContain('Data period:');
      expect(text).toContain('00:00 (01/10/2024)');
      expect(text).toContain('15:00');
      expect(text).not.toContain('23:59');

      vi.useRealTimers();
    });

    it('should format range correctly for single day period', () => {
      const wrapper = createWrapper(
        { ended_at: { __gte: '2024-10-15', __lte: '2024-10-15' } },
        new Date('2024-11-06T15:00:00'),
      );

      const text = wrapper.find('[data-testid="helper-data-text"]').text();
      expect(text).toContain('00:00 (15/10/2024)');
      expect(text).toContain('23:59 (15/10/2024)');
    });
  });

  describe('Computed Property', () => {
    it('should compute helper text based on store data', () => {
      const wrapper = createWrapper(
        { ended_at: { __gte: '2024-01-01', __lte: '2024-01-31' } },
        new Date('2024-11-06T15:00:00'),
      );

      expect(wrapper.text()).toContain('01/01/2024');
      expect(wrapper.text()).toContain('31/01/2024');
      expect(wrapper.text()).toContain('Data period:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null appliedFilters', () => {
      const wrapper = createWrapper(null);
      expect(wrapper.find('[data-testid="helper-data-text"]').text()).toBe('');
    });

    it('should handle undefined ended_at', () => {
      const wrapper = createWrapper({ other_field: 'value' });
      expect(wrapper.find('[data-testid="helper-data-text"]').text()).toBe('');
    });

    it('should handle dates at year boundaries', () => {
      const wrapper = createWrapper(
        { ended_at: { __gte: '2023-12-31', __lte: '2024-01-01' } },
        new Date('2024-11-06T23:59:59'),
      );

      const text = wrapper.find('[data-testid="helper-data-text"]').text();
      expect(text).toContain('31/12/2023');
      expect(text).toContain('01/01/2024');
    });
  });

  describe('Date Formatting', () => {
    const testCases = [
      { date: '2024-01-05', expected: '05/01/2024' },
      { date: '2024-12-25', expected: '25/12/2024' },
      { date: '2024-06-15', expected: '15/06/2024' },
    ];

    testCases.forEach(({ date, expected }) => {
      it(`should format ${date} as ${expected}`, () => {
        const wrapper = createWrapper(
          { ended_at: { __gte: date, __lte: date } },
          new Date('2024-11-06T15:00:00'),
        );

        expect(wrapper.text()).toContain(expected);
      });
    });
  });

  describe('Translation Integration', () => {
    it('should use i18n for label and until', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-07T10:00:00'));

      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const wrapper = createWrapper(
        { ended_at: { __gte: yesterday, __lte: yesterday } },
        new Date('2024-11-07T15:00:00'),
      );

      const text = wrapper.text();
      expect(text).toContain('Data period:');
      expect(text).toContain('until');

      vi.useRealTimers();
    });

    it('should use i18n for range template', () => {
      const wrapper = createWrapper(
        { ended_at: { __gte: '2024-10-01', __lte: '2024-10-31' } },
        new Date('2024-11-06T15:00:00'),
      );

      expect(wrapper.text()).toContain('–');
    });
  });
});
