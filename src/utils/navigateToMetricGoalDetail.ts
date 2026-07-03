import {
  ActiveDetailedTab,
  useHumanSupportMonitoring,
} from '@/store/modules/humanSupport/monitoring';
import type { MetricKey } from '@/services/api/resources/humanSupport/monitoring/metricGoals';

const METRIC_TO_TAB: Record<MetricKey, ActiveDetailedTab> = {
  waiting_time: 'in_awaiting',
  first_response_time: 'in_progress',
  conversation_duration: 'in_progress',
};

export function navigateToMetricGoalDetail(metric: MetricKey) {
  const { setActiveDetailedTab, setForceLoadDetailed } =
    useHumanSupportMonitoring();

  setActiveDetailedTab(METRIC_TO_TAB[metric]);
  setForceLoadDetailed(true);

  setTimeout(() => {
    const detailedMonitoringElement = document.querySelector(
      '[id="detailed-monitoring"]',
    );

    detailedMonitoringElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 100);
}
