import { useI18n } from 'vue-i18n';

import type {
  MetricGoalBreach,
  MetricKey,
  TimeUnit,
} from '@/services/api/resources/humanSupport/monitoring/metricGoals';

type RowAlertScheme = 'red' | 'orange' | 'yellow';

interface RowAlertCandidate {
  metric: MetricKey;
  scheme: RowAlertScheme;
  goal?: MetricGoalBreach;
}

interface RowAlert {
  scheme: RowAlertScheme;
  text: string;
}

export function useTableRowAlert() {
  const { t } = useI18n();

  const getRowAlert = (candidates: RowAlertCandidate[]): RowAlert | null => {
    const breached = candidates.find(
      (candidate) => candidate.goal?.isBreached,
    );

    if (!breached?.goal) return null;

    const unit = t(
      `operational_alerts.unit_word_singular.${breached.goal.unit as TimeUnit}`,
    ).toLowerCase();

    return {
      scheme: breached.scheme,
      text: t(`operational_alerts.table_tooltip.${breached.metric}`, {
        value: breached.goal.thresholdValue,
        unit,
      }),
    };
  };

  return { getRowAlert };
}

export type { RowAlert, RowAlertScheme, RowAlertCandidate };
