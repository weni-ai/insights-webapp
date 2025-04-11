import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import agentsColumnsFilter from '@/store/modules/agentsColumnsFilter';

const STORAGE_KEY = 'agents_columns_filter';
const STATIC_COLUMNS = ['status', 'agent', 'in_progress', 'closeds'];

describe('agentsColumnsFilter module', () => {
  let localStorageMock;
  let state;
  let rootState;
  let getters;
  let commit;
  let projectUuid;

  beforeEach(() => {
    state = {
      visibleColumns: [],
      lastAppliedFilters: null,
      hasInitialized: false,
    };

    projectUuid = 'test-project-uuid';
    rootState = {
      config: {
        project: {
          uuid: projectUuid,
        },
      },
    };

    getters = {
      getStorageKey: `${STORAGE_KEY}_${projectUuid}`,
    };

    commit = vi.fn();

    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('state', () => {
    it('has the correct initial state', () => {
      expect(agentsColumnsFilter.state).toEqual({
        visibleColumns: [],
        lastAppliedFilters: null,
        hasInitialized: false,
      });
    });
  });

  describe('getters', () => {
    it('hasVisibleColumns returns true when visibleColumns has items', () => {
      state.visibleColumns = ['column1', 'column2'];
      const result = agentsColumnsFilter.getters.hasVisibleColumns(state);
      expect(result).toBe(true);
    });

    it('hasVisibleColumns returns false when visibleColumns is empty', () => {
      state.visibleColumns = [];
      const result = agentsColumnsFilter.getters.hasVisibleColumns(state);
      expect(result).toBe(false);
    });

    it('dynamicColumns returns columns that are not in STATIC_COLUMNS', () => {
      state.visibleColumns = [...STATIC_COLUMNS, 'column1', 'column2'];
      const result = agentsColumnsFilter.getters.dynamicColumns(state);
      expect(result).toEqual(['column1', 'column2']);
    });

    it('allVisibleColumns returns all visible columns including static columns', () => {
      state.visibleColumns = ['column1', 'column2'];
      const result = agentsColumnsFilter.getters.allVisibleColumns(state);
      expect(result).toEqual([...STATIC_COLUMNS, 'column1', 'column2']);
    });

    it('getStorageKey returns key with project uuid when available', () => {
      const key = agentsColumnsFilter.getters.getStorageKey(
        state,
        null,
        rootState,
      );
      expect(key).toBe(`${STORAGE_KEY}_${projectUuid}`);
    });

    it('getStorageKey falls back to localStorage projectUuid when rootState has no project', () => {
      rootState.config.project = null;
      localStorageMock.getItem.mockReturnValue('fallback-uuid');

      const key = agentsColumnsFilter.getters.getStorageKey(
        state,
        null,
        rootState,
      );
      expect(key).toBe(`${STORAGE_KEY}_fallback-uuid`);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('projectUuid');
    });

    it('getStorageKey returns default key when no project uuid available', () => {
      rootState.config.project = null;
      localStorageMock.getItem.mockReturnValue(null);

      const key = agentsColumnsFilter.getters.getStorageKey(
        state,
        null,
        rootState,
      );
      expect(key).toBe(STORAGE_KEY);
    });
  });

  describe('mutations', () => {
    it('SET_VISIBLE_COLUMNS sets unique non-static columns', () => {
      const columns = ['status', 'column1', 'column1', 'column2'];
      agentsColumnsFilter.mutations.SET_VISIBLE_COLUMNS(state, columns);
      expect(state.visibleColumns).toEqual(['column1', 'column2']);
    });

    it('SET_VISIBLE_COLUMNS ignores non-array input', () => {
      state.visibleColumns = ['existing'];
      agentsColumnsFilter.mutations.SET_VISIBLE_COLUMNS(state, 'invalid');
      expect(state.visibleColumns).toEqual(['existing']);
    });

    it('SET_VISIBLE_COLUMNS filters out non-string values', () => {
      const columns = ['column1', 123, null, undefined, { key: 'value' }];
      agentsColumnsFilter.mutations.SET_VISIBLE_COLUMNS(state, columns);
      expect(state.visibleColumns).toEqual(['column1']);
    });

    it('CLEAR_VISIBLE_COLUMNS resets visibleColumns to empty array', () => {
      state.visibleColumns = ['column1', 'column2'];
      agentsColumnsFilter.mutations.CLEAR_VISIBLE_COLUMNS(state);
      expect(state.visibleColumns).toEqual([]);
    });

    it('TOGGLE_COLUMN adds column when not present', () => {
      state.visibleColumns = ['column1'];
      agentsColumnsFilter.mutations.TOGGLE_COLUMN(state, 'column2');
      expect(state.visibleColumns).toEqual(['column1', 'column2']);
    });

    it('TOGGLE_COLUMN removes column when already present', () => {
      state.visibleColumns = ['column1', 'column2'];
      agentsColumnsFilter.mutations.TOGGLE_COLUMN(state, 'column1');
      expect(state.visibleColumns).toEqual(['column2']);
    });

    it('TOGGLE_COLUMN ignores static columns', () => {
      state.visibleColumns = ['column1'];
      agentsColumnsFilter.mutations.TOGGLE_COLUMN(state, 'status'); // from STATIC_COLUMNS
      expect(state.visibleColumns).toEqual(['column1']);
    });

    it('INITIALIZE_FROM_STORAGE loads columns from localStorage', () => {
      const storedColumns = ['column1', 'column2', 'status'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedColumns));

      agentsColumnsFilter.mutations.INITIALIZE_FROM_STORAGE(state, rootState);

      expect(state.visibleColumns).toEqual(['column1', 'column2']);
      expect(state.hasInitialized).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `${STORAGE_KEY}_${projectUuid}`,
      );
    });

    it('INITIALIZE_FROM_STORAGE handles JSON parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      console.error = vi.fn();

      agentsColumnsFilter.mutations.INITIALIZE_FROM_STORAGE(state, rootState);

      expect(state.visibleColumns).toEqual([]);
      expect(state.hasInitialized).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });

    it('INITIALIZE_FROM_STORAGE handles missing localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      agentsColumnsFilter.mutations.INITIALIZE_FROM_STORAGE(state, rootState);

      expect(state.visibleColumns).toEqual([]);
      expect(state.hasInitialized).toBe(true);
    });

    it('SET_LAST_APPLIED_FILTERS sets the lastAppliedFilters', () => {
      const filters = { filter1: 'value1', filter2: 'value2' };
      agentsColumnsFilter.mutations.SET_LAST_APPLIED_FILTERS(state, filters);
      expect(state.lastAppliedFilters).toEqual(filters);
    });

    it('SET_INITIALIZED sets the hasInitialized flag', () => {
      agentsColumnsFilter.mutations.SET_INITIALIZED(state, true);
      expect(state.hasInitialized).toBe(true);

      agentsColumnsFilter.mutations.SET_INITIALIZED(state, false);
      expect(state.hasInitialized).toBe(false);
    });
  });

  describe('actions', () => {
    it('setVisibleColumns commits SET_VISIBLE_COLUMNS and updates localStorage', () => {
      const columns = ['column1', 'column2'];

      agentsColumnsFilter.actions.setVisibleColumns(
        { commit, state, getters },
        columns,
      );

      expect(commit).toHaveBeenCalledWith('SET_VISIBLE_COLUMNS', columns);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        getters.getStorageKey,
        JSON.stringify(state.visibleColumns),
      );
    });

    it('setVisibleColumns does nothing when input is not an array', () => {
      agentsColumnsFilter.actions.setVisibleColumns(
        { commit, state, getters },
        'invalid',
      );

      expect(commit).not.toHaveBeenCalled();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('clearVisibleColumns commits CLEAR_VISIBLE_COLUMNS and removes from localStorage', () => {
      agentsColumnsFilter.actions.clearVisibleColumns({ commit, getters });

      expect(commit).toHaveBeenCalledWith('CLEAR_VISIBLE_COLUMNS');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        getters.getStorageKey,
      );
    });

    it('toggleColumn commits TOGGLE_COLUMN and updates localStorage for valid columns', () => {
      const columnName = 'column1';

      agentsColumnsFilter.actions.toggleColumn(
        { commit, state, getters },
        columnName,
      );

      expect(commit).toHaveBeenCalledWith('TOGGLE_COLUMN', columnName);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        getters.getStorageKey,
        JSON.stringify(state.visibleColumns),
      );
    });

    it('toggleColumn does nothing for static columns', () => {
      agentsColumnsFilter.actions.toggleColumn(
        { commit, state, getters },
        'status', // from STATIC_COLUMNS
      );

      expect(commit).not.toHaveBeenCalled();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('toggleColumn does nothing for non-string input', () => {
      agentsColumnsFilter.actions.toggleColumn({ commit, state, getters }, 123);

      expect(commit).not.toHaveBeenCalled();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('initializeFromStorage commits INITIALIZE_FROM_STORAGE with rootState', () => {
      agentsColumnsFilter.actions.initializeFromStorage({ commit, rootState });

      expect(commit).toHaveBeenCalledWith('INITIALIZE_FROM_STORAGE', rootState);
    });

    it('updateLastAppliedFilters commits SET_LAST_APPLIED_FILTERS', () => {
      const filters = { filter1: 'value1' };

      agentsColumnsFilter.actions.updateLastAppliedFilters({ commit }, filters);

      expect(commit).toHaveBeenCalledWith('SET_LAST_APPLIED_FILTERS', filters);
    });

    it('setInitialized commits SET_INITIALIZED', () => {
      agentsColumnsFilter.actions.setInitialized({ commit }, true);

      expect(commit).toHaveBeenCalledWith('SET_INITIALIZED', true);
    });
  });
});
