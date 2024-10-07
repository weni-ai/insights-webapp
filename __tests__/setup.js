import { config } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n.js';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.js';
import { vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    name: 'mockApp',
  })),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn(),
  })),
}));

config.global.plugins = [i18n, UnnnicSystemPlugin];
config.global.mocks = {
  $t: (msg) => msg,
};
