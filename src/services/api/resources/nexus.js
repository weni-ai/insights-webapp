import { useConfig } from '@/store/modules/config';
import nexusHttp from '@/services/api/nexusHttp';

export default {
  async getAgentsTeam() {
    const { project } = useConfig();
    return await nexusHttp.get(`/api/agents/teams/${project.uuid}`);
  },
  async activateAgent(uuid) {
    const { project } = useConfig();
    const url = '/api/v1/official/agents/';
    const response = await nexusHttp.post(
      url,
      { assigned: true },
      {
        params: {
          project_uuid: project.uuid,
          agent_uuid: uuid,
        },
      },
    );
    return response;
  },
};
