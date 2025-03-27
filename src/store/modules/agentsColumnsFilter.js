const STORAGE_KEY = 'agents_columns_filter';
const STATIC_COLUMNS = ['status', 'agent', 'in_progress', 'closeds'];

export default {
  namespaced: true,

  state: {
    visibleColumns: [],
    lastAppliedFilters: null,
    hasInitialized: false,
  },

  getters: {
    hasVisibleColumns: (state) => state.visibleColumns.length > 0,
    dynamicColumns: (state) => state.visibleColumns.filter(col => !STATIC_COLUMNS.includes(col)),
    allVisibleColumns: (state) => [...STATIC_COLUMNS, ...state.visibleColumns.filter(col => !STATIC_COLUMNS.includes(col))],
  },

  mutations: {
    SET_VISIBLE_COLUMNS(state, columns) {
      if (!Array.isArray(columns)) return;
      
      const uniqueColumns = [...new Set(columns)].filter(col => 
        !STATIC_COLUMNS.includes(col) && typeof col === 'string'
      );
      state.visibleColumns = uniqueColumns;
    },

    CLEAR_VISIBLE_COLUMNS(state) {
      state.visibleColumns = [];
    },

    TOGGLE_COLUMN(state, columnName) {
      if (STATIC_COLUMNS.includes(columnName)) return;
      
      const index = state.visibleColumns.indexOf(columnName);
      if (index === -1) {
        state.visibleColumns.push(columnName);
      } else {
        state.visibleColumns.splice(index, 1);
      }
    },

    INITIALIZE_FROM_STORAGE(state) {
      const storedColumns = localStorage.getItem(STORAGE_KEY);
      if (storedColumns) {
        try {
          const parsedColumns = JSON.parse(storedColumns);

          state.visibleColumns = parsedColumns.filter(col => !STATIC_COLUMNS.includes(col));
        } catch (error) {
          console.error('Error parsing stored columns:', error);
          state.visibleColumns = [];
        }
      }
      state.hasInitialized = true;
    },

    SET_LAST_APPLIED_FILTERS(state, filters) {
      state.lastAppliedFilters = filters;
    },

    SET_INITIALIZED(state, value) {
      state.hasInitialized = value;
    },
  },

  actions: {
    setVisibleColumns({ commit, state }, columns) {
      if (!Array.isArray(columns)) return;
      
      commit('SET_VISIBLE_COLUMNS', columns);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.visibleColumns));
    },

    clearVisibleColumns({ commit }) {
      commit('CLEAR_VISIBLE_COLUMNS');
      localStorage.removeItem(STORAGE_KEY);
    },

    toggleColumn({ commit, state }, columnName) {
      if (typeof columnName !== 'string' || STATIC_COLUMNS.includes(columnName)) return;
      
      commit('TOGGLE_COLUMN', columnName);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.visibleColumns));
    },

    initializeFromStorage({ commit }) {
      commit('INITIALIZE_FROM_STORAGE');
    },

    updateLastAppliedFilters({ commit }, filters) {
      commit('SET_LAST_APPLIED_FILTERS', filters);
    },

    setInitialized({ commit }, value) {
      commit('SET_INITIALIZED', value);
    },
  },
};
