import { describe, it, expect } from 'vitest';
import Filter from '../Filter';

describe('Model Filter', () => {
  it('should initialize with all provided values', () => {
    const filter = new Filter({
      name: 'status',
      label: 'Status',
      placeholder: 'Select a status',
      type: 'select',
      source: 'chats_agents',
      depends_on: {
        filter: 'user',
        search_param: 'id',
      },
      start_sufix: 'test_start_sufix',
      end_sufix: 'test_end_sufix',
      key_value_field: 'status_key',
    });

    expect(filter).toEqual({
      name: 'status',
      label: 'Status',
      placeholder: 'Select a status',
      type: 'select',
      source: 'chats_agents',
      depends_on: {
        filter: 'user',
        search_param: 'id',
      },
      start_sufix: 'test_start_sufix',
      end_sufix: 'test_end_sufix',
      key_value_field: 'status_key',
    });
  });
});
