import exportApi, {
  ExportRequest,
  ExportResponse,
  ModelFields,
} from '@/services/api/resources/export/export';
import i18n from '@/utils/plugins/i18n';
import { defaultAlert } from '@/utils/topics';
import { defineStore } from 'pinia';

interface SelectedFields {
  [modelName: string]: string[];
}
interface DateRange {
  start: string;
  end: string;
}

interface Filter {
  value: string;
  label: string;
}

interface ExportData {
  isRenderExportData: boolean;
  isRenderExportDataFeedback: boolean;
  date_range: DateRange;
  open_chats: boolean;
  closed_chats: boolean;
  type: '.csv' | '.xlsx';
  export_data: ExportResponse;
  accept_terms: boolean;
  sectors: Filter[];
  agents: Filter[];
  queues: Filter[];
  tags: Filter[];
  model_fields: ModelFields;
  selected_fields: SelectedFields;
  enabled_models: string[];
  isLoadingCreateExport: boolean;
  isLoadingCheckExportStatus: boolean;
}

export const useExportData = defineStore('exportData', {
  state: (): ExportData => ({
    isRenderExportData: false,
    isRenderExportDataFeedback: false,
    date_range: {} as DateRange,
    open_chats: true,
    closed_chats: false,
    type: '.xlsx',
    export_data: {} as ExportResponse,
    accept_terms: false,
    sectors: [],
    agents: [],
    queues: [],
    tags: [],
    model_fields: {},
    selected_fields: {},
    enabled_models: [],
    isLoadingCreateExport: false,
    isLoadingCheckExportStatus: false,
  }),

  actions: {
    setIsRenderExportData(isRenderExportData: boolean) {
      this.isRenderExportData = isRenderExportData;
    },
    setIsRenderExportDataFeedback(isRenderExportDataFeedback: boolean) {
      this.isRenderExportDataFeedback = isRenderExportDataFeedback;
    },
    setDateRange(start_date: string, end_date: string) {
      this.date_range.start = start_date;
      this.date_range.end = end_date;
    },
    setStatusChats(status: boolean) {
      this.open_chats = status;
      this.closed_chats = !status;
    },
    setType(type: string) {
      this.type = type;
    },
    setExportData(export_data: ExportResponse) {
      this.export_data = export_data;
    },
    setAcceptTerms(accept_terms: boolean) {
      this.accept_terms = accept_terms;
    },
    setSectors(sectors: Filter[]) {
      this.sectors = sectors;
    },
    setAgents(agents: Filter[]) {
      this.agents = agents;
    },
    setQueues(queues: Filter[]) {
      this.queues = queues;
    },
    setTags(tags: Filter[]) {
      this.tags = tags;
    },
    setModelFields(modelFields: ModelFields) {
      this.model_fields = modelFields;
    },
    setSelectedFields(selectedFields: SelectedFields) {
      this.selected_fields = selectedFields;
    },
    updateModelFieldSelection(
      modelName: string,
      fieldName: string,
      selected: boolean,
    ) {
      if (!this.selected_fields[modelName]) {
        this.selected_fields[modelName] = [];
      }

      if (selected) {
        if (!this.selected_fields[modelName].includes(fieldName)) {
          this.selected_fields[modelName].push(fieldName);
        }
      } else {
        this.selected_fields[modelName] = this.selected_fields[
          modelName
        ].filter((field) => field !== fieldName);
      }
    },
    toggleModelEnabled(modelName: string, enabled: boolean) {
      if (enabled) {
        if (!this.enabled_models.includes(modelName)) {
          this.enabled_models.push(modelName);
        }
      } else {
        this.enabled_models = this.enabled_models.filter(
          (model) => model !== modelName,
        );

        this.selected_fields[modelName] = [];
      }
    },
    async createExport() {
      this.isLoadingCreateExport = true;
      try {
        const exportData: Omit<ExportRequest, 'project_uuid'> = {
          start_date: this.date_range.start,
          end_date: this.date_range.end,
          open_chats: this.open_chats,
          closed_chats: this.closed_chats,
          type: this.type,
          sectors: {
            uuids: this.sectors.map((sector) => sector.value),
            fields: this.selected_fields?.sectors || [],
          },
          queues: {
            uuids: this.queues.map((queue) => queue.value),
            fields: this.selected_fields?.queues || [],
          },
          rooms: {
            uuids: [],
            fields: this.selected_fields?.rooms || [],
          },
          users: {
            uuids: this.agents.map((agent) => agent.value),
            fields: this.selected_fields?.users || [],
          },
          sector_tags: {
            uuids: this.tags.map((tag) => tag.value),
            fields: this.selected_fields?.sector_tags || [],
          },
          contacts: {
            uuids: [],
            fields: this.selected_fields?.contacts || [],
          },
        };

        const response = await exportApi.createExport(exportData);

        this.export_data = response;

        this.setIsRenderExportData(false);
        this.setIsRenderExportDataFeedback(true);
      } catch (error) {
        if (error?.status === 400) {
          defaultAlert(
            'error',
            i18n.global.t('export_data.error_pending_export'),
          );
        } else {
          defaultAlert('error', i18n.global.t('export_data.error_default'));
        }
        console.error('Error creating export', error);
      } finally {
        this.isLoadingCreateExport = false;
      }
    },
    async checkExportStatus() {
      this.isLoadingCheckExportStatus = true;
      try {
        const response = await exportApi.checkExportStatus();
        this.export_data = response;
      } catch (error) {
        console.error('Error checking export status', error);
      } finally {
        this.isLoadingCheckExportStatus = false;
      }
    },
  },
  getters: {
    hasEnabledToExport: (state) => {
      const isDateRange = state.date_range.start && state.date_range.end;
      const isOpenChatsOrClosedChats = state.open_chats || state.closed_chats;
      const isType = state.type;
      const isSectors = state.sectors.length > 0;
      const isEnabledModels = state.enabled_models.length > 0;

      return (
        isDateRange &&
        isOpenChatsOrClosedChats &&
        isType &&
        isSectors &&
        isEnabledModels &&
        state.accept_terms
      );
    },
  },
});
