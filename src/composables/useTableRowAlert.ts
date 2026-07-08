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
  metric: MetricKey;
  scheme: RowAlertScheme;
  text: string;
}

export function useTableRowAlert() {
  const { t } = useI18n();
  const metricGoalsStore = useMetricGoals();

  const buildRowAlert = (candidate: RowAlertCandidate): RowAlert => {
    const configuredGoal = metricGoalsStore.getGoalForMetric(candidate.metric);

    if (!configuredGoal) {
      return {
        metric: candidate.metric,
        scheme: candidate.scheme,
        text: t('operational_alerts.table_tooltip.generic'),
      };
    }

    const unit = t(
      `operational_alerts.unit_word${configuredGoal.thresholdValue === 1 ? '_singular' : 's'}.${configuredGoal.unit as TimeUnit}`,
    ).toLowerCase();

    return {
      metric: candidate.metric,
      scheme: candidate.scheme,
      text: t(`operational_alerts.table_tooltip.${candidate.metric}`, {
        value: configuredGoal.thresholdValue,
        unit,
      }),
    };
  };

  const getRowAlerts = (candidates: RowAlertCandidate[]): RowAlert[] => {
    return candidates
      .filter((candidate) => candidate.exceeded === true)
      .map(buildRowAlert);
  };

  const getRowAlert = (candidates: RowAlertCandidate[]): RowAlert | null => {
    return getRowAlerts(candidates)[0] ?? null;
  };

  return { getRowAlert, getRowAlerts };
}

export type { RowAlert, RowAlertScheme, RowAlertCandidate };
