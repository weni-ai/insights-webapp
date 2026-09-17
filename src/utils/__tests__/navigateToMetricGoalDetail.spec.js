import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const setActiveDetailedTab = vi.fn();
const setForceLoadDetailed = vi.fn();

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => ({
    setActiveDetailedTab,
    setForceLoadDetailed,
  }),
}));

describe('navigateToMetricGoalDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['waiting_time', 'in_awaiting'],
    ['first_response_time', 'in_progress'],
    ['conversation_duration', 'in_progress'],
  ])(
    'maps %s to tab %s and scrolls to detailed monitoring',
    async (metric, tab) => {
      const scrollIntoView = vi.fn();
      const element = { scrollIntoView };
      vi.spyOn(document, 'querySelector').mockReturnValue(element);

      const { navigateToMetricGoalDetail } = await import(
        '../navigateToMetricGoalDetail'
      );

      navigateToMetricGoalDetail(metric);

      expect(setActiveDetailedTab).toHaveBeenCalledWith(tab);
      expect(setForceLoadDetailed).toHaveBeenCalledWith(true);

      vi.advanceTimersByTime(100);

      expect(document.querySelector).toHaveBeenCalledWith(
        '[id="detailed-monitoring"]',
      );
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    },
  );

  it('does not throw when detailed monitoring element is missing', async () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    const { navigateToMetricGoalDetail } = await import(
      '../navigateToMetricGoalDetail'
    );

    expect(() => {
      navigateToMetricGoalDetail('waiting_time');
      vi.advanceTimersByTime(100);
    }).not.toThrow();
  });
});
