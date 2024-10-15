import { describe, it, expect, vi } from 'vitest';
import { isFilteringDates } from '@/utils/filter';

describe('isFilteringDates', () => {
  it('returns true when date filters are applied', () => {
    const appliedFilters = { date_range: '2023-01-01' };
    const currentDashboardFilters = [
      { name: 'date_range', type: 'date_range' },
    ];
    expect(isFilteringDates({ appliedFilters, currentDashboardFilters })).toBe(
      true,
    );
  });

  it('returns false when no date filters are applied', () => {
    const appliedFilters = { other_filter: 'value' };
    const currentDashboardFilters = [
      { name: 'date_range', type: 'date_range' },
    ];
    expect(isFilteringDates({ appliedFilters, currentDashboardFilters })).toBe(
      false,
    );
  });

  it('handles empty filters', () => {
    expect(
      isFilteringDates({ appliedFilters: {}, currentDashboardFilters: [] }),
    ).toBe(false);
  });
});
