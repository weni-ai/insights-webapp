import { defineStore } from 'pinia';

interface DateRange {
  start_date: string;
  end_date: string;
}

interface ExportData {
  isRenderExportData: boolean;
  date_range: DateRange;
  open_chats: boolean;
  closed_chats: boolean;
  type: '.csv' | '.xlsx';
  export_data: object;
  accept_terms: boolean;
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
  },
});
