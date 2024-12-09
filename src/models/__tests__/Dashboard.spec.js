import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

describe('Model Dashboard', () => {
  it('should initialize with provided values', () => {
    const dashboard = new Dashboard(
      'uuid',
      'Test Dashboard',
      { columns: 12, rows: 6 },
      true,
      true,
      true,
      { foo: 'bar' },
    );

    expect(dashboard.uuid).toBe('uuid');
    expect(dashboard.name).toBe('Test Dashboard');
    expect(dashboard.grid).toEqual({ columns: 12, rows: 6 });
    expect(dashboard.is_default).toBe(true);
    expect(dashboard.is_editable).toBe(true);
    expect(dashboard.is_deletable).toBe(true);
    expect(dashboard.config).toEqual({ foo: 'bar' });
  });

  it('should initialize with default values if only no optional arguments are provided', () => {
    const dashboard = new Dashboard(
      'uuid',
      'Default Dashboard',
      undefined,
      false,
    );

    expect(dashboard.uuid).toBe('uuid');
    expect(dashboard.name).toBe('Default Dashboard');
    expect(dashboard.grid).toEqual({ columns: 0, rows: 0 });
    expect(dashboard.is_default).toBe(false);
    expect(dashboard.is_editable).toBe(false);
    expect(dashboard.is_deletable).toBe(false);
    expect(dashboard.config).toEqual({});
  });
});
