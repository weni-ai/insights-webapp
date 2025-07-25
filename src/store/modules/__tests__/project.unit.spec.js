import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProject } from '../project';
import Projects from '@/services/api/resources/projects';
import NexusApi from '@/services/api/resources/nexus';
import { parseValue } from '@/utils/object';
import { flushPromises } from '@vue/test-utils';
import env from '@/utils/env';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectSource: vi.fn(),
  },
}));

vi.mock('@/services/api/resources/nexus', () => ({
  default: {
    getAgentsTeam: vi.fn(),
    activateAgent: vi.fn(),
  },
}));

vi.mock('@/utils/object', () => ({
  parseValue: vi.fn(),
}));

vi.mock('@/utils/env');

describe('useProject store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should set isCommerce value', () => {
    const store = useProject();
    store.setIsCommerce(true);
    expect(store.isCommerce).toBe(true);
  });

  it('should fetch and parse project flows', async () => {
    const store = useProject();

    const mockResponse = [
      {
        uuid: 'flow-1',
        name: 'Flow 1',
        metadata: '{}',
      },
    ];

    const parsedMetadata = {
      results: [{ key: 'result-1', name: 'Result 1' }],
    };

    Projects.getProjectSource.mockResolvedValue(mockResponse);
    parseValue.mockReturnValue(parsedMetadata);

    await store.getProjectFlows();

    expect(Projects.getProjectSource).toHaveBeenCalledWith('flows');
    expect(parseValue).toHaveBeenCalledWith('{}');
    expect(store.flows).toEqual([
      {
        value: 'flow-1',
        label: 'Flow 1',
        results: [{ value: 'result-1', label: 'Result 1' }],
      },
    ]);
    await flushPromises();
    expect(store.isLoadedFlows).toBe(true);
    expect(store.isLoadingFlows).toBe(false);
  });

  describe('agentsTeam functionality', () => {
    it('should fetch agents team successfully', async () => {
      const store = useProject();

      const mockResponse = {
        manager: { uuid: 'manager-1', name: 'Manager' },
        agents: [
          { uuid: 'agent-1', name: 'Agent 1' },
          { uuid: 'agent-2', name: 'Agent 2' },
        ],
      };

      NexusApi.getAgentsTeam.mockResolvedValue(mockResponse);

      await store.getAgentsTeam();

      expect(NexusApi.getAgentsTeam).toHaveBeenCalled();
      expect(store.agentsTeam).toEqual(mockResponse);
      expect(store.isLoadingAgentsTeam).toBe(false);
    });

    it('should handle errors when fetching agents team', async () => {
      const store = useProject();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('API Error');
      NexusApi.getAgentsTeam.mockRejectedValue(mockError);

      await store.getAgentsTeam();

      expect(NexusApi.getAgentsTeam).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting agents team',
        mockError,
      );
      expect(store.isLoadingAgentsTeam).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should set loading state during agents team fetch', async () => {
      const store = useProject();

      NexusApi.getAgentsTeam.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100)),
      );

      const promise = store.getAgentsTeam();
      expect(store.isLoadingAgentsTeam).toBe(true);

      await promise;
      expect(store.isLoadingAgentsTeam).toBe(false);
    });

    it('should activate agent successfully', async () => {
      const store = useProject();
      const agentUuid = 'agent-uuid';

      NexusApi.activateAgent.mockResolvedValue({});

      await store.activateAgent(agentUuid);

      expect(NexusApi.activateAgent).toHaveBeenCalledWith(agentUuid);
    });

    it('should handle errors when activating agent', async () => {
      const store = useProject();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('Activation Error');
      const agentUuid = 'agent-uuid';
      NexusApi.activateAgent.mockRejectedValue(mockError);

      await store.activateAgent(agentUuid);

      expect(NexusApi.activateAgent).toHaveBeenCalledWith(agentUuid);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error activating agent',
        mockError,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      env.mockImplementation((key) => {
        const envVars = {
          CSAT_AGENT_UUID: 'csat-agent-uuid',
          NPS_AGENT_UUID: 'nps-agent-uuid',
        };
        return envVars[key];
      });
    });

    it('should return csatAgent from agents team', () => {
      const store = useProject();

      store.agentsTeam = {
        manager: null,
        agents: [
          { uuid: 'agent-1', name: 'Agent 1' },
          { uuid: 'csat-agent-uuid', name: 'CSAT Agent' },
          { uuid: 'agent-2', name: 'Agent 2' },
        ],
      };

      expect(store.csatAgent).toEqual({
        uuid: 'csat-agent-uuid',
        name: 'CSAT Agent',
      });
    });

    it('should return npsAgent from agents team', () => {
      const store = useProject();

      store.agentsTeam = {
        manager: null,
        agents: [
          { uuid: 'agent-1', name: 'Agent 1' },
          { uuid: 'nps-agent-uuid', name: 'NPS Agent' },
          { uuid: 'agent-2', name: 'Agent 2' },
        ],
      };

      expect(store.npsAgent).toEqual({
        uuid: 'nps-agent-uuid',
        name: 'NPS Agent',
      });
    });

    it('should return undefined when csatAgent is not found', () => {
      const store = useProject();

      store.agentsTeam = {
        manager: null,
        agents: [
          { uuid: 'agent-1', name: 'Agent 1' },
          { uuid: 'agent-2', name: 'Agent 2' },
        ],
      };

      expect(store.csatAgent).toBeUndefined();
    });

    it('should return undefined when npsAgent is not found', () => {
      const store = useProject();

      store.agentsTeam = {
        manager: null,
        agents: [
          { uuid: 'agent-1', name: 'Agent 1' },
          { uuid: 'agent-2', name: 'Agent 2' },
        ],
      };

      expect(store.npsAgent).toBeUndefined();
    });
  });
});
