import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { unnnicCallAlert } from '@weni/unnnic-system';

import { useConversationalWidgets } from '../widgets';

const mockGetSearchTermsData = vi.fn();
const mockGetAddedToCartData = vi.fn();
const mockGetSalesFunnelData = vi.fn();
const mockGetCsatData = vi.fn();
const mockGetNpsData = vi.fn();
const mockSaveNewWidget = vi.fn();
const mockUpdateWidget = vi.fn();
const mockDeleteWidget = vi.fn();
const mockFindWidgetBySource = vi.fn();
const mockGetCurrentDashboardWidgets = vi.fn();

const currentDashboardWidgets = ref<Array<Record<string, unknown>>>([]);
const conversationalState = { shouldUseMock: false };
const dashboardState = {
  currentDashboard: { config: {} as Record<string, unknown> },
};

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getSearchTermsData: (...args: unknown[]) => mockGetSearchTermsData(...args),
    getAddedToCartData: (...args: unknown[]) => mockGetAddedToCartData(...args),
    getSalesFunnelData: (...args: unknown[]) => mockGetSalesFunnelData(...args),
    getCsatData: (...args: unknown[]) => mockGetCsatData(...args),
    getNpsData: (...args: unknown[]) => mockGetNpsData(...args),
  },
}));

vi.mock('@/services/api/resources/widgets', () => ({
  default: {
    saveNewWidget: (...args: unknown[]) => mockSaveNewWidget(...args),
    updateWidget: (...args: unknown[]) => mockUpdateWidget(...args),
    deleteWidget: (...args: unknown[]) => mockDeleteWidget(...args),
  },
}));

vi.mock('@/store/modules/widgets', () => ({
  useWidgets: () => ({
    findWidgetBySource: (...args: unknown[]) => mockFindWidgetBySource(...args),
    getCurrentDashboardWidgets: (...args: unknown[]) =>
      mockGetCurrentDashboardWidgets(...args),
    currentDashboardWidgets,
  }),
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => conversationalState,
}));

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => dashboardState,
}));

vi.mock('@weni/unnnic-system', () => ({
  unnnicCallAlert: vi.fn(),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}));

describe('useConversationalWidgets store - product ranking widgets', () => {
  let store: ReturnType<typeof useConversationalWidgets>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversationalWidgets();
    vi.restoreAllMocks();
    mockGetCurrentDashboardWidgets.mockResolvedValue(undefined);
    conversationalState.shouldUseMock = false;
    dashboardState.currentDashboard = { config: {} };
    currentDashboardWidgets.value = [];
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('loadSearchTermWidgetData', () => {
    it('stores data when the API resolves', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      const response = { results: [{ label: 'a', value: 1, full_value: 10 }] };
      mockGetSearchTermsData.mockResolvedValue(response);

      await store.loadSearchTermWidgetData();

      expect(mockGetSearchTermsData).toHaveBeenCalledWith(
        { widget_uuid: 'search-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.searchTermWidgetData).toEqual(response);
      expect(store.isSearchTermWidgetDataError).toBe(false);
      expect(store.isLoadingSearchTermWidgetData).toBe(false);
    });

    it('sets error state when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await store.loadSearchTermWidgetData();

      expect(mockGetSearchTermsData).not.toHaveBeenCalled();
      expect(store.isSearchTermWidgetDataError).toBe(true);
      expect(store.searchTermWidgetData).toBeNull();
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      mockGetSearchTermsData.mockRejectedValue(new Error('boom'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await store.loadSearchTermWidgetData();

      expect(store.isSearchTermWidgetDataError).toBe(true);
      expect(store.searchTermWidgetData).toBeNull();
    });

    it('aborts the previous request when called again', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      let resolveSecond: (_value: unknown) => void = () => {};

      mockGetSearchTermsData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
        );

      store.loadSearchTermWidgetData();
      store.loadSearchTermWidgetData();

      const firstSignal = mockGetSearchTermsData.mock.calls[0][1]?.signal;
      expect(firstSignal?.aborted).toBe(true);

      resolveSecond({ results: [] });
    });
  });

  describe('loadAddedToCartWidgetData', () => {
    it('stores data when the API resolves', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      const response = { results: [{ label: 'b', value: 2, full_value: 20 }] };
      mockGetAddedToCartData.mockResolvedValue(response);

      await store.loadAddedToCartWidgetData();

      expect(mockGetAddedToCartData).toHaveBeenCalledWith(
        { widget_uuid: 'cart-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.addedToCartWidgetData).toEqual(response);
      expect(store.isAddedToCartWidgetDataError).toBe(false);
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      mockGetAddedToCartData.mockRejectedValue(new Error('boom'));

      await store.loadAddedToCartWidgetData();

      expect(store.isAddedToCartWidgetDataError).toBe(true);
      expect(store.addedToCartWidgetData).toBeNull();
      expect(store.isLoadingAddedToCartWidgetData).toBe(false);
    });

    it('sets error state when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);

      await store.loadAddedToCartWidgetData();

      expect(mockGetAddedToCartData).not.toHaveBeenCalled();
      expect(store.isAddedToCartWidgetDataError).toBe(true);
      expect(store.addedToCartWidgetData).toBeNull();
    });

    it('ignores an aborted request and keeps the latest response', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      let resolveSecond: (_value: unknown) => void = () => {};

      mockGetAddedToCartData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
        );

      const firstLoad = store.loadAddedToCartWidgetData();
      const secondLoad = store.loadAddedToCartWidgetData();
      const latest = { results: [{ label: 'kept', value: 1, full_value: 1 }] };

      resolveSecond(latest);
      await Promise.all([firstLoad, secondLoad]);

      expect(store.addedToCartWidgetData).toEqual(latest);
      expect(store.isAddedToCartWidgetDataError).toBe(false);
      expect(store.isLoadingAddedToCartWidgetData).toBe(false);
    });
  });

  describe('configured getters', () => {
    it('isSearchTermConfigured is true when the widget exists', () => {
      mockFindWidgetBySource.mockImplementation((source: string) =>
        source === 'conversations.search_term' ? { uuid: 's' } : undefined,
      );
      expect(store.isSearchTermConfigured).toBe(true);
    });

    it('isSearchTermConfigured is false when the widget is missing', () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      expect(store.isSearchTermConfigured).toBe(false);
    });

    it('isAddedToCartConfigured is true when the widget exists', () => {
      mockFindWidgetBySource.mockImplementation((source: string) =>
        source === 'conversations.product_added_to_cart'
          ? { uuid: 'c' }
          : undefined,
      );
      expect(store.isAddedToCartConfigured).toBe(true);
    });

    it('isAddedToCartConfigured is false when the widget is missing', () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      expect(store.isAddedToCartConfigured).toBe(false);
    });
  });

  describe('saveNewWidget', () => {
    it('triggers loadSearchTermWidgetData for the search_term source', async () => {
      mockSaveNewWidget.mockResolvedValue(undefined);
      const loadSpy = vi
        .spyOn(store, 'loadSearchTermWidgetData')
        .mockResolvedValue(undefined);

      store.newWidget = {
        uuid: '',
        name: 'conversations.search_term',
        config: {},
        type: 'conversations.search_term',
        source: 'conversations.search_term',
        is_configurable: true,
      } as never;

      await store.saveNewWidget();

      expect(mockSaveNewWidget).toHaveBeenCalled();
      expect(loadSpy).toHaveBeenCalled();
    });

    it('triggers loadAddedToCartWidgetData for the added_to_cart source', async () => {
      mockSaveNewWidget.mockResolvedValue(undefined);
      const loadSpy = vi
        .spyOn(store, 'loadAddedToCartWidgetData')
        .mockResolvedValue(undefined);

      store.newWidget = {
        uuid: '',
        name: 'conversations.product_added_to_cart',
        config: {},
        type: 'conversations.product_added_to_cart',
        source: 'conversations.product_added_to_cart',
        is_configurable: true,
      } as never;

      await store.saveNewWidget();

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('deleteWidget', () => {
    it('deletes the widget found for the search_term source', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      mockDeleteWidget.mockResolvedValue(undefined);

      await store.deleteWidget('search_term');

      expect(mockFindWidgetBySource).toHaveBeenCalledWith(
        'conversations.search_term',
      );
      expect(mockDeleteWidget).toHaveBeenCalledWith('search-uuid');
    });

    it('deletes the widget found for the added_to_cart source', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      mockDeleteWidget.mockResolvedValue(undefined);

      await store.deleteWidget('added_to_cart');

      expect(mockFindWidgetBySource).toHaveBeenCalledWith(
        'conversations.product_added_to_cart',
      );
      expect(mockDeleteWidget).toHaveBeenCalledWith('cart-uuid');
    });

    it('rethrows when the deletion fails', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      mockDeleteWidget.mockRejectedValue(new Error('delete failed'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(store.deleteWidget('search_term')).rejects.toThrow(
        'delete failed',
      );
    });

    it('rethrows when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);

      await expect(store.deleteWidget('csat')).rejects.toThrow(
        'csat widget not found',
      );
      expect(store.isLoadingDeleteWidget).toBe(false);
    });

    it.each([
      [
        'sales_funnel',
        'conversations.sales_funnel',
        'loadSalesFunnelWidgetData',
      ],
      ['nps', 'conversations.nps', 'loadNpsWidgetData'],
      ['csat', 'conversations.csat', 'loadCsatWidgetData'],
      ['crosstab', 'conversations.crosstab', null],
      [
        'abandoned_cart_recovery',
        'conversations.abandoned_cart_recovery',
        null,
      ],
    ] as const)(
      'deletes %s and reloads only the widgets that depend on it',
      async (type, source, reloader) => {
        mockFindWidgetBySource.mockReturnValue({ uuid: `${type}-uuid` });
        mockDeleteWidget.mockResolvedValue(undefined);
        const loadSalesFunnel = vi
          .spyOn(store, 'loadSalesFunnelWidgetData')
          .mockResolvedValue(undefined);
        const loadNps = vi
          .spyOn(store, 'loadNpsWidgetData')
          .mockResolvedValue(undefined);
        const loadCsat = vi
          .spyOn(store, 'loadCsatWidgetData')
          .mockResolvedValue(undefined);
        const reloaders = {
          loadSalesFunnelWidgetData: loadSalesFunnel,
          loadNpsWidgetData: loadNps,
          loadCsatWidgetData: loadCsat,
        };

        await store.deleteWidget(type);

        expect(mockFindWidgetBySource).toHaveBeenCalledWith(source);
        expect(mockDeleteWidget).toHaveBeenCalledWith(`${type}-uuid`);
        expect(mockGetCurrentDashboardWidgets).toHaveBeenCalled();

        (Object.keys(reloaders) as Array<keyof typeof reloaders>).forEach(
          (name) => {
            if (name === reloader) {
              expect(reloaders[name]).toHaveBeenCalled();
            } else {
              expect(reloaders[name]).not.toHaveBeenCalled();
            }
          },
        );
        expect(store.isLoadingDeleteWidget).toBe(false);
      },
    );
  });

  describe('widget setters', () => {
    it('stores and clears the widget being created', () => {
      const widget = { uuid: 'new', source: 'conversations.csat' };

      store.setNewWidget(widget as never);
      expect(store.newWidget).toEqual(widget);

      store.resetNewWidget();
      expect(store.newWidget).toBeNull();
    });

    it('stores csat and nps widget drafts and their response types', () => {
      const csat = { uuid: 'csat' };
      const nps = { uuid: 'nps' };

      store.setCsatWidget(csat as never);
      store.setNpsWidget(nps as never);
      store.setCsatWidgetType('HUMAN');
      store.setNpsWidgetType('HUMAN');
      store.setCsatWidgetData({ results: [] });
      store.setNpsWidgetData({ total_responses: 4 } as never);

      expect(store.csatWidget).toEqual(csat);
      expect(store.npsWidget).toEqual(nps);
      expect(store.csatWidgetType).toBe('HUMAN');
      expect(store.npsWidgetType).toBe('HUMAN');
      expect(store.csatWidgetData).toEqual({ results: [] });
      expect(store.npsWidgetData).toEqual({ total_responses: 4 });
    });

    it('clears datalake config when the AI form is turned off', () => {
      store.csatWidget = {
        uuid: 'csat',
        config: {
          datalake_config: { agent_uuid: 'agent' },
          filter: { flow: 'flow' },
          op_field: 'field',
        },
      } as never;
      store.npsWidget = {
        uuid: 'nps',
        config: { datalake_config: { agent_uuid: 'agent' } },
      } as never;

      store.setIsFormAi(false, 'csat');
      expect(store.isFormAi).toBe(false);
      expect(store.csatWidget?.config).toEqual(
        expect.objectContaining({ datalake_config: {} }),
      );

      store.setIsFormAi(false, 'nps');
      expect(store.npsWidget?.config).toEqual(
        expect.objectContaining({ datalake_config: {} }),
      );
    });

    it('keeps the draft when the AI form stays on or there is no widget', () => {
      store.setIsFormAi(true, 'csat');
      expect(store.isFormAi).toBe(true);
      expect(store.csatWidget).toBeNull();

      store.setIsFormAi(false, 'csat');
      expect(store.csatWidget).toBeNull();

      store.setIsFormAi(false);
      expect(store.isFormAi).toBe(false);
    });

    it('clears the human filter when the human form is turned off', () => {
      store.csatWidget = {
        uuid: 'csat',
        config: {
          datalake_config: { agent_uuid: 'agent' },
          filter: { flow: 'flow' },
          op_field: 'field',
        },
      } as never;
      store.npsWidget = {
        uuid: 'nps',
        config: { filter: { flow: 'flow' }, op_field: 'field' },
      } as never;

      store.setIsFormHuman(false, 'csat');
      expect(store.isFormHuman).toBe(false);
      expect(store.csatWidget?.config).toEqual(
        expect.objectContaining({ filter: {}, op_field: '' }),
      );

      store.setIsFormHuman(false, 'nps');
      expect(store.npsWidget?.config).toEqual(
        expect.objectContaining({ filter: {}, op_field: '' }),
      );
    });

    it('keeps the draft when the human form stays on or there is no widget', () => {
      store.setIsFormHuman(true, 'nps');
      expect(store.isFormHuman).toBe(true);

      store.setIsFormHuman(false, 'nps');
      expect(store.npsWidget).toBeNull();
    });

    it('restores csat and nps drafts from the current dashboard', () => {
      mockFindWidgetBySource.mockImplementation((source: string) => {
        if (source === 'conversations.csat') return { uuid: 'csat' };
        if (source === 'conversations.nps') return { uuid: 'nps' };
        return undefined;
      });

      store.restoreWidgetsFromDashboard();

      expect(store.csatWidget).toEqual({ uuid: 'csat' });
      expect(store.npsWidget).toEqual({ uuid: 'nps' });

      mockFindWidgetBySource.mockReturnValue(undefined);
      store.restoreWidgetsFromDashboard();

      expect(store.csatWidget).toBeNull();
      expect(store.npsWidget).toBeNull();
    });
  });

  describe('loadSalesFunnelWidgetData', () => {
    const funnel = { total_orders: 2, currency: 'BRL' };

    it('stores mock data without looking up the dashboard widget', async () => {
      conversationalState.shouldUseMock = true;
      mockGetSalesFunnelData.mockResolvedValue(funnel);

      await store.loadSalesFunnelWidgetData();

      expect(mockGetSalesFunnelData).toHaveBeenCalledWith({}, { mock: true });
      expect(mockFindWidgetBySource).not.toHaveBeenCalled();
      expect(store.salesFunnelWidgetData).toEqual(funnel);
      expect(store.isLoadingSalesFunnelWidgetData).toBe(false);
    });

    it('stores data for the configured widget', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'funnel-uuid' });
      mockGetSalesFunnelData.mockResolvedValue(funnel);

      await store.loadSalesFunnelWidgetData();

      expect(mockFindWidgetBySource).toHaveBeenCalledWith(
        'conversations.sales_funnel',
      );
      expect(mockGetSalesFunnelData).toHaveBeenCalledWith(
        { widget_uuid: 'funnel-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.salesFunnelWidgetData).toEqual(funnel);
      expect(store.isLoadingSalesFunnelWidgetData).toBe(false);
    });

    it('sets error state when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);

      await store.loadSalesFunnelWidgetData();

      expect(store.salesFunnelWidgetData).toBeNull();
      expect(store.isSalesFunnelWidgetDataError).toBe(true);
      expect(store.isLoadingSalesFunnelWidgetData).toBe(false);
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'funnel-uuid' });
      mockGetSalesFunnelData.mockRejectedValue(new Error('boom'));

      await store.loadSalesFunnelWidgetData();

      expect(store.salesFunnelWidgetData).toBeNull();
      expect(store.isSalesFunnelWidgetDataError).toBe(true);
    });

    it('ignores an aborted request and keeps the latest response', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'funnel-uuid' });
      let resolveSecond: (_value: unknown) => void = () => {};

      mockGetSalesFunnelData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
        );

      const firstLoad = store.loadSalesFunnelWidgetData();
      const secondLoad = store.loadSalesFunnelWidgetData();

      resolveSecond(funnel);
      await Promise.all([firstLoad, secondLoad]);

      expect(store.salesFunnelWidgetData).toEqual(funnel);
      expect(store.isSalesFunnelWidgetDataError).toBe(false);
      expect(store.isLoadingSalesFunnelWidgetData).toBe(false);
    });
  });

  describe('loadCsatWidgetData', () => {
    const csat = { results: [{ label: '5', value: 1, full_value: 1 }] };

    it('stores mock data for the selected response type', async () => {
      conversationalState.shouldUseMock = true;
      store.setCsatWidgetType('HUMAN');
      mockGetCsatData.mockResolvedValue(csat);

      await store.loadCsatWidgetData();

      expect(mockGetCsatData).toHaveBeenCalledWith('HUMAN', {}, { mock: true });
      expect(store.csatWidgetData).toEqual(csat);
      expect(store.isLoadingCsatWidgetData).toBe(false);
    });

    it('stores data and clears a previous error', async () => {
      store.isCsatWidgetDataError = true;
      store.setCsatWidgetType('AI');
      mockFindWidgetBySource.mockReturnValue({ uuid: 'csat-uuid' });
      mockGetCsatData.mockResolvedValue(csat);

      await store.loadCsatWidgetData();

      expect(mockGetCsatData).toHaveBeenCalledWith(
        'AI',
        { widget_uuid: 'csat-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.csatWidgetData).toEqual(csat);
      expect(store.isCsatWidgetDataError).toBe(false);
      expect(store.isLoadingCsatWidgetData).toBe(false);
    });

    it('sets error state when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);

      await store.loadCsatWidgetData();

      expect(store.csatWidgetData).toEqual({ results: [] });
      expect(store.isCsatWidgetDataError).toBe(true);
      expect(store.isLoadingCsatWidgetData).toBe(false);
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'csat-uuid' });
      mockGetCsatData.mockRejectedValue(new Error('boom'));

      await store.loadCsatWidgetData();

      expect(store.csatWidgetData).toEqual({ results: [] });
      expect(store.isCsatWidgetDataError).toBe(true);
    });

    it('ignores an aborted request and keeps the latest response', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'csat-uuid' });
      let resolveSecond: (_value: unknown) => void = () => {};

      mockGetCsatData
        .mockImplementationOnce(
          (_type: unknown, _params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
        );

      const firstLoad = store.loadCsatWidgetData();
      const secondLoad = store.loadCsatWidgetData();

      resolveSecond(csat);
      await Promise.all([firstLoad, secondLoad]);

      expect(store.csatWidgetData).toEqual(csat);
      expect(store.isCsatWidgetDataError).toBe(false);
      expect(store.isLoadingCsatWidgetData).toBe(false);
    });
  });

  describe('loadNpsWidgetData', () => {
    const nps = { total_responses: 8, score: 40 };

    it('stores mock data for the selected response type', async () => {
      conversationalState.shouldUseMock = true;
      store.setNpsWidgetType('HUMAN');
      mockGetNpsData.mockResolvedValue(nps);

      await store.loadNpsWidgetData();

      expect(mockGetNpsData).toHaveBeenCalledWith('HUMAN', {}, { mock: true });
      expect(store.npsWidgetData).toEqual(nps);
      expect(store.isLoadingNpsWidgetData).toBe(false);
    });

    it('stores data and clears a previous error', async () => {
      store.isNpsWidgetDataError = true;
      mockFindWidgetBySource.mockReturnValue({ uuid: 'nps-uuid' });
      mockGetNpsData.mockResolvedValue(nps);

      await store.loadNpsWidgetData();

      expect(mockFindWidgetBySource).toHaveBeenCalledWith('conversations.nps');
      expect(mockGetNpsData).toHaveBeenCalledWith(
        'AI',
        { widget_uuid: 'nps-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.npsWidgetData).toEqual(nps);
      expect(store.isNpsWidgetDataError).toBe(false);
    });

    it('sets error state when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);

      await store.loadNpsWidgetData();

      expect(store.npsWidgetData).toEqual({ total_responses: 0 });
      expect(store.isNpsWidgetDataError).toBe(true);
      expect(store.isLoadingNpsWidgetData).toBe(false);
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'nps-uuid' });
      mockGetNpsData.mockRejectedValue(new Error('boom'));

      await store.loadNpsWidgetData();

      expect(store.npsWidgetData).toEqual({ total_responses: 0 });
      expect(store.isNpsWidgetDataError).toBe(true);
    });

    it('ignores an aborted request and keeps the latest response', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'nps-uuid' });
      let resolveSecond: (_value: unknown) => void = () => {};

      mockGetNpsData
        .mockImplementationOnce(
          (_type: unknown, _params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
        );

      const firstLoad = store.loadNpsWidgetData();
      const secondLoad = store.loadNpsWidgetData();

      resolveSecond(nps);
      await Promise.all([firstLoad, secondLoad]);

      expect(store.npsWidgetData).toEqual(nps);
      expect(store.isNpsWidgetDataError).toBe(false);
      expect(store.isLoadingNpsWidgetData).toBe(false);
    });
  });

  describe('saveNewWidget', () => {
    it('keeps AI and human config when both forms are enabled', async () => {
      store.isFormAi = true;
      store.isFormHuman = true;
      mockSaveNewWidget.mockResolvedValue(undefined);
      vi.spyOn(store, 'loadCsatWidgetData').mockResolvedValue(undefined);
      store.newWidget = {
        uuid: 'temp',
        source: 'conversations.csat',
        config: {
          datalake_config: { agent_uuid: 'agent' },
          filter: { flow: 'flow' },
          op_field: 'field',
        },
      } as never;

      await store.saveNewWidget();

      const savedWidget = mockSaveNewWidget.mock.calls[0][0];
      expect(savedWidget.uuid).toBeUndefined();
      expect(savedWidget.position).toEqual([]);
      expect(savedWidget.config).toEqual({
        datalake_config: { agent_uuid: 'agent' },
        filter: { flow: 'flow' },
        op_field: 'field',
      });
      expect(store.newWidget).toBeNull();
      expect(unnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'alert_added',
          type: 'success',
          seconds: 5,
        },
      });
    });

    it.each([
      ['conversations.nps', 'loadNpsWidgetData'],
      ['conversations.csat', 'loadCsatWidgetData'],
      ['conversations.sales_funnel', 'loadSalesFunnelWidgetData'],
    ] as const)('reloads data after saving %s', async (source, reloader) => {
      mockSaveNewWidget.mockResolvedValue(undefined);
      const loadSpy = vi.spyOn(store, reloader).mockResolvedValue(undefined);
      store.newWidget = {
        uuid: '',
        source,
        config: {},
      } as never;

      await store.saveNewWidget();

      expect(loadSpy).toHaveBeenCalled();
      expect(mockGetCurrentDashboardWidgets).toHaveBeenCalled();
    });

    it('logs the error and keeps the draft when saving fails', async () => {
      store.newWidget = {
        uuid: 'temp',
        source: 'conversations.csat',
        config: {},
      } as never;
      mockSaveNewWidget.mockRejectedValue(new Error('save failed'));

      await store.saveNewWidget();

      expect(console.error).toHaveBeenCalled();
      expect(store.isLoadingSaveNewWidget).toBe(false);
      expect(store.newWidget).not.toBeNull();
    });
  });

  describe('updateConversationalWidget', () => {
    const draft = {
      uuid: 'widget',
      config: {
        filter: { flow: 'flow' },
        op_field: 'field',
        datalake_config: { agent_uuid: 'agent' },
      },
    };

    it('updates csat and reloads its data when both forms stay enabled', async () => {
      store.isFormAi = true;
      store.isFormHuman = true;
      store.csatWidget = { ...draft } as never;
      mockUpdateWidget.mockResolvedValue(undefined);
      const loadSpy = vi
        .spyOn(store, 'loadCsatWidgetData')
        .mockResolvedValue(undefined);

      await store.updateConversationalWidget('csat');

      expect(mockUpdateWidget).toHaveBeenCalledWith({
        widget: expect.objectContaining({
          config: draft.config,
        }),
      });
      expect(mockGetCurrentDashboardWidgets).toHaveBeenCalled();
      expect(loadSpy).toHaveBeenCalled();
      expect(unnnicCallAlert).toHaveBeenCalledWith({
        props: {
          text: 'alert_edited',
          type: 'success',
          seconds: 5,
        },
      });
      expect(store.isLoadingUpdateWidget).toBe(false);
    });

    it('clears human and AI config when both forms are disabled', async () => {
      store.csatWidget = { ...draft } as never;
      mockUpdateWidget.mockResolvedValue(undefined);
      vi.spyOn(store, 'loadCsatWidgetData').mockResolvedValue(undefined);

      await store.updateConversationalWidget('csat');

      expect(mockUpdateWidget).toHaveBeenCalledWith({
        widget: expect.objectContaining({
          config: {
            filter: {},
            op_field: '',
            datalake_config: {},
          },
        }),
      });
    });

    it('reloads nps data when the nps widget is updated', async () => {
      store.isFormAi = true;
      store.isFormHuman = true;
      store.npsWidget = { ...draft } as never;
      mockUpdateWidget.mockResolvedValue(undefined);
      const loadSpy = vi
        .spyOn(store, 'loadNpsWidgetData')
        .mockResolvedValue(undefined);

      await store.updateConversationalWidget('nps');

      expect(loadSpy).toHaveBeenCalled();
    });

    it('logs the error when the update fails', async () => {
      store.isFormAi = true;
      store.isFormHuman = true;
      store.csatWidget = { ...draft } as never;
      mockUpdateWidget.mockRejectedValue(new Error('update failed'));

      await store.updateConversationalWidget('csat');

      expect(console.error).toHaveBeenCalled();
      expect(store.isLoadingUpdateWidget).toBe(false);
    });
  });

  describe('isEnabledSaveNewWidget', () => {
    const config = {
      datalake_config: { agent_uuid: 'agent' },
      filter: { flow: 'flow' },
      op_field: 'field',
    };

    it('is enabled when the AI form has an agent', () => {
      store.isFormAi = true;
      store.newWidget = { config } as never;

      expect(store.isEnabledSaveNewWidget).toBe(true);
    });

    it('is enabled when the human form has a flow and an op field', () => {
      store.isFormHuman = true;
      store.newWidget = { config } as never;

      expect(store.isEnabledSaveNewWidget).toBe(true);
    });

    it('is disabled when the selected form is incomplete or both forms are off', () => {
      store.isFormAi = true;
      store.newWidget = {
        config: {
          datalake_config: { agent_uuid: '' },
          filter: { flow: 'flow' },
          op_field: 'field',
        },
      } as never;
      expect(store.isEnabledSaveNewWidget).toBe(false);

      store.isFormAi = false;
      store.isFormHuman = true;
      store.newWidget = {
        config: {
          datalake_config: { agent_uuid: 'agent' },
          filter: { flow: 'flow' },
          op_field: '',
        },
      } as never;
      expect(store.isEnabledSaveNewWidget).toBe(false);

      store.isFormHuman = false;
      store.newWidget = { config } as never;
      expect(store.isEnabledSaveNewWidget).toBe(false);
    });
  });

  describe('isEnabledUpdateWidgetCsat and isEnabledUpdateWidgetNps', () => {
    const fullConfig = {
      datalake_config: { agent_uuid: 'agent-1' },
      filter: { flow: 'flow-1' },
      op_field: 'field-1',
    };

    const cases = [
      {
        getter: 'isEnabledUpdateWidgetCsat',
        source: 'conversations.csat',
        stateKey: 'csatWidget',
      },
      {
        getter: 'isEnabledUpdateWidgetNps',
        source: 'conversations.nps',
        stateKey: 'npsWidget',
      },
    ] as const;

    const assignWidgets = (
      source: string,
      stateKey: 'csatWidget' | 'npsWidget',
      dashboardConfig: Record<string, unknown> | undefined,
      stateConfig: Record<string, unknown> | null,
      dashboardMissing = false,
    ) => {
      mockFindWidgetBySource.mockImplementation((requested: string) => {
        if (requested !== source || dashboardMissing) return undefined;
        return { uuid: 'dashboard', source, config: dashboardConfig };
      });
      store[stateKey] = (
        stateConfig === null
          ? null
          : { uuid: 'draft', source, config: stateConfig }
      ) as never;
    };

    it.each(cases)(
      '$getter is disabled without a dashboard widget or a draft',
      ({ getter, source, stateKey }) => {
        assignWidgets(source, stateKey, fullConfig, fullConfig, true);
        expect(store[getter]).toBe(false);

        assignWidgets(source, stateKey, fullConfig, null);
        expect(store[getter]).toBe(false);
      },
    );

    it.each(cases)(
      '$getter is disabled when either config is missing',
      ({ getter, source, stateKey }) => {
        store.isFormAi = true;
        assignWidgets(source, stateKey, undefined, fullConfig);
        expect(store[getter]).toBe(false);

        assignWidgets(source, stateKey, fullConfig, null);
        store[stateKey] = { uuid: 'draft', config: undefined } as never;
        expect(store[getter]).toBe(false);
      },
    );

    it.each(cases)(
      '$getter allows clearing both forms when the dashboard had a config',
      ({ getter, source, stateKey }) => {
        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: { agent_uuid: '' },
          filter: { flow: '' },
          op_field: '',
        });

        expect(store[getter]).toBe(true);
      },
    );

    it.each(cases)(
      '$getter is enabled when the AI agent changes and the draft is valid',
      ({ getter, source, stateKey }) => {
        store.isFormAi = true;
        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: { agent_uuid: 'agent-2' },
          filter: { flow: '' },
          op_field: '',
        });

        expect(store[getter]).toBe(true);
      },
    );

    it.each(cases)(
      '$getter is disabled when only the AI form is on and the agent is empty',
      ({ getter, source, stateKey }) => {
        store.isFormAi = true;
        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: {},
          filter: { flow: 'flow-1' },
          op_field: 'field-1',
        });

        expect(store[getter]).toBe(false);
      },
    );

    it.each(cases)(
      '$getter follows human flow and op field changes',
      ({ getter, source, stateKey }) => {
        store.isFormHuman = true;
        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: { agent_uuid: '' },
          filter: { flow: 'flow-2' },
          op_field: 'field-1',
        });
        expect(store[getter]).toBe(true);

        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: { agent_uuid: '' },
          filter: { flow: 'flow-1' },
          op_field: 'field-2',
        });
        expect(store[getter]).toBe(true);

        const unchangedHumanConfig = {
          datalake_config: { agent_uuid: '' },
          filter: { flow: 'flow-1' },
          op_field: 'field-1',
        };
        assignWidgets(
          source,
          stateKey,
          unchangedHumanConfig,
          unchangedHumanConfig,
        );
        expect(store[getter]).toBe(false);
      },
    );

    it.each(cases)(
      '$getter requires both configs when AI and human forms are enabled',
      ({ getter, source, stateKey }) => {
        store.isFormAi = true;
        store.isFormHuman = true;
        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: { agent_uuid: 'agent-2' },
          filter: { flow: '' },
          op_field: '',
        });
        expect(store[getter]).toBe(false);

        assignWidgets(source, stateKey, fullConfig, {
          datalake_config: { agent_uuid: 'agent-2' },
          filter: { flow: 'flow-2' },
          op_field: 'field-2',
        });
        expect(store[getter]).toBe(true);
      },
    );

    it.each(cases)(
      '$getter treats an empty op field as an incomplete human config',
      ({ getter, source, stateKey }) => {
        store.isFormHuman = true;
        assignWidgets(
          source,
          stateKey,
          { ...fullConfig, op_field: '' },
          {
            datalake_config: { agent_uuid: '' },
            filter: { flow: 'flow-2' },
            op_field: '',
          },
        );

        expect(store[getter]).toBe(false);
      },
    );
  });

  describe('dashboard widget getters', () => {
    it('returns only nps and csat widgets from the dashboard', () => {
      currentDashboardWidgets.value = [
        { source: 'conversations.nps' },
        { source: 'conversations.csat' },
        { source: 'conversations.sales_funnel' },
      ];

      expect(store.getDynamicWidgets).toEqual([
        { source: 'conversations.nps' },
        { source: 'conversations.csat' },
      ]);
    });

    it('merges loaded data into the current nps and csat widgets', () => {
      store.npsWidgetData = { total_responses: 3 } as never;
      store.csatWidgetData = { results: [] };
      mockFindWidgetBySource.mockImplementation((source: string) => {
        if (source === 'conversations.nps') return { uuid: 'nps', source };
        if (source === 'conversations.csat') return { uuid: 'csat', source };
        return undefined;
      });

      expect(store.currentNpsWidget).toEqual({
        uuid: 'nps',
        source: 'conversations.nps',
        data: { total_responses: 3 },
      });
      expect(store.currentCsatWidget).toEqual({
        uuid: 'csat',
        source: 'conversations.csat',
        data: { results: [] },
      });

      mockFindWidgetBySource.mockReturnValue(undefined);
      store.npsWidgetData = null;
      store.csatWidgetData = null;
      expect(store.currentNpsWidget).toBeNull();
      expect(store.currentCsatWidget).toBeNull();
    });

    it.each([
      ['isNpsConfigured', 'conversations.nps'],
      ['isCsatConfigured', 'conversations.csat'],
      ['isSalesFunnelConfigured', 'conversations.sales_funnel'],
      [
        'isAbandonedCartRecoveryConfigured',
        'conversations.abandoned_cart_recovery',
      ],
    ] as const)('%s reflects whether the widget exists', (getter, source) => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      expect(store[getter]).toBe(false);

      mockFindWidgetBySource.mockImplementation((requested: string) =>
        requested === source ? { uuid: 'widget' } : undefined,
      );
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store[getter]).toBe(true);
    });

    it('detects AI and human configuration for nps and csat', () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      expect(store.isNpsAiConfig).toBe(false);
      expect(store.isNpsHumanConfig).toBe(false);
      expect(store.isCsatAiConfig).toBe(false);
      expect(store.isCsatHumanConfig).toBe(false);

      mockFindWidgetBySource.mockImplementation((source: string) => ({
        uuid: source,
        config: {
          datalake_config: { agent_uuid: '' },
          filter: { flow: 'flow' },
        },
      }));
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store.isNpsAiConfig).toBe(false);
      expect(store.isNpsHumanConfig).toBe(false);
      expect(store.isCsatAiConfig).toBe(false);
      expect(store.isCsatHumanConfig).toBe(false);

      mockFindWidgetBySource.mockImplementation((source: string) => ({
        uuid: source,
        config: {
          datalake_config: { agent_uuid: 'agent' },
          filter: { flow: 'flow' },
          op_field: 'field',
        },
      }));
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store.isNpsAiConfig).toBe(true);
      expect(store.isNpsHumanConfig).toBe(true);
      expect(store.isCsatAiConfig).toBe(true);
      expect(store.isCsatHumanConfig).toBe(true);
    });

    it('enables agent invocation only on a conversational dashboard', () => {
      dashboardState.currentDashboard = {
        config: { type: 'conversational', show_agent_invocation: true },
      };
      expect(store.isAgentInvocationConfigured).toBe(true);

      dashboardState.currentDashboard = {
        config: { type: 'commerce', show_agent_invocation: true },
      };
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store.isAgentInvocationConfigured).toBe(false);

      dashboardState.currentDashboard = {
        config: { type: 'conversational', show_agent_invocation: false },
      };
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store.isAgentInvocationConfigured).toBe(false);
    });

    it('enables tool result only on a conversational dashboard', () => {
      dashboardState.currentDashboard = {
        config: { type: 'conversational', show_tool_result: true },
      };
      expect(store.isToolResultConfigured).toBe(true);

      dashboardState.currentDashboard = {
        config: { type: 'commerce', show_tool_result: true },
      };
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store.isToolResultConfigured).toBe(false);

      dashboardState.currentDashboard = {
        config: { type: 'conversational', show_tool_result: false },
      };
      setActivePinia(createPinia());
      store = useConversationalWidgets();
      expect(store.isToolResultConfigured).toBe(false);
    });
  });
});
