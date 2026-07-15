import { describe, it, expect, vi, beforeEach } from 'vitest';
import nexus from '../nexus';
import nexusHttp from '@/services/api/nexusHttp';
import { useConfig } from '@/store/modules/config';

vi.mock('@/services/api/nexusHttp');
vi.mock('@/store/modules/config');

describe('Nexus Service', () => {
  const mockProject = {
    uuid: 'test-project-uuid',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({
      project: mockProject,
    });
  });

  describe('getAgentsTeam', () => {
    it('should call nexusHttp.get with correct endpoint', async () => {
      const mockResponse = { data: { agents: [] } };
      nexusHttp.get.mockResolvedValueOnce(mockResponse);

      const result = await nexus.getAgentsTeam();

      expect(nexusHttp.get).toHaveBeenCalledWith(
        `/api/agents/teams/${mockProject.uuid}`,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors from nexusHttp.get', async () => {
      const mockError = new Error('API Error');
      nexusHttp.get.mockRejectedValueOnce(mockError);

      await expect(nexus.getAgentsTeam()).rejects.toThrow('API Error');
    });
  });

  describe('activateAgent', () => {
    const testAgentUuid = 'test-agent-uuid';

    it('should call nexusHttp.post with correct endpoint and payload', async () => {
      const mockResponse = { data: { success: true } };
      nexusHttp.post.mockResolvedValueOnce(mockResponse);

      const result = await nexus.activateAgent(testAgentUuid);

      expect(nexusHttp.post).toHaveBeenCalledWith(
        '/api/v1/official/agents',
        { assigned: true },
        {
          params: {
            project_uuid: mockProject.uuid,
            agent_uuid: testAgentUuid,
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors from nexusHttp.post', async () => {
      const mockError = new Error('API Error');
      nexusHttp.post.mockRejectedValueOnce(mockError);

      await expect(nexus.activateAgent(testAgentUuid)).rejects.toThrow(
        'API Error',
      );
    });

    it('should work with different agent UUIDs', async () => {
      const mockResponse = { data: { success: true } };
      nexusHttp.post.mockResolvedValueOnce(mockResponse);

      const differentAgentUuid = 'different-agent-uuid';
      await nexus.activateAgent(differentAgentUuid);

      expect(nexusHttp.post).toHaveBeenCalledWith(
        '/api/v1/official/agents',
        { assigned: true },
        {
          params: {
            project_uuid: mockProject.uuid,
            agent_uuid: differentAgentUuid,
          },
        },
      );
    });
  });
});
