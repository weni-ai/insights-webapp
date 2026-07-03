import { useConfig } from '@/store/modules/config';
import { useMetricGoalAlerts } from '@/store/modules/humanSupport/metricGoalAlerts';
import type { MetricGoalSocketViolatedContent } from '@/store/modules/humanSupport/metricGoalAlerts';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import env from '@/utils/env';
import { showMetricGoalToast } from '@/utils/showMetricGoalToast';

const MAX_RECONNECT_DELAY_MS = 30_000;
const REFRESH_PULSE_MS = 500;

export function useMetricGoalsSocket() {
  const configStore = useConfig();
  const metricGoalAlertsStore = useMetricGoalAlerts();
  const humanSupportMonitoring = useHumanSupportMonitoring();

  let socket: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let intentionalDisconnect = false;

  const buildUrl = (): string | null => {
    const baseUrl = env('CHATS_WEBSOCKET_URL');
    const { token, project } = configStore;

    if (!baseUrl || !token || !project?.uuid) return null;

    return `${baseUrl}/ws/dashboard/metric-goals?project=${project.uuid}&Token=${token}`;
  };

  const triggerSilentRefresh = () => {
    humanSupportMonitoring.setRefreshDataMonitoring(true, true);

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    refreshTimeout = setTimeout(() => {
      humanSupportMonitoring.setRefreshDataMonitoring(false, true);
      refreshTimeout = null;
    }, REFRESH_PULSE_MS);
  };

  const handleViolatingContent = (content: MetricGoalSocketViolatedContent) => {
    const wasAlreadyBreaching = metricGoalAlertsStore.isMetricBreaching(
      content.metric,
    );

    metricGoalAlertsStore.applyUpdate(content);

    if (!wasAlreadyBreaching) {
      showMetricGoalToast(content);
      triggerSilentRefresh();
    }
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data as string);
      const { type, content } = payload;

      if (type === 'metric_goal.violated') {
        if (content.transition === 'new' || content.transition === 'update') {
          handleViolatingContent(content);
        }

        return;
      }

      if (type === 'metric_goal.update') {
        handleViolatingContent(content);
        return;
      }

      if (type === 'metric_goal.resolved') {
        metricGoalAlertsStore.applyResolved(content);
        triggerSilentRefresh();
      }
    } catch (error) {
      console.error('Error parsing metric goals socket message:', error);
    }
  };

  const scheduleReconnect = () => {
    if (intentionalDisconnect) return;

    const delay = Math.min(
      1000 * 2 ** reconnectAttempts,
      MAX_RECONNECT_DELAY_MS,
    );

    reconnectAttempts += 1;

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connect();
    }, delay);
  };

  const connect = () => {
    disconnect(false);

    const url = buildUrl();
    if (!url) return;

    intentionalDisconnect = false;
    metricGoalAlertsStore.setConnectionState('connecting');

    socket = new WebSocket(url);

    socket.onopen = () => {
      reconnectAttempts = 0;
      metricGoalAlertsStore.setConnectionState('connected');
    };

    socket.onmessage = handleMessage;

    socket.onclose = () => {
      socket = null;
      metricGoalAlertsStore.setConnectionState('disconnected');

      if (!intentionalDisconnect) {
        scheduleReconnect();
      }
    };

    socket.onerror = () => {
      metricGoalAlertsStore.setConnectionState('error');
    };
  };

  const disconnect = (resetStore = true) => {
    intentionalDisconnect = true;

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }

    if (socket) {
      socket.onclose = null;
      socket.close();
      socket = null;
    }

    reconnectAttempts = 0;
    metricGoalAlertsStore.setConnectionState('disconnected');

    if (resetStore) {
      metricGoalAlertsStore.reset();
    }
  };

  return {
    connect,
    disconnect,
  };
}
