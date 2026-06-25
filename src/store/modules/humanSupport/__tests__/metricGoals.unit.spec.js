import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useMetricGoals } from '../metricGoals';
import MetricGoalsService from '@/services/api/resources/humanSupport/monitoring/metricGoals';
import { useConfig } from '@/store/modules/config';
import { moduleStorage } from '@/utils/storage';

vi.mock('@/services/api/resources/humanSupport/monitoring/metricGoals', () => ({
  default: {
    getMetricGoals: vi.fn(),
    saveMetricGoal: vi.fn(),
    deleteMetricGoal: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

const waitingGoal = {
  metric: 'waiting_time',
  thresholdSeconds: 300,
  thresholdValue: 5,
  unit: 'm',
  isActive: true,
  emailEnabled: false,
  recipients: [],
  recipientDetails: [],
  roomsThresholdCount: 0,
};

describe('useMetricGoals Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    useConfig.mockReturnValue({ project: { uuid: 'project-1' } });
    store = useMetricGoals();
  });

  describe('loadGoals', () => {
    it('should load goals into a map keyed by metric', async () => {
      MetricGoalsService.getMetricGoals.mockResolvedValue({
        goals: [waitingGoal],
      });

      await store.loadGoals();

      expect(store.goals.waiting_time).toEqual(waitingGoal);
      expect(store.hasLoadedGoals).toBe(true);
      expect(store.hasConfiguredGoals).toBe(true);
    });

    it('should throw when loading goals fails', async () => {
      MetricGoalsService.getMetricGoals.mockRejectedValue(new Error('fail'));

      await expect(store.loadGoals()).rejects.toThrow('fail');
      expect(store.goals).toEqual({});
      expect(store.hasLoadedGoals).toBe(true);
    });
  });

  describe('saveGoals', () => {
    const buildFormState = (overrides = {}) => ({
      waiting_time: {
        enabled: false,
        threshold: null,
        unit: 'm',
        recipients: [],
        roomsThresholdCount: 5,
      },
      first_response_time: {
        enabled: false,
        threshold: null,
        unit: 'm',
        recipients: [],
        roomsThresholdCount: 5,
      },
      conversation_duration: {
        enabled: false,
        threshold: null,
        unit: 'm',
        recipients: [],
        roomsThresholdCount: 5,
      },
      ...overrides,
    });

    beforeEach(() => {
      MetricGoalsService.getMetricGoals.mockResolvedValue({ goals: [] });
    });

    it('should POST enabled metrics with threshold and unit', async () => {
      MetricGoalsService.saveMetricGoal.mockResolvedValue({});

      await store.saveGoals(
        buildFormState({
          waiting_time: {
            enabled: true,
            threshold: 5,
            unit: 'm',
            recipients: [],
            roomsThresholdCount: 5,
          },
        }),
      );

      expect(MetricGoalsService.saveMetricGoal).toHaveBeenCalledWith(
        'waiting_time',
        {
          threshold: 5,
          unit: 'm',
          isActive: true,
          emailEnabled: false,
          recipients: [],
          roomsThresholdCount: 0,
        },
      );
    });

    it('should include recipients and rooms_threshold_count when email enabled', async () => {
      MetricGoalsService.saveMetricGoal.mockResolvedValue({});

      await store.saveGoals(
        buildFormState({
          first_response_time: {
            enabled: true,
            threshold: 2,
            unit: 'h',
            recipients: ['perm-1', 'perm-2'],
            roomsThresholdCount: 3,
          },
        }),
      );

      expect(MetricGoalsService.saveMetricGoal).toHaveBeenCalledWith(
        'first_response_time',
        {
          threshold: 2,
          unit: 'h',
          isActive: true,
          emailEnabled: true,
          recipients: ['perm-1', 'perm-2'],
          roomsThresholdCount: 3,
        },
      );
    });

    it('should preserve rooms_threshold_count of 0 when email enabled', async () => {
      MetricGoalsService.saveMetricGoal.mockResolvedValue({});

      await store.saveGoals(
        buildFormState({
          first_response_time: {
            enabled: true,
            threshold: 2,
            unit: 'h',
            recipients: ['perm-1'],
            roomsThresholdCount: 0,
          },
        }),
      );

      expect(MetricGoalsService.saveMetricGoal).toHaveBeenCalledWith(
        'first_response_time',
        expect.objectContaining({
          emailEnabled: true,
          roomsThresholdCount: 0,
        }),
      );
    });

    it('should DELETE metrics that were disabled but previously configured', async () => {
      MetricGoalsService.getMetricGoals.mockResolvedValue({
        goals: [waitingGoal],
      });
      await store.loadGoals();

      MetricGoalsService.deleteMetricGoal.mockResolvedValue(undefined);
      MetricGoalsService.getMetricGoals.mockResolvedValue({ goals: [] });

      await store.saveGoals(buildFormState());

      expect(MetricGoalsService.deleteMetricGoal).toHaveBeenCalledWith(
        'waiting_time',
      );
    });

    it('should throw when reload fails after save', async () => {
      MetricGoalsService.saveMetricGoal.mockResolvedValue({});
      MetricGoalsService.getMetricGoals.mockRejectedValue(new Error('reload fail'));

      await expect(
        store.saveGoals(
          buildFormState({
            waiting_time: {
              enabled: true,
              threshold: 5,
              unit: 'm',
              recipients: [],
              roomsThresholdCount: 5,
            },
          }),
        ),
      ).rejects.toThrow('reload fail');
    });

    it('should not call save or delete for untouched disabled metrics', async () => {
      await store.saveGoals(buildFormState());
      expect(MetricGoalsService.saveMetricGoal).not.toHaveBeenCalled();
      expect(MetricGoalsService.deleteMetricGoal).not.toHaveBeenCalled();
    });
  });

  describe('popover persistence', () => {
    it('should persist hasSeenPopover scoped to the project', () => {
      store.setHasSeenPopover(true);
      expect(store.hasSeenPopover).toBe(true);
      expect(
        moduleStorage.getItem('operational_alerts_seen_popover_project-1'),
      ).toBe(true);
    });

    it('should persist hasOpenedDrawer scoped to the project', () => {
      store.setHasOpenedDrawer(true);
      expect(store.hasOpenedDrawer).toBe(true);
      expect(
        moduleStorage.getItem('operational_alerts_opened_drawer_project-1'),
      ).toBe(true);
    });
  });
});
