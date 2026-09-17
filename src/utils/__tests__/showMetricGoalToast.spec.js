import { describe, it, expect, beforeEach, vi } from 'vitest';

const attention = vi.fn();
const navigateToMetricGoalDetail = vi.fn();

vi.mock('@weni/unnnic-system', () => ({
  UnnnicToastManager: {
    attention: (...args) => attention(...args),
  },
}));

vi.mock('@/utils/navigateToMetricGoalDetail', () => ({
  navigateToMetricGoalDetail: (...args) => navigateToMetricGoalDetail(...args),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
    },
  },
}));

describe('showMetricGoalToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows attention toast with translated content and view details action', async () => {
    const { showMetricGoalToast } = await import('../showMetricGoalToast');

    showMetricGoalToast({
      metric: 'waiting_time',
      violating_count: 3,
    });

    expect(attention).toHaveBeenCalledWith(
      'operational_alerts.toast.title',
      'operational_alerts.toast.waiting_time:{"count":3}',
      expect.objectContaining({
        button: expect.objectContaining({
          text: 'operational_alerts.toast.view_details',
          action: expect.any(Function),
        }),
      }),
    );

    attention.mock.calls[0][2].button.action();
    expect(navigateToMetricGoalDetail).toHaveBeenCalledWith('waiting_time');
  });
});
