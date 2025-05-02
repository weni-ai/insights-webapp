import { defineStore } from 'pinia';
import { useConfig } from './config';

const STORAGE_KEY = 'agents_columns_filter';
const STATIC_COLUMNS = ['status', 'agent'];

export const useAgentsColumnsFilter = defineStore('agentsColumnsFilter', {
  state: () => ({
    visibleColumns: [],
    lastAppliedFilters: null,
    hasInitialized: false,
  }),
  actions: {
    setVisibleColumns(columns: any[]) {
      if (!Array.isArray(columns)) return;
      this.visibleColumns = [...new Set(columns)].filter(
        (column: string) =>
          !STATIC_COLUMNS.includes(column) && typeof column === 'string',
      );

      const storageKey = this.getStorageKey;
      localStorage.setItem(storageKey, JSON.stringify(this.visibleColumns));
    },
    clearVisibleColumns() {
      this.visibleColumns = [];
      const storageKey = this.getStorageKey;
      localStorage.removeItem(storageKey);
    },
    handleToggleColumn(columnName: string) {
      if (STATIC_COLUMNS.includes(columnName)) return;

      const index = this.visibleColumns.indexOf(columnName);
      if (index === -1) {
        this.visibleColumns.push(columnName);
      } else {
        this.visibleColumns.splice(index, 1);
      }
    },
    toggleColumn(columnName: string) {
      if (typeof columnName !== 'string' || STATIC_COLUMNS.includes(columnName))
        return;

      this.handleToggleColumn(columnName);
      const storageKey = this.getStorageKey;
      localStorage.setItem(storageKey, JSON.stringify(this.visibleColumns));
    },
    initializeFromStorage() {
      const configStore = useConfig();
      const projectUuid =
        configStore.project?.uuid || localStorage.getItem('projectUuid');

      const storedColumns = localStorage.getItem(
        `${STORAGE_KEY}_${projectUuid}`,
      );

      if (storedColumns) {
        try {
          const parsedColumns = JSON.parse(storedColumns);
          this.visibleColumns = parsedColumns.filter(
            (column) => !STATIC_COLUMNS.includes(column),
          );
        } catch (error) {
          console.error('Error parsing stored columns:', error);
          this.visibleColumns = [];
        }
      }
      this.hasInitialized = true;
    },
    updateLastAppliedFilters(filters) {
      this.lastAppliedFilters = filters;
    },
    setInitialized(value) {
      this.hasInitialized = value;
    },
  },
  getters: {
    hasVisibleColumns: (state) => state.visibleColumns.length > 0,
    dynamicColumns: (state) =>
      state.visibleColumns.filter((column) => !STATIC_COLUMNS.includes(column)),
    allVisibleColumns: (state) => [
      ...STATIC_COLUMNS,
      ...state.visibleColumns.filter(
        (column) => !STATIC_COLUMNS.includes(column),
      ),
    ],
    getStorageKey: () => {
      const configStore = useConfig();
      const projectUuid =
        configStore.project?.uuid || localStorage.getItem('projectUuid');
      return projectUuid ? `${STORAGE_KEY}_${projectUuid}` : STORAGE_KEY;
    },
  },
});
