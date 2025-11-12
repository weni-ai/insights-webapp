import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConversationalExport } from '../export';
import exportApi from '@/services/api/resources/export/conversational/export';
import { defaultAlert } from '@/utils/topics';

vi.mock('@/utils/env', () => ({
  default: vi.fn(() => 'http://localhost:8000'),
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(() => ({
    project: { uuid: 'test-project-uuid' },
  })),
}));

vi.mock('@/services/api/resources/export/conversational/export');
vi.mock('@/utils/topics');
vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: { t: vi.fn((key) => key) },
  },
}));

describe('useConversationalExport', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversationalExport();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const expectedState = {
        isRenderExportData: false,
        isRenderExportDataFeedback: false,
        type: 'XLSX',
        accept_terms: false,
        isLoadingCreateExport: false,
        isLoadingCheckExportStatus: false,
      };

      Object.entries(expectedState).forEach(([key, value]) => {
        expect(store[key]).toBe(value);
      });

      ['enabled_models', 'sections', 'custom_widgets'].forEach((key) => {
        expect(store[key]).toEqual([]);
      });

      ['date_range', 'export_data', 'model_fields', 'selected_fields'].forEach(
        (key) => {
          expect(store[key]).toEqual({});
        },
      );
    });
  });

  describe('Actions - Setters', () => {
    const setterTests = [
      {
        method: 'setIsRenderExportData',
        args: [true],
        key: 'isRenderExportData',
        expected: true,
      },
      {
        method: 'setIsRenderExportDataFeedback',
        args: [true],
        key: 'isRenderExportDataFeedback',
        expected: true,
      },
      { method: 'setType', args: ['CSV'], key: 'type', expected: 'CSV' },
      {
        method: 'setExportData',
        args: [{ status: 'completed' }],
        key: 'export_data',
        expected: { status: 'completed' },
      },
      {
        method: 'setAcceptTerms',
        args: [true],
        key: 'accept_terms',
        expected: true,
      },
      {
        method: 'setSections',
        args: [['RESOLUTIONS', 'TRANSFERRED']],
        key: 'sections',
        expected: ['RESOLUTIONS', 'TRANSFERRED'],
      },
    ];

    setterTests.forEach(({ method, args, key, expected }) => {
      it(`should ${method}`, () => {
        store[method](...args);
        expect(store[key]).toEqual(expected);
      });
    });

    it('should set date range', () => {
      store.setDateRange('2024-01-01', '2024-01-31');
      expect(store.date_range).toEqual({
        start: '2024-01-01',
        end: '2024-01-31',
      });
    });
  });

  describe('Actions - Model Field Management', () => {
    beforeEach(() => {
      store.setModelFields({
        topics: { ai: { type: 'subsection' }, human: { type: 'subsection' } },
        resolutions: {},
      });
    });

    it('should update field selection', () => {
      store.updateModelFieldSelection('topics', 'ai', true);
      expect(store.selected_fields.topics).toContain('ai');

      store.updateModelFieldSelection('topics', 'ai', false);
      expect(store.selected_fields.topics).not.toContain('ai');
    });

    it('should toggle model enabled', () => {
      store.toggleModelEnabled('topics', true);
      expect(store.enabled_models).toContain('topics');
      expect(store.selected_fields.topics).toEqual(['ai', 'human']);

      store.toggleModelEnabled('topics', false);
      expect(store.enabled_models).not.toContain('topics');
      expect(store.selected_fields.topics).toEqual([]);
    });
  });

  describe('Actions - Custom Widgets', () => {
    it('should add custom widgets', () => {
      const widgets = [
        { uuid: 'widget-1', name: 'Widget 1' },
        { uuid: 'widget-2', name: 'Widget 2' },
      ];

      store.addCustomWidgets(widgets);

      expect(store.custom_widgets).toEqual(widgets);
      expect(store.model_fields['widget-1']).toEqual({});
      expect(store.model_fields['widget-2']).toEqual({});
    });

    it('should not add custom widgets if model_fields exceed 5', () => {
      store.setModelFields({
        field1: {},
        field2: {},
        field3: {},
        field4: {},
        field5: {},
        field6: {},
      });

      const widgets = [{ uuid: 'widget-1', name: 'Widget 1' }];
      store.addCustomWidgets(widgets);

      expect(store.custom_widgets).toEqual([]);
    });
  });

  describe('Actions - initializeDefaultFields', () => {
    it('should initialize default fields', async () => {
      const mockResponse = {
        sections: ['RESOLUTIONS', 'TOPICS_AI', 'TOPICS_HUMAN'],
        custom_widgets: ['widget-1'],
      };
      exportApi.getAvailableWidgets.mockResolvedValue(mockResponse);
      store.setModelFields({ 'widget-1': {} });

      await store.initializeDefaultFields();

      expect(store.model_fields.resolutions).toEqual({});
      expect(store.model_fields.topics).toEqual({
        ai: { type: 'subsection' },
        human: { type: 'subsection' },
      });
      expect(store.model_fields['widget-1']).toEqual({});
    });
  });

  describe('Actions - createExport', () => {
    beforeEach(() => {
      store.setDateRange('2024-01-01', '2024-01-31');
      store.setType('XLSX');
      store.enabled_models = ['resolutions', 'topics'];
      store.setSelectedFields({ topics: ['ai', 'human'] });
    });

    it('should create export successfully with sections', async () => {
      const mockResponse = { status: 'pending', email: 'test@example.com' };
      exportApi.createExport.mockResolvedValue(mockResponse);

      await store.createExport();

      const call = exportApi.createExport.mock.calls[0][0];
      ['RESOLUTIONS', 'TOPICS_AI', 'TOPICS_HUMAN'].forEach((section) => {
        expect(call.sections).toContain(section);
      });
      expect(store.export_data).toEqual(mockResponse);
      expect(store.isRenderExportDataFeedback).toBe(true);
    });

    it('should include custom widgets in export', async () => {
      exportApi.createExport.mockResolvedValue({ status: 'pending' });
      store.custom_widgets = [{ uuid: 'widget-1', name: 'Widget 1' }];
      store.enabled_models.push('widget-1');

      await store.createExport();

      expect(exportApi.createExport.mock.calls[0][0].custom_widgets).toContain(
        'widget-1',
      );
    });

    const errorTests = [
      {
        name: 'concurrent report',
        error: { status: 400, data: { concurrent_report: true } },
        alert: 'export_data.error_pending_export',
      },
      {
        name: 'specific error',
        error: { status: 400, data: { error: 'Custom error' } },
        alert: 'Custom error',
      },
      {
        name: 'generic error',
        error: new Error('Network error'),
        alert: 'export_data.error_default',
      },
    ];

    errorTests.forEach(({ name, error, alert }) => {
      it(`should handle ${name}`, async () => {
        exportApi.createExport.mockRejectedValue(error);
        await store.createExport();
        expect(defaultAlert).toHaveBeenCalledWith('error', alert);
      });
    });
  });

  describe('Actions - checkExportStatus', () => {
    it('should check export status successfully', async () => {
      exportApi.checkExportStatus.mockResolvedValue({ status: 'completed' });
      await store.checkExportStatus();
      expect(store.export_data.status).toBe('completed');
    });

    it('should handle error', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation();
      exportApi.checkExportStatus.mockRejectedValue(new Error('Network error'));
      await store.checkExportStatus();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Getters - hasEnabledToExport', () => {
    beforeEach(() => {
      store.setDateRange('2024-01-01', '2024-01-31');
      store.setType('XLSX');
      store.setAcceptTerms(true);
      store.enabled_models = ['resolutions'];
    });

    it('should return true when all conditions are met', () => {
      expect(store.hasEnabledToExport).toBe(true);
    });

    [
      { name: 'date range missing', fn: () => store.setDateRange('', '') },
      { name: 'models empty', fn: () => (store.enabled_models = []) },
      { name: 'terms not accepted', fn: () => store.setAcceptTerms(false) },
    ].forEach(({ name, fn }) => {
      it(`should return false when ${name}`, () => {
        fn();
        expect(store.hasEnabledToExport).toBeFalsy();
      });
    });

    it('should validate topics fields', () => {
      store.enabled_models = ['topics'];
      store.setSelectedFields({ topics: ['ai'] });
      expect(store.hasEnabledToExport).toBe(true);

      store.setSelectedFields({ topics: [] });
      expect(store.hasEnabledToExport).toBeFalsy();
    });
  });
});
