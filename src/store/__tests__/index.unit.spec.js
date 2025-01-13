import store from '../index';
import { it } from 'vitest';

describe('Store', () => {
  it('should create a store with the correct modules', () => {
    expect(store.state).toHaveProperty('config');
    expect(store.state).toHaveProperty('dashboards');
    expect(store.state).toHaveProperty('reports');
    expect(store.state).toHaveProperty('project');
    expect(store.state).toHaveProperty('widgets');
    expect(store.state).toHaveProperty('onboarding');
    expect(store.state).toHaveProperty('user');
    expect(store.state).toHaveProperty('gpt');
  });
});
