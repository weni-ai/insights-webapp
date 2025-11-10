import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHumanSupportExport } from '../export';
import exportApi from '@/services/api/resources/export/humanSupport/export';
import { defaultAlert } from '@/utils/topics';

vi.mock('@/utils/env', () => ({
  default: vi.fn(() => 'http://localhost:8000'),
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(() => ({
    project: { uuid: 'test-project-uuid' },
  })),
}));

vi.mock('@/services/api/resources/export/humanSupport/export');
vi.mock('@/utils/topics');
vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: { t: vi.fn((key) => key) },
  },
}));

describe('useHumanSupportExport', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useHumanSupportExport();
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
        open_chats: true,
        closed_chats: false,
        type: '.xlsx',
        accept_terms: false,
        isLoadingCreateExport: false,
        isLoadingCheckExportStatus: false,
      };

      Object.entries(expectedState).forEach(([key, value]) => {
        expect(store[key]).toBe(value);
      });

      ['sectors', 'agents', 'queues', 'tags', 'enabled_models'].forEach(
        (key) => {
          expect(store[key]).toEqual([]);
        },
      );

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
      {
        method: 'setStatusChats',
        args: [true],
        key: 'open_chats',
        expected: true,
        additionalCheck: () => expect(store.closed_chats).toBe(false),
      },
      {
        method: 'setStatusChats',
        args: [false],
        key: 'open_chats',
        expected: false,
        additionalCheck: () => expect(store.closed_chats).toBe(true),
      },
      { method: 'setType', args: ['.csv'], key: 'type', expected: '.csv' },
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
        method: 'setSectors',
        args: [[{ value: '1', label: 'Sector 1' }]],
        key: 'sectors',
        expected: [{ value: '1', label: 'Sector 1' }],
      },
      {
        method: 'setAgents',
        args: [[{ value: '1', label: 'Agent 1' }]],
        key: 'agents',
        expected: [{ value: '1', label: 'Agent 1' }],
      },
      {
        method: 'setQueues',
        args: [[{ value: '1', label: 'Queue 1' }]],
        key: 'queues',
        expected: [{ value: '1', label: 'Queue 1' }],
      },
      {
        method: 'setTags',
        args: [[{ value: '1', label: 'Tag 1' }]],
        key: 'tags',
        expected: [{ value: '1', label: 'Tag 1' }],
      },
    ];

    setterTests.forEach(({ method, args, key, expected, additionalCheck }) => {
      it(`should ${method}`, () => {
        store[method](...args);
        expect(store[key]).toEqual(expected);
        additionalCheck?.();
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
        users: { name: { type: 'string' }, email: { type: 'string' } },
        agent_status_logs: { status: { type: 'string' } },
      });
    });

    it('should update field selection', () => {
      store.updateModelFieldSelection('users', 'name', true);
      expect(store.selected_fields.users).toContain('name');

      store.updateModelFieldSelection('users', 'name', false);
      expect(store.selected_fields.users).not.toContain('name');
    });

    it('should handle agent_status_logs field selection', () => {
      store.updateModelFieldSelection('agent_status_logs', 'status', true);
      expect(store.selected_fields.agent_status_logs).toContain('status');
    });

    it('should toggle model enabled', () => {
      store.toggleModelEnabled('users', true);
      expect(store.enabled_models).toContain('users');
      expect(store.selected_fields.users).toEqual(['name', 'email']);

      store.toggleModelEnabled('users', false);
      expect(store.enabled_models).not.toContain('users');
      expect(store.selected_fields.users).toEqual([]);
    });

    it('should handle agent_status_logs model toggle', () => {
      store.toggleModelEnabled('agent_status_logs', true);
      expect(store.enabled_models).toContain('agent_status_logs');
      expect(store.selected_fields.agent_status_logs).toEqual(['status']);
    });
  });

  describe('Actions - createExport', () => {
    beforeEach(() => {
      store.setDateRange('2024-01-01', '2024-01-31');
      store.setSectors([{ value: '1', label: 'Sector 1' }]);
      store.setSelectedFields({
        sectors: ['name'],
        agent_status_logs: ['status'],
      });
    });

    it('should create export successfully with agent_status_logs', async () => {
      const mockResponse = { status: 'pending', email: 'test@example.com' };
      exportApi.createExport.mockResolvedValue(mockResponse);

      await store.createExport();

      const call = exportApi.createExport.mock.calls[0][0];
      expect(call.agent_status_logs).toEqual({ uuids: [], fields: ['status'] });
      expect(store.export_data).toEqual(mockResponse);
      expect(store.isRenderExportDataFeedback).toBe(true);
    });

    const errorTests = [
      {
        name: 'should handle 400 error',
        error: { status: 400 },
        expectedAlert: 'export_data.error_pending_export',
      },
      {
        name: 'should handle generic error',
        error: new Error('Network error'),
        expectedAlert: 'export_data.error_default',
      },
    ];

    errorTests.forEach(({ name, error, expectedAlert }) => {
      it(name, async () => {
        exportApi.createExport.mockRejectedValue(error);
        await store.createExport();
        expect(defaultAlert).toHaveBeenCalledWith('error', expectedAlert);
        expect(store.isLoadingCreateExport).toBe(false);
      });
    });
  });

  describe('Actions - checkExportStatus', () => {
    it('should check export status successfully', async () => {
      const mockResponse = { status: 'completed' };
      exportApi.checkExportStatus.mockResolvedValue(mockResponse);

      await store.checkExportStatus();

      expect(store.export_data).toEqual(mockResponse);
      expect(store.isLoadingCheckExportStatus).toBe(false);
    });

    it('should handle error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
      exportApi.checkExportStatus.mockRejectedValue(new Error('Network error'));

      await store.checkExportStatus();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Getters - hasEnabledToExport', () => {
    beforeEach(() => {
      store.setDateRange('2024-01-01', '2024-01-31');
      store.setSectors([{ value: '1', label: 'Sector 1' }]);
      store.setAcceptTerms(true);
      store.enabled_models = ['users'];
    });

    it('should return true when all conditions are met', () => {
      expect(store.hasEnabledToExport).toBe(true);
    });

    const falseConditions = [
      {
        name: 'date range is missing',
        setup: () => store.setDateRange('', ''),
      },
      { name: 'sectors are empty', setup: () => store.setSectors([]) },
      {
        name: 'enabled models are empty',
        setup: () => (store.enabled_models = []),
      },
      { name: 'terms not accepted', setup: () => store.setAcceptTerms(false) },
    ];

    falseConditions.forEach(({ name, setup }) => {
      it(`should return false when ${name}`, () => {
        setup();
        expect(store.hasEnabledToExport).toBeFalsy();
      });
    });

    it('should work with agent_status_logs enabled', () => {
      store.enabled_models = ['agent_status_logs'];
      expect(store.hasEnabledToExport).toBe(true);
    });
  });
});
