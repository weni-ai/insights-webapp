import { useI18n } from 'vue-i18n';

import type {
  MetricKey,
  TimeUnit,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import { useMetricGoals } from '@/store/modules/humanSupport/metricGoals';

type RowAlertScheme = 'red' | 'orange' | 'yellow';

interface RowAlertCandidate {
  metric: MetricKey;
  scheme: RowAlertScheme;
  exceeded?: boolean;
}

interface RowAlert {
  scheme: RowAlertScheme;
  text: string;
}

export function useTableRowAlert() {
  const { t } = useI18n();
  const metricGoalsStore = useMetricGoals();

  const getRowAlert = (candidates: RowAlertCandidate[]): RowAlert | null => {
    const breached = candidates.find(
      (candidate) => candidate.exceeded === true,
    );

    if (!breached) return null;

    const configuredGoal = metricGoalsStore.getGoalForMetric(breached.metric);

    if (!configuredGoal) {
      return {
        scheme: breached.scheme,
        text: t('operational_alerts.table_tooltip.generic'),
      };
    }

    const unit = t(
      `operational_alerts.unit_word${configuredGoal.thresholdValue === 1 ? '_singular' : 's'}.${configuredGoal.unit as TimeUnit}`,
    ).toLowerCase();

    return {
      scheme: breached.scheme,
      text: t(`operational_alerts.table_tooltip.${breached.metric}`, {
        value: configuredGoal.thresholdValue,
        unit,
      }),
    };
  };

  return { getRowAlert };
}

export type { RowAlert, RowAlertScheme, RowAlertCandidate };
