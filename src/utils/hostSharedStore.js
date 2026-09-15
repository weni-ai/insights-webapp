import { safeImport } from './moduleFederation';

// Connect's Pinia must be read before Insights calls createPinia().
// Calling useSharedStore() inside the Insights app would bind to a new
// empty store whose current.project.uuid starts as undefined.

const { useSharedStore } = await safeImport(
  () => import('connect/sharedStore'),
  'connect/sharedStore',
);

function getHostSharedStore() {
  try {
    return useSharedStore?.();
  } catch {
    return undefined;
  }
}

export const hostSharedStore = getHostSharedStore();
