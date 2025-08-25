import chatsHttp from '@/services/api/chatsHttp';
import { useConfig } from '@/store/modules/config';

interface ModelField {
  type: string;
}

interface ModelFields {
  [modelName: string]: {
    [fieldName: string]: ModelField;
  };
}

interface ExportEntity {
  uuids: string[];
  fields: string[];
}

interface ExportRequest {
  project_uuid: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  open_chats: boolean;
  closed_chats: boolean;
  type: '.csv' | '.xlsx';
  sectors: ExportEntity;
  queues: ExportEntity;
  rooms: ExportEntity;
  users: ExportEntity;
  sector_tags: ExportEntity;
  contacts: ExportEntity;
}

interface ExportResponse {
  status: string;
  created_at: string;
  email: string;
  uuid: string;
}

export default {
  async getModelFields(): Promise<ModelFields> {
    const { project } = useConfig();

    const formattedParams = {
      project_uuid: project.uuid,
    };

    const response = (await chatsHttp.get(`/model-fields/`, {
      params: formattedParams,
    })) as ModelFields;

    return response;
  },

  async checkExportStatus(): Promise<ExportResponse> {
    const { project } = useConfig();

    const formattedParams = {
      project_uuid: project.uuid,
    };

    const response = (await chatsHttp.get(`/chats/report /`, {
      params: formattedParams,
    })) as ExportResponse;

    return response;
  },

  async createExport(
    exportData: Omit<ExportRequest, 'project_uuid'>,
  ): Promise<ExportResponse> {
    const { project } = useConfig();

    const response = (await chatsHttp.post(`/chats/report/`, {
      ...exportData,
      project_uuid: project.uuid,
    })) as ExportResponse;

    return response;
  },
};

export type { ModelFields, ExportRequest, ExportResponse, ExportEntity };
