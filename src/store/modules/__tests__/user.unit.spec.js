import { setActivePinia, createPinia } from 'pinia';
import { useUser } from '../user';

describe('useUser store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have initial email as empty string', () => {
    const store = useUser();
    expect(store.email).toBe('');
  });

  it('should update email with setEmail', () => {
    const store = useUser();
    store.setEmail('user@example.com');
    expect(store.email).toBe('user@example.com');
  });
});
