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
  type: string;
  export_data: object;
}

export const useExportData = defineStore('exportData', {
  state: (): ExportData => ({
    isRenderExportData: false,
    date_range: {} as DateRange,
    open_chats: true,
    closed_chats: false,
    type: 'csv',
    export_data: {},
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
  },
});
