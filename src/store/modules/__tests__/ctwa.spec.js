import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createApp } from 'vue';

import { useCTWA } from '../ctwa';

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({
    start: '2024-01-01',
    end: '2024-01-07',
    dmFormat: '01/01 - 07/01',
  })),
}));

describe('useCTWA store', () => {
  let store;
  let router;

  const createStore = async (query = {}) => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' },
        },
      ],
    });

    await router.push({ path: '/', query });
    await router.isReady();

    const app = createApp({ template: '<div></div>' });
    const pinia = createPinia();
    app.use(router);
    app.use(pinia);
    setActivePinia(pinia);

    store = useCTWA();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await createStore();
  });

  describe('initial state', () => {
    it('initializes date range with last 7 days when query is empty', () => {
      expect(store.appliedDateRange).toEqual({
        start: '2024-01-01',
        end: '2024-01-07',
      });
    });

    it('initializes selected campaign as empty when query is empty', () => {
      expect(store.selectedCampaign).toBe('');
    });

    it('initializes date range from query params', async () => {
      await createStore({
        start_date: '2024-02-01',
        end_date: '2024-02-15',
      });

      expect(store.appliedDateRange).toEqual({
        start: '2024-02-01',
        end: '2024-02-15',
      });
    });

    it('initializes selected campaign from query param', async () => {
      await createStore({ campaign: 'campaign-uuid' });

      expect(store.selectedCampaign).toBe('campaign-uuid');
    });

    it('uses default date range when only one date query param is present', async () => {
      await createStore({ start_date: '2024-02-01' });

      expect(store.appliedDateRange).toEqual({
        start: '2024-01-01',
        end: '2024-01-07',
      });
    });
  });

  describe('appliedFilters', () => {
    it('returns date filters without campaign when none is selected', () => {
      expect(store.appliedFilters).toEqual({
        start_date: '2024-01-01',
        end_date: '2024-01-07',
      });
    });

    it('includes campaign when one is selected', () => {
      store.selectedCampaign = 'campaign-uuid';

      expect(store.appliedFilters).toEqual({
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        campaign: 'campaign-uuid',
      });
    });
  });
});
