import { vi } from 'vitest';
import { createStore } from 'vuex';
import gptModule from '@/store/modules/gpt';
import { GPT } from '@/services/api';

vi.mock('@/services/api', () => ({
  GPT: {
    getInsights: vi.fn(),
  },
}));

describe('GPT Store', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        gpt: gptModule,
      },
    });
  });

  describe('mutations', () => {
    it('should add insight to state', () => {
      const insight = { request: 'test prompt', received: 'test response' };
      store.commit('gpt/ADD_INSIGHT', insight);
      expect(store.state.gpt.insights).toContainEqual(insight);
    });
  });

  describe('actions', () => {
    const prompt = 'test prompt';

    it('should get insights and commit ADD_INSIGHT mutation', async () => {
      const response = 'test response';
      GPT.getInsights.mockResolvedValue(response);
      await store.dispatch('gpt/getInsights', { prompt });

      expect(GPT.getInsights).toHaveBeenCalledWith(prompt);
      expect(store.state.gpt.insights).toContainEqual({
        request: prompt,
        received: response,
      });
    });

    it('should return response empty if no insights', async () => {
      GPT.getInsights.mockResolvedValue(null);
      await store.dispatch('gpt/getInsights', { prompt });

      expect(store.state.gpt.insights).toContainEqual({
        request: prompt,
        received: '',
      });
    });
  });
});
