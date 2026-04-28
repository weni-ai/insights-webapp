import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.js';
import { vi } from 'vitest';

/**
 * Default stubs for Unnnic dialog primitives in unit tests.
 * - Renders slots without teleport (dialog content stays in wrapper DOM).
 * - Uses explicit `name` so `findComponent({ name: 'UnnnicDialog' })` keeps working.
 *
 * Opt out of stubbing when you need real behavior (e.g. props/emits from reka-ui):
 * `mount(Component, { global: { stubs: { UnnnicDialog: false, UnnnicDialogContent: false, ... } } })`
 */
const unnnicDialogStubs = {
  UnnnicDialog: {
    name: 'UnnnicDialog',
    props: ['open', 'defaultOpen', 'modal'],
    emits: ['update:open'],
    template: '<div class="unnnic-dialog-stub"><slot /></div>',
  },
  UnnnicDialogTrigger: {
    name: 'UnnnicDialogTrigger',
    props: ['asChild'],
    template: '<div class="unnnic-dialog-trigger-stub"><slot /></div>',
  },
  UnnnicDialogHeader: {
    name: 'UnnnicDialogHeader',
    props: ['type', 'divider', 'closeButton'],
    template: '<header class="unnnic-dialog-header-stub"><slot /></header>',
  },
  UnnnicDialogTitle: {
    name: 'UnnnicDialogTitle',
    template: '<div class="unnnic-dialog-title-stub"><slot /></div>',
  },
  UnnnicDialogFooter: {
    name: 'UnnnicDialogFooter',
    props: ['divider'],
    template: '<footer class="unnnic-dialog-footer-stub"><slot /></footer>',
  },
  UnnnicDialogClose: {
    name: 'UnnnicDialogClose',
    props: ['asChild'],
    template: '<div class="unnnic-dialog-close-stub"><slot /></div>',
  },
  UnnnicDialogContent: {
    name: 'UnnnicDialogContent',
    inheritAttrs: true,
    props: ['size', 'parentClass'],
    template:
      '<div class="unnnic-dialog-content-stub" v-bind="$attrs"><slot /></div>',
  },
};

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

config.global.stubs = {
  ...(config.global.stubs || {}),
  ...unnnicDialogStubs,
};
