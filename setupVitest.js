import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import UnnnicSystemPlugin from '@/utils/plugins/UnnnicSystem.js';
import { mockRouter } from '@tests/utils/testHelpers.js';
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

import { icuMessageCompiler } from '@/utils/icuMessageCompiler';

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

// jsdom does not implement canvas; chart.js is mocked in chart specs.
// Stub getContext globally so accidental real Chart usage does not need the
// native `canvas` package (and its system deps) in CI.
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
}));

// Suppress repetitive intlify experimental-compiler notice in test output
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('Custom Message Compiler')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Create i18n instance with Composition API support (legacy: false)
// This works for both Options API and Composition API components
export const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    'pt-br': pt_br,
    en,
    es,
  },
  messageCompiler: icuMessageCompiler,
  globalInjection: true, // Allow $t in templates
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
});

/**
 * Default router is provided via mockRouter (see tests/utils/testHelpers.js)
 * so components using useRoute/useRouter do not warn in unit tests.
 * Specs that need a specific route can still pass their own router in mount()
 * or mock vue-router with vi.mock.
 */
config.global.plugins = [i18n, UnnnicSystemPlugin, mockRouter];

/**
 * Default stub for the lazy-loading wrapper.
 * Renders its slot without providing visibility, so `useLazyData` falls back to
 * eager loading in unit tests (preserving legacy "loads on mount" assertions).
 * Opt out with `stubs: { LazyWidget: false }` to test real visibility gating.
 */
const lazyWidgetStub = {
  LazyWidget: {
    name: 'LazyWidget',
    props: ['rootMargin', 'forceVisible'],
    template: '<div class="lazy-widget-stub"><slot /></div>',
  },
};

config.global.stubs = {
  ...(config.global.stubs || {}),
  ...unnnicDialogStubs,
  ...lazyWidgetStub,
};
