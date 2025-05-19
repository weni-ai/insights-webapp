import { defineStore } from 'pinia';
import { GPT } from '@/services/api';

export const useGpt = defineStore('gpt', {
  state: () => ({ insights: [] as any[] }),
  actions: {
    async getInsights({ prompt }) {
      const response = await GPT.getInsights(prompt);
      this.insights.push({ request: prompt, received: response || '' });
    },
  },
});
