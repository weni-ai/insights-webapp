import { defineStore } from 'pinia';
import { GPT } from '@/services/api';
import { registerStoreHMR } from '@/utils/hmr';

export const useGpt = defineStore('gpt', {
  state: () => ({ insights: [] as any[] }),
  actions: {
    async getInsights({ prompt }) {
      const response = await GPT.getInsights(prompt);
      this.insights.push({ request: prompt, received: response || '' });
    },
  },
});

registerStoreHMR(useGpt, import.meta.webpackHot);
