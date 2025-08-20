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
};

export type { ModelFields };
