import { defineStore } from 'pinia';

export const useExportData = defineStore('exportData', {
  state: () => ({
    isRenderExportData: false,
  }),

  actions: {
    setIsRenderExportData(isRenderExportData: boolean) {
      this.isRenderExportData = isRenderExportData;
    },
  },
});