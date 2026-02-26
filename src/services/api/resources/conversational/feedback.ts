import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';

export const DashboardType = {
  CONVERSATIONAL: 'CONVERSATIONAL',
} as const;

export const FormType = {
  SCORE_1_5: 'SCORE_1_5',
  TEXT: 'TEXT',
} as const;

export const Reference = {
  TRUST: 'TRUST',
  MAKE_DECISION: 'MAKE_DECISION',
  ROI: 'ROI',
  COMMENT: 'COMMENT',
} as const;

export interface CheckSurveyResponse {
  uuid: string;
  is_active: boolean;
  user_answered: boolean;
}

export type DashboardTypeValue =
  (typeof DashboardType)[keyof typeof DashboardType];
export type FormTypeValue = (typeof FormType)[keyof typeof FormType];
export type ReferenceValue = (typeof Reference)[keyof typeof Reference];

export interface FeedbackAnswer {
  reference: ReferenceValue;
  answer: string;
  type: FormTypeValue;
}

export interface SubmitFeedbackRequest {
  type: DashboardTypeValue;
  dashboard: string;
  survey: string;
  answers: FeedbackAnswer[];
}

export interface SubmitFeedbackResponse {
  uuid: string;
  type: DashboardTypeValue;
  dashboard: string;
  survey: string;
  answers: FeedbackAnswer[];
}

export default {
  async checkSurvey(): Promise<CheckSurveyResponse> {
    const { project } = useConfig();
    const { currentDashboard } = useDashboards();

    const response = (await http.get('/feedback/check-survey/', {
      params: {
        project_uuid: project.uuid,
        dashboard: currentDashboard.uuid,
      },
    })) as CheckSurveyResponse;

    return response;
  },

  async submitFeedback(
    payload: SubmitFeedbackRequest,
  ): Promise<SubmitFeedbackResponse> {
    const response = (await http.post(
      '/feedback/',
      payload,
    )) as SubmitFeedbackResponse;

    return response;
  },
};
