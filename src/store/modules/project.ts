import Projects from '@/services/api/resources/projects';
import { parseValue } from '@/utils/object';
import { defineStore } from 'pinia';

export const useProject = defineStore('project', {
  state: () => ({
    isLoadedFlows: false,
    isLoadingFlows: false,
    flows: [],
    isCommerce: false,
  }),

  actions: {
    setIsCommerce(isCommerce) {
      this.isCommerce = isCommerce;
    },
    getProjectFlows() {
      this.isLoadingFlows = true;

      Projects.getProjectSource('flows')
        .then((response) => {
          const flows = response.map((source) => ({
            value: source.uuid,
            label: source.name,
            results: parseValue(source.metadata)?.results.map((result) => ({
              value: result.key,
              label: result.name,
            })),
          }));

          this.flows = flows;
          this.isLoadedFlows = true;
        })
        .finally(() => {
          this.isLoadingFlows = false;
        });
    },
  },
});
