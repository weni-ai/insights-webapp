import type { TimeUnit } from '@/services/api/resources/humanSupport/monitoring/metricGoals';

export function deriveThresholdFromSeconds(thresholdSeconds: number): {
  thresholdValue: number;
  unit: TimeUnit;
} {
  if (thresholdSeconds % 3600 === 0 && thresholdSeconds >= 3600) {
    return { thresholdValue: thresholdSeconds / 3600, unit: 'h' };
  }

  if (thresholdSeconds % 60 === 0 && thresholdSeconds >= 60) {
    return { thresholdValue: thresholdSeconds / 60, unit: 'm' };
  }

  return { thresholdValue: thresholdSeconds, unit: 's' };
}
