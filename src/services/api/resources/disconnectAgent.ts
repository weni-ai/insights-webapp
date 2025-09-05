import http from '@/services/api/chatsHttp';
import { useConfig } from '@/store/modules/config';

interface FormattedBody {
  project_uuid: string;
  agent: string;
}

export default {
  async disconnectAgent({ agent }: { agent: string }): Promise<void> {
    const { project } = useConfig();

    const formattedBody: FormattedBody = {
      project_uuid: project.uuid,
      agent,
    };

    const response = (await http.post(
      `/chats/agent/disconnect/`,
      formattedBody,
    )) as void;

    return response;
  },
};

export type { FormattedBody };
