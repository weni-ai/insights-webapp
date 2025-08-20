import { ModelFields } from '@/services/api/resources/export/export';
import { defineStore } from 'pinia';

interface SelectedFields {
  [modelName: string]: string[];
}
interface DateRange {
  start_date: string;
  end_date: string;
}

interface Filter {
  value: string;
  label: string;
}

interface ExportData {
  isRenderExportData: boolean;
  date_range: DateRange;
  open_chats: boolean;
  closed_chats: boolean;
  type: '.csv' | '.xlsx';
  export_data: object;
  accept_terms: boolean;
  sectors: Filter[];
  agents: Filter[];
  queues: Filter[];
  tags: Filter[];
  model_fields: ModelFields;
  selected_fields: SelectedFields;
}

export const useExportData = defineStore('exportData', {
  state: (): ExportData => ({
    isRenderExportData: false,
    date_range: {} as DateRange,
    open_chats: true,
    closed_chats: false,
    type: '.csv',
    export_data: {},
    accept_terms: false,
    sectors: [],
    agents: [],
    queues: [],
    tags: [],
    model_fields: {},
    selected_fields: {},
  }),

  actions: {
    setIsRenderExportData(isRenderExportData: boolean) {
      this.isRenderExportData = isRenderExportData;
    },
    setDateRange(start_date: string, end_date: string) {
      this.date_range.start_date = start_date;
      this.date_range.end_date = end_date;
    },
    setStatusChats(status: boolean) {
      this.open_chats = status;
      this.closed_chats = !status;
    },
    setType(type: string) {
      this.type = type;
    },
    setExportData(export_data: object) {
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
  },
});
