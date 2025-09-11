import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

type TypeSections =
  | 'RESOLUTIONS'
  | 'TRANSFERRED'
  | 'TOPICS_AI'
  | 'TOPICS_HUMAN'
  | 'CSAT_AI'
  | 'CSAT_HUMAN'
  | 'NPS_AI'
  | 'NPS_HUMAN';

interface ExportRequest {
  project_uuid: string;
  filters: {
    start_date: string; // YYYY-MM-DD format
    end_date: string; // YYYY-MM-DD format
  };
  type: 'CSV' | 'XLSX';
  sections: TypeSections[];
  custom_widgets: string[];
}

interface ExportResponse {
  status: string;
  email?: string;
  report_uuid?: string;
}

export default {
  async checkExportStatus(): Promise<ExportResponse> {
    const { project } = useConfig();

    const formattedParams = {
      project_uuid: project.uuid,
    };

    const response = (await http.get(`/metrics/conversations/report/`, {
      params: formattedParams,
    })) as ExportResponse;

    return response;
  },

  async createExport(
    exportData: Omit<ExportRequest, 'project_uuid'>,
  ): Promise<ExportResponse> {
    const { project } = useConfig();

    const response = (await http.post(`/metrics/conversations/report/`, {
      ...exportData,
      project_uuid: project.uuid,
    })) as ExportResponse;

    return response;
  },
};

export type { ExportRequest, ExportResponse, TypeSections };
