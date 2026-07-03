import chatsHttp from '@/services/api/chatsHttp';
import { useConfig } from '@/store/modules/config';

type MetricKey =
  | 'waiting_time'
  | 'first_response_time'
  | 'conversation_duration';

type TimeUnit = 's' | 'm' | 'h';

interface MetricGoalBreachApi {
  threshold_seconds: number;
  threshold_value: number;
  unit: TimeUnit;
  is_breached: boolean;
  breached_rooms_count: number;
}

interface MetricGoalBreach {
  thresholdSeconds: number;
  thresholdValue: number;
  unit: TimeUnit;
  isBreached: boolean;
  breachedRoomsCount: number;
}

interface GoalsMetricEntryApi {
  exceeded: boolean;
}

interface GoalsMetricsApi {
  awaiting_time?: GoalsMetricEntryApi;
  first_response_time?: GoalsMetricEntryApi;
  duration?: GoalsMetricEntryApi;
}

interface GoalsMetricEntry {
  exceeded: boolean;
}

interface GoalsMetrics {
  awaiting_time?: GoalsMetricEntry;
  first_response_time?: GoalsMetricEntry;
  duration?: GoalsMetricEntry;
}

interface MetricGoalRecipientApi {
  uuid: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  uuid_project_permission?: string;
}

interface MetricGoalRecipientApiPayload {
  uuid_project_permission: string;
}

interface MetricGoalApi {
  metric: MetricKey;
  threshold_seconds?: number;
  threshold_value?: number;
  threshold?: number;
  unit: TimeUnit;
  is_active: boolean;
  email_enabled: boolean;
  recipients:
    | MetricGoalRecipientApi[]
    | MetricGoalRecipientApiPayload[]
    | string[];
  rooms_threshold_count: number;
  rooms_threshold_percent?: number | null;
}

interface MetricGoalRecipientDetail {
  uuid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface MetricGoal {
  metric: MetricKey;
  thresholdSeconds: number;
  thresholdValue: number;
  unit: TimeUnit;
  isActive: boolean;
  emailEnabled: boolean;
  recipients: string[];
  recipientDetails: MetricGoalRecipientDetail[];
  roomsThresholdCount: number;
}

interface MetricGoalsResponse {
  goals: MetricGoal[];
}

interface MetricGoalSaveParams {
  threshold: number;
  unit: TimeUnit;
  isActive: boolean;
  emailEnabled: boolean;
  roomsThresholdCount: number;
  recipients: string[];
}

interface MetricGoalSavePayload {
  threshold: number;
  unit: TimeUnit;
  is_active: boolean;
  email_enabled: boolean;
  rooms_threshold_count: number;
  recipients: MetricGoalRecipientApiPayload[];
}

const normalizeMetricGoalBreach = (
  breach: MetricGoalBreachApi,
): MetricGoalBreach => ({
  thresholdSeconds: breach.threshold_seconds,
  thresholdValue: breach.threshold_value,
  unit: breach.unit,
  isBreached: breach.is_breached,
  breachedRoomsCount: breach.breached_rooms_count,
});

const normalizeGoalsMetrics = (
  goalsMetrics?: GoalsMetricsApi,
): GoalsMetrics | undefined => {
  if (!goalsMetrics) return undefined;

  return {
    awaiting_time: goalsMetrics.awaiting_time
      ? { exceeded: goalsMetrics.awaiting_time.exceeded }
      : undefined,
    first_response_time: goalsMetrics.first_response_time
      ? { exceeded: goalsMetrics.first_response_time.exceeded }
      : undefined,
    duration: goalsMetrics.duration
      ? { exceeded: goalsMetrics.duration.exceeded }
      : undefined,
  };
};

const UNIT_SECONDS: Record<TimeUnit, number> = {
  s: 1,
  m: 60,
  h: 3600,
};

const thresholdToSeconds = (threshold: number, unit: TimeUnit): number =>
  Math.round(threshold * UNIT_SECONDS[unit]);

const formatRecipientLabel = (recipient: MetricGoalRecipientDetail): string => {
  const name = [recipient.firstName, recipient.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || recipient.email || recipient.uuid;
};

const normalizeRecipientId = (
  recipient: MetricGoalRecipientApi | MetricGoalRecipientApiPayload | string,
): string => {
  if (typeof recipient === 'string') return recipient;

  if ('uuid' in recipient) {
    return recipient.uuid || recipient.uuid_project_permission || '';
  }

  return recipient.uuid_project_permission || '';
};

const normalizeRecipientDetail = (
  recipient: MetricGoalRecipientApi | MetricGoalRecipientApiPayload | string,
): MetricGoalRecipientDetail | null => {
  if (typeof recipient === 'string') {
    return { uuid: recipient };
  }

  const uuid = normalizeRecipientId(recipient);
  if (!uuid) return null;

  if (
    'first_name' in recipient ||
    'last_name' in recipient ||
    'email' in recipient
  ) {
    return {
      uuid,
      firstName: recipient.first_name,
      lastName: recipient.last_name,
      email: recipient.email,
    };
  }

  return { uuid };
};

const resolveThresholdSeconds = (goal: MetricGoalApi): number => {
  if (goal.threshold_seconds !== undefined && goal.threshold_seconds !== null) {
    return goal.threshold_seconds;
  }

  const thresholdValue = goal.threshold_value ?? goal.threshold ?? 0;
  return thresholdToSeconds(thresholdValue, goal.unit);
};

const resolveThresholdValue = (
  goal: MetricGoalApi,
  thresholdSeconds: number,
): number => {
  if (goal.threshold_value !== undefined && goal.threshold_value !== null) {
    return goal.threshold_value;
  }

  if (goal.threshold !== undefined && goal.threshold !== null) {
    return goal.threshold;
  }

  if (goal.unit === 'h' && thresholdSeconds % 3600 === 0) {
    return thresholdSeconds / 3600;
  }

  if (goal.unit === 'm' && thresholdSeconds % 60 === 0) {
    return thresholdSeconds / 60;
  }

  if (goal.unit === 's') {
    return thresholdSeconds;
  }

  return thresholdSeconds / UNIT_SECONDS[goal.unit];
};

const normalizeGoal = (goal: MetricGoalApi): MetricGoal => {
  const thresholdSeconds = resolveThresholdSeconds(goal);
  const recipientDetails = (goal.recipients || [])
    .map(normalizeRecipientDetail)
    .filter((recipient): recipient is MetricGoalRecipientDetail => !!recipient);

  return {
    metric: goal.metric,
    thresholdSeconds,
    thresholdValue: resolveThresholdValue(goal, thresholdSeconds),
    unit: goal.unit,
    isActive: goal.is_active,
    emailEnabled: goal.email_enabled,
    recipients: recipientDetails.map((recipient) => recipient.uuid),
    recipientDetails,
    roomsThresholdCount: goal.rooms_threshold_count,
  };
};

const toSavePayload = (
  params: MetricGoalSaveParams,
): MetricGoalSavePayload => ({
  threshold: params.threshold,
  unit: params.unit,
  is_active: params.isActive,
  email_enabled: params.emailEnabled,
  rooms_threshold_count: params.roomsThresholdCount,
  recipients: params.recipients.map((permissionUuid) => ({
    uuid_project_permission: permissionUuid,
  })),
});

const extractGoalsFromResponse = (
  response:
    | MetricGoalApi[]
    | { goals?: MetricGoalApi[]; results?: MetricGoalApi[] },
): MetricGoalApi[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.goals)) return response.goals;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const metricGoalsPath = (projectUuid: string, metric?: MetricKey): string => {
  const base = `project/${projectUuid}/metric-goals/`;
  return metric ? `${base}${metric}/` : base;
};

export default {
  async getMetricGoals(): Promise<MetricGoalsResponse> {
    const { project } = useConfig();

    const response = (await chatsHttp.get(metricGoalsPath(project.uuid))) as
      | MetricGoalApi[]
      | {
          goals?: MetricGoalApi[];
          results?: MetricGoalApi[];
        };

    const goals = extractGoalsFromResponse(response).map(normalizeGoal);

    return { goals };
  },

  async saveMetricGoal(
    metric: MetricKey,
    params: MetricGoalSaveParams,
  ): Promise<MetricGoal> {
    const { project } = useConfig();

    const response = (await chatsHttp.post(
      metricGoalsPath(project.uuid, metric),
      toSavePayload(params),
    )) as MetricGoalApi;

    return normalizeGoal(response);
  },

  async deleteMetricGoal(metric: MetricKey): Promise<void> {
    const { project } = useConfig();

    await chatsHttp.delete(metricGoalsPath(project.uuid, metric));
  },
};

export type {
  GoalsMetricEntry,
  GoalsMetricEntryApi,
  GoalsMetrics,
  GoalsMetricsApi,
  MetricGoal,
  MetricGoalApi,
  MetricGoalBreach,
  MetricGoalBreachApi,
  MetricGoalRecipientDetail,
  MetricGoalSaveParams,
  MetricKey,
  TimeUnit,
  MetricGoalsResponse,
};

export {
  formatRecipientLabel,
  normalizeGoalsMetrics,
  normalizeMetricGoalBreach,
};
