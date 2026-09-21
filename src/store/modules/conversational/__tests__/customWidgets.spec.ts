import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  useCustomWidgets,
  MOCK_CUSTOM_UUID,
  MOCK_CROSSTAB_UUID,
} from '../customWidgets';

const mockSaveNewWidget = vi.fn();
const mockUpdateWidget = vi.fn();
const mockDeleteWidget = vi.fn();
const mockGetCurrentDashboardWidgets = vi.fn();
const mockGetCustomWidgetData = vi.fn();
const mockGetCrosstabWidgetData = vi.fn();
const mockUnnnicCallAlert = vi.fn();

vi.mock('@/services/api/resources/widgets', () => ({
  default: {
    saveNewWidget: (...args: unknown[]) => mockSaveNewWidget(...args),
    updateWidget: (...args: unknown[]) => mockUpdateWidget(...args),
    deleteWidget: (...args: unknown[]) => mockDeleteWidget(...args),
  },
}));

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getCustomWidgetData: (...args: unknown[]) =>
      mockGetCustomWidgetData(...args),
    getCrosstabWidgetData: (...args: unknown[]) =>
      mockGetCrosstabWidgetData(...args),
  },
}));

vi.mock('@/store/modules/widgets', () => ({
  useWidgets: () => ({
    getCurrentDashboardWidgets: mockGetCurrentDashboardWidgets,
  }),
}));

vi.mock('@weni/unnnic-system', () => ({
  unnnicCallAlert: (...args: unknown[]) => mockUnnnicCallAlert(...args),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key: string, params?: Record<string, unknown>) =>
        params ? `${key}:${JSON.stringify(params)}` : key,
    },
  },
}));

describe('useCustomWidgets store', () => {
  let store: ReturnType<typeof useCustomWidgets>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useCustomWidgets();
    vi.clearAllMocks();
    mockGetCurrentDashboardWidgets.mockResolvedValue(undefined);
  });

  describe('setters and getters', () => {
    it('sets and updates custom widgets', () => {
      const widget = {
        uuid: 'w1',
        source: 'conversations.custom',
        data: { results: [] },
        config: { datalake_config: { agent_uuid: 'a', key: 'k' } },
      } as any;

      store.setCustomWidgets([widget]);
      expect(store.getCustomWidgets).toHaveLength(1);
      expect(store.getCustomWidgetByUuid('w1')).toEqual(widget);
      expect(store.getCustomWidgetByUuid('missing')).toBeNull();

      store.updateCustomWidget('w1', {
        results: [{ label: '1', value: 1 }],
      } as any);
      expect(store.getCustomWidgetByUuid('w1')?.data).toEqual({
        results: [{ label: '1', value: 1 }],
      });
    });

    it('manages form state and resetForms', () => {
      store.setCustomForm({
        agent_uuid: 'a1',
        agent_name: 'Agent',
        key: 'k1',
        widget_uuid: 'w1',
        widget_name: 'Custom',
      });
      store.setCustomFormAgent('a2', 'Agent 2');
      store.setCustomFormKey('k2');
      store.setCustomFormWidgetName('Renamed');

      expect(store.getCustomForm.agent_uuid).toBe('a2');
      expect(store.getCustomForm.key).toBe('k2');
      expect(store.getCustomForm.widget_name).toBe('Renamed');

      store.setCrosstabForm({
        reference_field: 'ref',
        widget_uuid: '',
        widget_name: 'Cross',
        key_a: 'a',
        field_name_a: 'A',
        key_b: 'b',
        field_name_b: 'B',
      });

      store.resetForms();
      expect(store.customForm).toEqual({});
      expect(store.crosstabForm).toEqual({});
      expect(store.absoluteNumbersForm).toEqual({});
    });

    it('evaluates enabled getters', () => {
      expect(store.isEnabledCreateCustomForm).toBe(false);
      store.setCustomFormAgent('agent', 'Agent');
      store.setCustomFormKey('key');
      expect(store.isEnabledCreateCustomForm).toBe(true);

      expect(store.isEnabledSaveCrosstabForm).toBe(false);
      store.setCrosstabForm({
        reference_field: 'ref',
        widget_uuid: '',
        widget_name: 'Cross',
        key_a: 'a',
        field_name_a: 'A',
        key_b: 'b',
        field_name_b: 'B',
      });
      expect(store.isEnabledSaveCrosstabForm).toBe(true);

      expect(store.isEnabledSaveAbsoluteNumbersForm).toBe(false);
      store.absoluteNumbersForm = {
        widget_uuid: '',
        name: 'Absolute',
        children: [
          {
            name: 'Child',
            config: {
              index: 1,
              agent_uuid: 'a',
              key: 'k',
              operation: 'sum',
              value_field_name: 'v',
              currency: { is_active: false, code: null },
            },
          },
        ],
      };
      expect(store.isEnabledSaveAbsoluteNumbersForm).toBe(true);
    });
  });

  describe('mount helpers', () => {
    it('mounts custom, crosstab and absolute numbers bodies', () => {
      store.setCustomForm({
        agent_uuid: 'agent',
        agent_name: 'Agent',
        key: 'event',
        widget_uuid: '',
        widget_name: 'Custom Widget',
      });
      expect(store._mountCustomWidgetBody()).toEqual(
        expect.objectContaining({
          source: 'conversations.custom',
          type: 'custom_widget',
          name: 'Custom Widget',
          uuid: undefined,
        }),
      );

      store.setCrosstabForm({
        reference_field: 'ref',
        widget_uuid: 'cx-1',
        widget_name: 'Crosstab',
        key_a: 'a',
        field_name_a: 'A',
        key_b: 'b',
        field_name_b: 'B',
      });
      expect(store._mountCrosstabWidgetBody()).toEqual(
        expect.objectContaining({
          uuid: 'cx-1',
          type: 'conversations.crosstab',
          source: 'conversations.crosstab',
        }),
      );

      store.absoluteNumbersForm = {
        widget_uuid: '',
        name: 'Abs',
        children: [
          {
            name: 'Child',
            config: {
              index: 0,
              agent_uuid: 'a',
              key: 'k',
              operation: 'sum',
              value_field_name: 'v',
              currency: { is_active: false, code: null },
            },
          },
        ],
      };
      expect(store._mountAbsoluteNumbersWidgetBody()).toEqual(
        expect.objectContaining({
          name: 'Abs',
          type: 'conversations.absolute_numbers',
        }),
      );
      expect(
        store._mountAbsoluteNumbersWidgetBodyChildren('parent-1')[0],
      ).toEqual(
        expect.objectContaining({
          parent: 'parent-1',
          config: expect.objectContaining({ index: 1 }),
        }),
      );
    });
  });

  describe('mock widgets', () => {
    it('injects mock widgets once and clears them', () => {
      store.injectMockWidgets();
      expect(store.customWidgets).toHaveLength(2);
      expect(store.getRealCustomWidgets).toHaveLength(0);

      store.injectMockWidgets();
      expect(store.customWidgets).toHaveLength(2);

      store.clearMockWidgets();
      expect(store.customWidgets).toHaveLength(0);
      expect(store.getCustomWidgetByUuid(MOCK_CUSTOM_UUID)).toBeNull();
      expect(store.getCustomWidgetByUuid(MOCK_CROSSTAB_UUID)).toBeNull();
    });
  });

  describe('saveCustomWidget', () => {
    it('creates a new custom widget and shows success alert', async () => {
      store.setCustomForm({
        agent_uuid: 'a',
        agent_name: 'Agent',
        key: 'k',
        widget_uuid: '',
        widget_name: 'New Custom',
      });
      mockSaveNewWidget.mockResolvedValue({ uuid: 'created' });

      await store.saveCustomWidget('custom');

      expect(mockSaveNewWidget).toHaveBeenCalled();
      expect(mockGetCurrentDashboardWidgets).toHaveBeenCalled();
      expect(mockUnnnicCallAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({ type: 'success' }),
        }),
      );
      expect(store.isLoadingSaveNewCustomWidget).toBe(false);
    });

    it('updates an existing crosstab widget', async () => {
      store.setCrosstabForm({
        reference_field: 'ref',
        widget_uuid: 'cx-1',
        widget_name: 'Edited',
        key_a: 'a',
        field_name_a: 'A',
        key_b: 'b',
        field_name_b: 'B',
      });
      store.customForm.widget_uuid = 'cx-1';
      mockUpdateWidget.mockResolvedValue(undefined);

      await store.saveCustomWidget('crosstab');

      expect(mockUpdateWidget).toHaveBeenCalled();
      expect(mockSaveNewWidget).not.toHaveBeenCalled();
    });

    it('handles save errors and clears loading', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockSaveNewWidget.mockRejectedValue(new Error('save failed'));
      store.setCustomForm({
        agent_uuid: 'a',
        agent_name: 'Agent',
        key: 'k',
        widget_uuid: '',
        widget_name: 'New',
      });

      await store.saveCustomWidget('custom');

      expect(consoleSpy).toHaveBeenCalled();
      expect(store.isLoadingSaveNewCustomWidget).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('saveAbsoluteNumbers', () => {
    it('creates parent and children widgets', async () => {
      store.absoluteNumbersForm = {
        widget_uuid: '',
        name: 'Absolute',
        children: [
          {
            name: 'Child A',
            config: {
              index: 0,
              agent_uuid: 'a',
              key: 'k',
              operation: 'sum',
              value_field_name: 'v',
              currency: { is_active: false, code: null },
            },
          },
          {
            uuid: 'child-existing',
            name: 'Child B',
            config: {
              index: 0,
              agent_uuid: 'a',
              key: 'k2',
              operation: 'avg',
              value_field_name: 'v',
              currency: { is_active: false, code: null },
            },
          },
        ],
      };
      mockSaveNewWidget.mockResolvedValue({ uuid: 'parent-1' });
      mockUpdateWidget.mockResolvedValue(undefined);

      await store.saveAbsoluteNumbers();

      expect(mockSaveNewWidget).toHaveBeenCalled();
      expect(mockUpdateWidget).toHaveBeenCalled();
      expect(mockGetCurrentDashboardWidgets).toHaveBeenCalled();
      expect(store.isLoadingSaveNewAbsoluteNumbersWidget).toBe(false);
    });

    it('updates existing absolute numbers parent', async () => {
      store.absoluteNumbersForm = {
        widget_uuid: 'abs-1',
        name: 'Absolute',
        children: [],
      };
      mockUpdateWidget.mockResolvedValue(undefined);

      await store.saveAbsoluteNumbers();

      expect(mockUpdateWidget).toHaveBeenCalled();
      expect(mockSaveNewWidget).not.toHaveBeenCalled();
    });

    it('handles absolute numbers save errors', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      store.absoluteNumbersForm = {
        widget_uuid: '',
        name: 'Absolute',
        children: [],
      };
      mockSaveNewWidget.mockRejectedValue(new Error('abs failed'));

      await store.saveAbsoluteNumbers();

      expect(consoleSpy).toHaveBeenCalled();
      expect(store.isLoadingSaveNewAbsoluteNumbersWidget).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('deleteCustomWidget', () => {
    it('deletes widget and refreshes dashboard widgets', async () => {
      mockDeleteWidget.mockResolvedValue(undefined);

      await store.deleteCustomWidget('w1');

      expect(mockDeleteWidget).toHaveBeenCalledWith('w1');
      expect(mockGetCurrentDashboardWidgets).toHaveBeenCalled();
      expect(store.isLoadingDeleteCustomWidget).toBe(false);
    });

    it('handles delete errors', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockDeleteWidget.mockRejectedValue(new Error('delete failed'));

      await store.deleteCustomWidget('w1');

      expect(consoleSpy).toHaveBeenCalled();
      expect(store.isLoadingDeleteCustomWidget).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('loadCustomWidgetData', () => {
    it('returns early when widget is not found', async () => {
      await store.loadCustomWidgetData('missing');
      expect(mockGetCustomWidgetData).not.toHaveBeenCalled();
    });

    it('loads custom widget data successfully', async () => {
      store.setCustomWidgets([
        {
          uuid: 'w1',
          source: 'conversations.custom',
          data: { results: [] },
          config: { datalake_config: { agent_uuid: '', key: '' } },
        } as any,
      ]);
      mockGetCustomWidgetData.mockResolvedValue({
        results: [{ label: '5', value: 1, full_value: 1 }],
      });

      await store.loadCustomWidgetData('w1');

      expect(mockGetCustomWidgetData).toHaveBeenCalledWith(
        { widget_uuid: 'w1' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.getIsLoadingByUuid('w1')).toBe(false);
      expect(store.customWidgetDataErrorByUuid.w1).toBe(false);
    });

    it('loads crosstab widget data', async () => {
      store.setCustomWidgets([
        {
          uuid: 'cx1',
          source: 'conversations.crosstab',
          data: { total_rows: 0, results: [] },
          config: {
            source_a: { key: '', field_name: '' },
            source_b: { key: '', field_name: '' },
          },
        } as any,
      ]);
      mockGetCrosstabWidgetData.mockResolvedValue({
        total_rows: 1,
        results: [],
      });

      await store.loadCustomWidgetData('cx1');

      expect(mockGetCrosstabWidgetData).toHaveBeenCalled();
    });

    it('stores error status when load fails', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      store.setCustomWidgets([
        {
          uuid: 'w1',
          source: 'conversations.custom',
          data: { results: [] },
          config: { datalake_config: { agent_uuid: '', key: '' } },
        } as any,
      ]);
      mockGetCustomWidgetData.mockRejectedValue({ status: 500 });

      await store.loadCustomWidgetData('w1');

      expect(store.customWidgetDataErrorByUuid.w1).toBe(500);
      expect(store.getIsLoadingByUuid('w1')).toBe(false);
      consoleSpy.mockRestore();
    });

    it('aborts previous request when called again', async () => {
      store.setCustomWidgets([
        {
          uuid: 'w1',
          source: 'conversations.custom',
          data: { results: [] },
          config: { datalake_config: { agent_uuid: '', key: '' } },
        } as any,
      ]);

      mockGetCustomWidgetData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockResolvedValueOnce({ results: [] });

      const first = store.loadCustomWidgetData('w1');
      await store.loadCustomWidgetData('w1');
      await first;

      expect(mockGetCustomWidgetData).toHaveBeenCalledTimes(2);
    });
  });
});
