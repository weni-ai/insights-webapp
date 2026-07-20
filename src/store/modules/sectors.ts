import { defineStore } from 'pinia';
import { registerStoreHMR } from '@/utils/hmr';

interface Sector {
  uuid: String;
  name: String;
}

export const useSectors = defineStore('sectors', {
  state: () => ({
    sectors: [] as Sector[],
  }),
  getters: {
    getSectorByUuid: (state) => {
      return (searchUuid: string) =>
        state.sectors.find((sector) => sector.uuid === searchUuid);
    },
  },
  actions: {
    updateSectors(sectors: Sector[]) {
      this.sectors = sectors;
    },
  },
});

registerStoreHMR(useSectors, import.meta.webpackHot);
