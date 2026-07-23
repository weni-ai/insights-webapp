import nexusHttp from '@/services/api/nexusHttp';
import { useConfig } from '@/store/modules/config';

export type CriterionType = 'base' | 'custom';

export type CriterionErrorCode =
  | 'INVALID_CRITERION'
  | 'LAMBDA_VALIDATION_FAILED'
  | 'CRITERION_NOT_FOUND'
  | 'UNAUTHORIZED_BASE_CRITERION_CHANGE';

export interface Criterion {
  id: string;
  text: string;
  type: CriterionType;
  editable: boolean;
  deletable: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResolutionCriteriaResponse {
  base_criteria: Criterion[];
  custom_criteria: Criterion[];
}

export interface ValidationRule {
  rule: string;
  valid: boolean;
  reason: string;
}

export interface ValidationResponse {
  validation: {
    status: boolean;
    message: string;
    rules?: ValidationRule[];
  };
}

export interface CriterionErrorResponse {
  error: {
    code: CriterionErrorCode;
    message: string;
    rules?: ValidationRule[];
  };
}

export interface ParsedCriterionError {
  status: number;
  code: CriterionErrorCode | string;
  message: string;
  rules: ValidationRule[];
}

interface AxiosLikeError {
  status?: number;
  data?: CriterionErrorResponse;
}

export const MAX_CUSTOM_CRITERIA = 10;

export function parseCriterionError(error: unknown): ParsedCriterionError {
  const err = error as AxiosLikeError;
  const status = err?.status ?? 500;
  const code = err?.data?.error?.code ?? 'LAMBDA_VALIDATION_FAILED';
  const message =
    err?.data?.error?.message ??
    'The criterion could not be validated due to a technical issue';
  const rules = err?.data?.error?.rules ?? [];

  return { status, code, message, rules };
}

function getProjectUuid(): string {
  const { project } = useConfig();
  return project.uuid;
}

export default {
  async getResolutionCriteria(): Promise<ResolutionCriteriaResponse> {
    const projectUuid = getProjectUuid();
    return (await nexusHttp.get(
      `/api/${projectUuid}/ai-resolution-criteria/`,
    )) as ResolutionCriteriaResponse;
  },

  async validateCriterion({
    text,
    criterionId = null,
  }: {
    text: string;
    criterionId?: string | null;
  }): Promise<ValidationResponse> {
    const projectUuid = getProjectUuid();
    return (await nexusHttp.post(
      `/api/${projectUuid}/ai-validation-criteria/`,
      {
        text,
        criterion_id: criterionId,
      },
    )) as ValidationResponse;
  },

  async createCriterion({ text }: { text: string }): Promise<Criterion> {
    const projectUuid = getProjectUuid();
    return (await nexusHttp.post(
      `/api/${projectUuid}/ai-resolution-criteria/`,
      { text },
    )) as Criterion;
  },

  async updateCriterion(
    criterionId: string,
    { text }: { text: string },
  ): Promise<Criterion> {
    const projectUuid = getProjectUuid();
    return (await nexusHttp.patch(
      `/api/${projectUuid}/ai-resolution-criteria/${criterionId}/`,
      { text },
    )) as Criterion;
  },

  async deleteCriterion(criterionId: string): Promise<{ success: boolean }> {
    const projectUuid = getProjectUuid();
    return (await nexusHttp.delete(
      `/api/${projectUuid}/ai-resolution-criteria/${criterionId}/`,
    )) as { success: boolean };
  },
};
