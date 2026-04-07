import { defineStore } from 'pinia';
import WidgetConversationalService from '@/services/api/resources/conversational/widgets';
import type { AutoWidgetResponse } from '@/services/api/resources/conversational/widgets';
import { useConversational } from './conversational';

interface AutoWidgetState {
  agentInvocation: {
    data: AutoWidgetResponse | null;
    isLoading: boolean;
    error: boolean;
  };
  toolResult: {
    data: AutoWidgetResponse | null;
    isLoading: boolean;
    error: boolean;
  };
}

export const useAutoWidgets = defineStore('autoWidgets', {
  state: (): AutoWidgetState => ({
    agentInvocation: {
      data: null,
      isLoading: false,
      error: false,
    },
    toolResult: {
      data: null,
      isLoading: false,
      error: false,
    },
  }),

  actions: {
    async loadAgentInvocationData() {
      if (this.agentInvocation.isLoading) return;

      this.agentInvocation.isLoading = true;
      this.agentInvocation.error = false;

      try {
        const response =
          await WidgetConversationalService.getAgentInvocationData();
        this.agentInvocation.data = response;

        if (response.results?.length > 0) {
          const conversational = useConversational();
          conversational.setHasEndpointData(true);
        }
      } catch (error) {
        this.agentInvocation.error = true;
        console.error('Error loading agent invocation data', error);
      } finally {
        this.agentInvocation.isLoading = false;
      }
    },

    async loadToolResultData() {
      if (this.toolResult.isLoading) return;

      this.toolResult.isLoading = true;
      this.toolResult.error = false;

      try {
        const response = await WidgetConversationalService.getToolResultData();
        this.toolResult.data = response;

        if (response.results?.length > 0) {
          const conversational = useConversational();
          conversational.setHasEndpointData(true);
        }
      } catch (error) {
        this.toolResult.error = true;
        console.error('Error loading tool result data', error);
      } finally {
        this.toolResult.isLoading = false;
      }
    },

    async loadAllAutoWidgets() {
      await Promise.all([
        this.loadAgentInvocationData(),
        this.loadToolResultData(),
      ]);
    },

    resetAutoWidgets() {
      this.agentInvocation = { data: null, isLoading: false, error: false };
      this.toolResult = { data: null, isLoading: false, error: false };
    },
  },

  getters: {
    hasAgentInvocationData: (state): boolean =>
      (state.agentInvocation.data?.results?.length ?? 0) > 0,

    hasToolResultData: (state): boolean =>
      (state.toolResult.data?.results?.length ?? 0) > 0,
  },
});
