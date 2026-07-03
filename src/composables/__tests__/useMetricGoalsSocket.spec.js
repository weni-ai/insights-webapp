import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useMetricGoalsSocket } from '../useMetricGoalsSocket';
import { useMetricGoalAlerts } from '@/store/modules/humanSupport/metricGoalAlerts';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useConfig } from '@/store/modules/config';

vi.mock('@/utils/env', () => ({
  default: vi.fn(() => 'wss://engine-chats.stg.cloud.weni.ai'),
}));

vi.mock('@/utils/showMetricGoalToast', () => ({
  showMetricGoalToast: vi.fn(),
}));

import { showMetricGoalToast } from '@/utils/showMetricGoalToast';

class MockWebSocket {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.onclose?.();
  }

  emitMessage(data) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  emitOpen() {
    this.onopen?.();
  }
}

describe('useMetricGoalsSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockWebSocket.instances = [];
    setActivePinia(createPinia());

    const configStore = useConfig();
    configStore.setToken('jwt-token');
    configStore.setProject({ uuid: 'project-1' });

    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should connect with project and token in the websocket url', () => {
    const { connect } = useMetricGoalsSocket();
    connect();

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toBe(
      'wss://engine-chats.stg.cloud.weni.ai/ws/dashboard/metric-goals?project=project-1&Token=jwt-token',
    );
  });

  it('should show toast and trigger silent refresh on violated new events', () => {
    vi.useFakeTimers();

    const { connect } = useMetricGoalsSocket();
    const alertsStore = useMetricGoalAlerts();
    const monitoringStore = useHumanSupportMonitoring();

    connect();
    MockWebSocket.instances[0].emitOpen();
    MockWebSocket.instances[0].emitMessage({
      type: 'metric_goal.violated',
      content: {
        project_uuid: 'project-1',
        metric: 'waiting_time',
        state: 'violating',
        transition: 'new',
        violating_count: 5,
        max_value_seconds: 300,
        threshold_seconds: 60,
        rooms_threshold_count: 2,
        rooms_threshold_percent: null,
        active_rooms_count: null,
        detected_at: '2026-06-23T18:55:36+00:00',
      },
    });

    expect(showMetricGoalToast).toHaveBeenCalledTimes(1);
    expect(alertsStore.liveBreaches.waiting_time?.breachedRoomsCount).toBe(5);
    expect(monitoringStore.refreshDataMonitoring).toBe(true);
    expect(monitoringStore.isSilentRefresh).toBe(true);

    vi.advanceTimersByTime(500);

    expect(monitoringStore.refreshDataMonitoring).toBe(false);
  });

  it('should update live breach and show toast when breach was not active', () => {
    const { connect } = useMetricGoalsSocket();
    const alertsStore = useMetricGoalAlerts();

    connect();
    MockWebSocket.instances[0].emitMessage({
      type: 'metric_goal.violated',
      content: {
        project_uuid: 'project-1',
        metric: 'first_response_time',
        state: 'violating',
        transition: 'update',
        violating_count: 3,
        max_value_seconds: 120,
        threshold_seconds: 60,
        rooms_threshold_count: 2,
        rooms_threshold_percent: null,
        active_rooms_count: null,
        detected_at: '2026-06-23T18:55:36+00:00',
      },
    });

    expect(showMetricGoalToast).toHaveBeenCalledTimes(1);
    expect(
      alertsStore.liveBreaches.first_response_time?.breachedRoomsCount,
    ).toBe(3);
  });

  it('should update live breach without toast when breach is already active', () => {
    const { connect } = useMetricGoalsSocket();
    const alertsStore = useMetricGoalAlerts();

    alertsStore.applyViolated({
      project_uuid: 'project-1',
      metric: 'first_response_time',
      state: 'violating',
      transition: 'new',
      violating_count: 2,
      max_value_seconds: 120,
      threshold_seconds: 60,
      rooms_threshold_count: 2,
      rooms_threshold_percent: null,
      active_rooms_count: null,
      detected_at: '2026-06-23T18:55:36+00:00',
    });

    connect();
    MockWebSocket.instances[0].emitMessage({
      type: 'metric_goal.violated',
      content: {
        project_uuid: 'project-1',
        metric: 'first_response_time',
        state: 'violating',
        transition: 'update',
        violating_count: 3,
        max_value_seconds: 120,
        threshold_seconds: 60,
        rooms_threshold_count: 2,
        rooms_threshold_percent: null,
        active_rooms_count: null,
        detected_at: '2026-06-23T18:55:36+00:00',
      },
    });

    expect(showMetricGoalToast).not.toHaveBeenCalled();
    expect(
      alertsStore.liveBreaches.first_response_time?.breachedRoomsCount,
    ).toBe(3);
  });

  it('should update live breach and show toast on first metric_goal.update event', () => {
    const { connect } = useMetricGoalsSocket();
    const alertsStore = useMetricGoalAlerts();
    const monitoringStore = useHumanSupportMonitoring();

    connect();
    MockWebSocket.instances[0].emitMessage({
      type: 'metric_goal.update',
      content: {
        project_uuid: '2a39ac19-ef4a-4cd2-932a-64936c22217e',
        metric: 'conversation_duration',
        state: 'violating',
        transition: 'update',
        violating_count: 12,
        max_value_seconds: 2958883,
        threshold_seconds: 60,
        rooms_threshold_count: 5,
        rooms_threshold_percent: null,
        active_rooms_count: null,
        detected_at: '2026-07-01T22:15:07.079947+00:00',
      },
    });

    expect(showMetricGoalToast).toHaveBeenCalledTimes(1);
    expect(
      alertsStore.liveBreaches.conversation_duration?.breachedRoomsCount,
    ).toBe(12);
    expect(monitoringStore.refreshDataMonitoring).toBe(true);
  });

  it('should update live breach without toast on recurring metric_goal.update events', () => {
    const { connect } = useMetricGoalsSocket();
    const alertsStore = useMetricGoalAlerts();

    alertsStore.applyViolated({
      project_uuid: '2a39ac19-ef4a-4cd2-932a-64936c22217e',
      metric: 'conversation_duration',
      state: 'violating',
      transition: 'new',
      violating_count: 10,
      max_value_seconds: 2958883,
      threshold_seconds: 60,
      rooms_threshold_count: 5,
      rooms_threshold_percent: null,
      active_rooms_count: null,
      detected_at: '2026-07-01T22:15:07.079947+00:00',
    });

    connect();
    MockWebSocket.instances[0].emitMessage({
      type: 'metric_goal.update',
      content: {
        project_uuid: '2a39ac19-ef4a-4cd2-932a-64936c22217e',
        metric: 'conversation_duration',
        state: 'violating',
        transition: 'update',
        violating_count: 12,
        max_value_seconds: 2958883,
        threshold_seconds: 60,
        rooms_threshold_count: 5,
        rooms_threshold_percent: null,
        active_rooms_count: null,
        detected_at: '2026-07-01T22:15:07.079947+00:00',
      },
    });

    expect(showMetricGoalToast).not.toHaveBeenCalled();
    expect(
      alertsStore.liveBreaches.conversation_duration?.breachedRoomsCount,
    ).toBe(12);
  });

  it('should clear live breach on resolved events', () => {
    const { connect } = useMetricGoalsSocket();
    const alertsStore = useMetricGoalAlerts();

    alertsStore.applyViolated({
      project_uuid: 'project-1',
      metric: 'waiting_time',
      state: 'violating',
      transition: 'new',
      violating_count: 5,
      max_value_seconds: 300,
      threshold_seconds: 60,
      rooms_threshold_count: 2,
      rooms_threshold_percent: null,
      active_rooms_count: null,
      detected_at: '2026-06-23T18:55:36+00:00',
    });

    connect();
    MockWebSocket.instances[0].emitMessage({
      type: 'metric_goal.resolved',
      content: {
        project_uuid: 'project-1',
        metric: 'waiting_time',
        state: 'ok',
        detected_at: '2026-06-23T18:57:06+00:00',
      },
    });

    expect(alertsStore.liveBreaches.waiting_time).toBeNull();
  });
});
