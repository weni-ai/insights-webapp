import { defineStore } from 'pinia';

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
