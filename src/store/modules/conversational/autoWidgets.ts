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

let agentInvocationAbortController: AbortController | null = null;
let toolResultAbortController: AbortController | null = null;

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
      if (agentInvocationAbortController) {
        agentInvocationAbortController.abort();
      }
      agentInvocationAbortController = new AbortController();
      const { signal } = agentInvocationAbortController;

      this.agentInvocation.isLoading = true;
      this.agentInvocation.error = false;

      try {
        const response =
          await WidgetConversationalService.getAgentInvocationData(
            {},
            { signal },
          );
        this.agentInvocation.data = response;

        if (response.results?.length > 0) {
          const conversational = useConversational();
          conversational.setHasEndpointData(true);
        }
      } catch (error) {
        if (signal.aborted) return;
        this.agentInvocation.error = true;
        console.error('Error loading agent invocation data', error);
      } finally {
        if (!signal.aborted) {
          this.agentInvocation.isLoading = false;
        }
      }
    },

    async loadToolResultData() {
      if (toolResultAbortController) {
        toolResultAbortController.abort();
      }
      toolResultAbortController = new AbortController();
      const { signal } = toolResultAbortController;

      this.toolResult.isLoading = true;
      this.toolResult.error = false;

      try {
        const response = await WidgetConversationalService.getToolResultData(
          {},
          { signal },
        );
        this.toolResult.data = response;

        if (response.results?.length > 0) {
          const conversational = useConversational();
          conversational.setHasEndpointData(true);
        }
      } catch (error) {
        if (signal.aborted) return;
        this.toolResult.error = true;
        console.error('Error loading tool result data', error);
      } finally {
        if (!signal.aborted) {
          this.toolResult.isLoading = false;
        }
      }
    },

    async loadAllAutoWidgets() {
      await Promise.all([
        this.loadAgentInvocationData(),
        this.loadToolResultData(),
      ]);
    },

    resetAutoWidgets() {
      if (agentInvocationAbortController) {
        agentInvocationAbortController.abort();
        agentInvocationAbortController = null;
      }
      if (toolResultAbortController) {
        toolResultAbortController.abort();
        toolResultAbortController = null;
      }
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
