/**
 * Default stubs for Unnnic dialog primitives in unit tests.
 * - Renders slots without teleport (dialog content stays in wrapper DOM).
 * - Uses explicit `name` so `findComponent({ name: 'UnnnicDialog' })` keeps working.
 *
 * Opt out of stubbing when you need real behavior (e.g. props/emits from reka-ui):
 * `mount(Component, { global: { stubs: { UnnnicDialog: false, UnnnicDialogContent: false, ... } } })`
 */

export const unnnicDialogStubs = {
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
