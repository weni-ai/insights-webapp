import Projects from '@/services/api/resources/projects';
import NexusApi from '@/services/api/resources/nexus';
import { parseValue } from '@/utils/object';
import { defineStore } from 'pinia';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import env from '@/utils/env';

export const useProject = defineStore('project', {
  state: () => ({
    isLoadedFlows: false,
    isLoadingFlows: false,
    flows: [],
    isCommerce: false,
    agentsTeam: {
      manager: null,
      agents: [],
    },
    isLoadingAgentsTeam: false,
    hasChatsSectors: false,
  }),

  getters: {
    csatAgent: (state) =>
      state.agentsTeam.agents.find(
        (agent) => agent.uuid === env('CSAT_AGENT_UUID'),
      ),
    npsAgent: (state) =>
      state.agentsTeam.agents.find(
        (agent) => agent.uuid === env('NPS_AGENT_UUID'),
      ),
    hasValidSalesFunnelAgent: () => {
      const enableFeatureFlag = useFeatureFlag().isFeatureFlagEnabled(
        'insightsSalesFunnel',
      );

      return enableFeatureFlag;
    },
  },

  actions: {
    setIsCommerce(isCommerce) {
      this.isCommerce = isCommerce;
    },
    getProjectFlows() {
      this.isLoadingFlows = true;

      Projects.getProjectSource('flows')
        .then((response) => {
          const flows = response.map((source) => ({
            value: source.uuid,
            label: source.name,
            results: parseValue(source.metadata)?.results.map((result) => ({
              value: result.key,
              label: result.name,
            })),
          }));

          this.flows = flows;
          this.isLoadedFlows = true;
        })
        .finally(() => {
          this.isLoadingFlows = false;
        });
    },
    async getAgentsTeam() {
      this.isLoadingAgentsTeam = true;

      try {
        const response = await NexusApi.getAgentsTeam();
        this.agentsTeam = response;

        this.isLoadingAgentsTeam = false;
      } catch (error) {
        console.error('Error getting agents team', error);
      }
    },
    async activateAgent(uuid: string) {
      try {
        await NexusApi.activateAgent(uuid);
      } catch (error) {
        console.error('Error activating agent', error);
      }
    },
    async checkHasChatsSectors() {
      const response = await Projects.getProjectSource('sectors');
      this.hasChatsSectors = response.length > 0;
    },
  },
});
