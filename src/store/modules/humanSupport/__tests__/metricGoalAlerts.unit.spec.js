import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useMetricGoalAlerts } from '../metricGoalAlerts';

const violatedContent = {
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
};

describe('useMetricGoalAlerts Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMetricGoalAlerts();
  });

  it('should map violated socket content to a live breach', () => {
    store.applyViolated(violatedContent);

    expect(store.liveBreaches.waiting_time).toEqual({
      thresholdSeconds: 60,
      thresholdValue: 1,
      unit: 'm',
      isBreached: true,
      breachedRoomsCount: 5,
    });
  });

  it('should update an existing live breach on update transition', () => {
    store.applyViolated(violatedContent);
    store.applyUpdate({
      ...violatedContent,
      transition: 'update',
      violating_count: 8,
    });

    expect(store.liveBreaches.waiting_time?.breachedRoomsCount).toBe(8);
  });

  it('should clear a live breach on resolved event', () => {
    store.applyViolated(violatedContent);
    store.applyResolved({
      project_uuid: 'project-1',
      metric: 'waiting_time',
      state: 'ok',
      detected_at: '2026-06-23T18:57:06+00:00',
    });

    expect(store.liveBreaches.waiting_time).toBeNull();
  });

  it('should derive hour units from threshold seconds', () => {
    store.applyViolated({
      ...violatedContent,
      metric: 'conversation_duration',
      threshold_seconds: 3600,
    });

    expect(store.liveBreaches.conversation_duration).toMatchObject({
      thresholdValue: 1,
      unit: 'h',
    });
  });

  it('should report whether a metric is already breaching', () => {
    expect(store.isMetricBreaching('waiting_time')).toBe(false);

    store.applyViolated(violatedContent);

    expect(store.isMetricBreaching('waiting_time')).toBe(true);
  });

  it('should hydrate live breaches from API goals', () => {
    store.hydrateFromApiGoals({
      average_time_is_waiting: {
        average: 120,
        max: 300,
        waiting_time_goal: {
          thresholdSeconds: 60,
          thresholdValue: 1,
          unit: 'm',
          isBreached: true,
          breachedRoomsCount: 7,
        },
      },
      average_time_first_response: {
        average: 45,
        max: 90,
        first_response_time_goal: {
          thresholdSeconds: 60,
          thresholdValue: 1,
          unit: 'm',
          isBreached: false,
          breachedRoomsCount: 0,
        },
      },
      average_time_chat: { average: 600, max: 1200 },
    });

    expect(store.isMetricBreaching('waiting_time')).toBe(true);
    expect(store.isMetricBreaching('first_response_time')).toBe(false);
    expect(store.liveBreaches.waiting_time?.breachedRoomsCount).toBe(7);
  });

  it('should reset all live breaches and connection state', () => {
    store.applyViolated(violatedContent);
    store.setConnectionState('connected');
    store.reset();

    expect(store.liveBreaches.waiting_time).toBeNull();
    expect(store.connectionState).toBe('disconnected');
  });
});
