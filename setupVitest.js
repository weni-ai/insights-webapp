import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.js';
import { vi } from 'vitest';

// Import all locale messages
import pt_br from '@/locales/pt_br.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

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

// Create i18n instance with Composition API support (legacy: false)
// This works for both Options API and Composition API components
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    'pt-br': pt_br,
    en,
    es,
  },
  globalInjection: true, // Allow $t in templates
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
});

config.global.plugins = [i18n, UnnnicSystemPlugin];
