import { UnnnicToastManager } from '@weni/unnnic-system';

import type { MetricGoalSocketViolatedContent } from '@/store/modules/humanSupport/metricGoalAlerts';
import { navigateToMetricGoalDetail } from '@/utils/navigateToMetricGoalDetail';
import i18n from '@/utils/plugins/i18n';

export function showMetricGoalToast(
  content: MetricGoalSocketViolatedContent,
): void {
  const t = (key: string, params?: Record<string, unknown>) =>
    i18n.global.t(key, params);

  UnnnicToastManager.attention(
    t('operational_alerts.toast.title'),
    t(`operational_alerts.toast.${content.metric}`, {
      count: content.violating_count,
    }),
    {
      button: {
        text: t('operational_alerts.toast.view_details'),
        action: () => navigateToMetricGoalDetail(content.metric),
      },
    },
  );
}
