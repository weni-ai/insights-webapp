import chatsHttp from '@/services/api/chatsHttp';
import { useConfig } from '@/store/modules/config';

type MetricKey =
  | 'waiting_time'
  | 'first_response_time'
  | 'conversation_duration';

type TimeUnit = 's' | 'm' | 'h';

interface MetricGoalBreach {
  threshold_seconds: number;
  threshold_value: number;
  unit: TimeUnit;
  is_breached: boolean;
  breached_rooms_count: number;
}

interface MetricGoalRecipientApi {
  uuid: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  uuid_project_permission?: string;
}

interface MetricGoalRecipient {
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
  recipients: MetricGoalRecipientApi[] | MetricGoalRecipient[] | string[];
  rooms_threshold_count: number;
  rooms_threshold_percent?: number | null;
}

interface MetricGoalRecipientDetail {
  uuid: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface MetricGoal {
  metric: MetricKey;
  threshold_seconds: number;
  threshold_value: number;
  unit: TimeUnit;
  is_active: boolean;
  email_enabled: boolean;
  recipients: string[];
  recipientDetails: MetricGoalRecipientDetail[];
  rooms_threshold_count: number;
}

interface MetricGoalsResponse {
  goals: MetricGoal[];
}

interface MetricGoalSavePayload {
  threshold: number;
  unit: TimeUnit;
  is_active: boolean;
  email_enabled: boolean;
  rooms_threshold_count: number;
  recipients: MetricGoalRecipient[];
}

const UNIT_SECONDS: Record<TimeUnit, number> = {
  s: 1,
  m: 60,
  h: 3600,
};

const thresholdToSeconds = (threshold: number, unit: TimeUnit): number =>
  Math.round(threshold * UNIT_SECONDS[unit]);

const formatRecipientLabel = (recipient: MetricGoalRecipientDetail): string => {
  const name = [recipient.first_name, recipient.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || recipient.email || recipient.uuid;
};

const normalizeRecipientId = (
  recipient: MetricGoalRecipientApi | MetricGoalRecipient | string,
): string => {
  if (typeof recipient === 'string') return recipient;

  if ('uuid' in recipient) {
    return recipient.uuid || recipient.uuid_project_permission || '';
  }

  return recipient.uuid_project_permission || '';
};

const normalizeRecipientDetail = (
  recipient: MetricGoalRecipientApi | MetricGoalRecipient | string,
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
      first_name: recipient.first_name,
      last_name: recipient.last_name,
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
  const threshold_seconds = resolveThresholdSeconds(goal);
  const recipientDetails = (goal.recipients || [])
    .map(normalizeRecipientDetail)
    .filter((recipient): recipient is MetricGoalRecipientDetail => !!recipient);

  return {
    metric: goal.metric,
    threshold_seconds,
    threshold_value: resolveThresholdValue(goal, threshold_seconds),
    unit: goal.unit,
    is_active: goal.is_active,
    email_enabled: goal.email_enabled,
    recipients: recipientDetails.map((recipient) => recipient.uuid),
    recipientDetails,
    rooms_threshold_count: goal.rooms_threshold_count,
  };
};

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
    payload: MetricGoalSavePayload,
  ): Promise<MetricGoal> {
    const { project } = useConfig();

    const response = (await chatsHttp.post(
      metricGoalsPath(project.uuid, metric),
      payload,
    )) as MetricGoalApi;

    return normalizeGoal(response);
  },

  async deleteMetricGoal(metric: MetricKey): Promise<void> {
    const { project } = useConfig();

    await chatsHttp.delete(metricGoalsPath(project.uuid, metric));
  },
};

export type {
  MetricGoal,
  MetricGoalApi,
  MetricGoalBreach,
  MetricGoalRecipient,
  MetricGoalRecipientDetail,
  MetricGoalSavePayload,
  MetricKey,
  TimeUnit,
  MetricGoalsResponse,
};

export { formatRecipientLabel };
