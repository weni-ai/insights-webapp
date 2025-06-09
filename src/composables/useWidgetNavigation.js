import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDashboards } from '@/store/modules/dashboards';

/**
 * Composable for handling widget navigation
 * Provides functionality to redirect to reports (internal/external)
 */
export function useWidgetNavigation() {
  const router = useRouter();
  const dashboardsStore = useDashboards();
  const { currentDashboard } = storeToRefs(dashboardsStore);

  const redirectToReport = (widget) => {
    if (!widget) {
      return;
    }

    const { uuid, report } = widget;
    if (!report) {
      return;
    }

    switch (report.type) {
      case 'internal':
        router.push({
          name: 'report',
          params: {
            dashboardUuid: currentDashboard.value.uuid,
            widgetUuid: uuid,
          },
          query: {
            ...router.currentRoute.value.query,
          },
        });
        break;

      case 'external':
        window.open(report.url, '_blank');
        break;

      default:
        break;
    }
  };

  return {
    redirectToReport,
  };
}
