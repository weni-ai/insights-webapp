import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, defineComponent, h, reactive } from 'vue';

import TableRowAlert from '../TableRowAlert.vue';

class ResizeObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }
}

const mountInTable = (props = {}, slotContent = 'cell') => {
  const reactiveProps = reactive({
    scheme: 'red',
    text: 'Alert',
    fullRow: false,
    ...props,
  });

  const Host = defineComponent({
    components: { TableRowAlert },
    setup() {
      return () =>
        h('table', [
          h('tbody', [
            h('tr', [
              h(
                'td',
                {},
                h(
                  TableRowAlert,
                  {
                    scheme: reactiveProps.scheme,
                    text: reactiveProps.text,
                    fullRow: reactiveProps.fullRow,
                  },
                  { default: () => slotContent },
                ),
              ),
            ]),
          ]),
        ]);
    },
  });

  const wrapper = mount(Host, {
    global: {
      stubs: {
        UnnnicToolTip: {
          name: 'UnnnicToolTip',
          props: ['enabled', 'text', 'side', 'maxWidth'],
          template: '<div class="tooltip-stub"><slot /></div>',
        },
      },
    },
  });

  return { wrapper, reactiveProps };
};

describe('TableRowAlert.vue', () => {
  let originalResizeObserver;

  beforeEach(() => {
    originalResizeObserver = global.ResizeObserver;
    global.ResizeObserver = ResizeObserverMock;

    Element.prototype.getBoundingClientRect = vi.fn(function () {
      if (this.tagName === 'TR') {
        return {
          width: 400,
          height: 40,
          left: 0,
          top: 0,
          right: 400,
          bottom: 40,
        };
      }
      return {
        width: 100,
        height: 40,
        left: 10,
        top: 5,
        right: 110,
        bottom: 45,
      };
    });
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it.each(['red', 'orange', 'yellow'])(
      'should render scheme class for %s',
      (scheme) => {
        const { wrapper } = mountInTable({ scheme, text: 'Alert' });
        const alert = wrapper.find('[data-testid="table-row-alert"]');

        expect(wrapper.find('.row-alert').classes()).toContain(
          `row-alert--${scheme}`,
        );
        expect(alert.exists()).toBe(true);
        expect(alert.text()).toBe('cell');
      },
    );

    it('should not render overlay when fullRow is false', () => {
      const { wrapper } = mountInTable({
        scheme: 'red',
        text: 'Alert',
        fullRow: false,
      });

      expect(
        wrapper.find('[data-testid="table-row-alert-overlay"]').exists(),
      ).toBe(false);
      expect(wrapper.find('.row-alert').classes()).not.toContain(
        'row-alert--full-row',
      );
    });

    it('should render overlay when fullRow is true', () => {
      const { wrapper } = mountInTable({
        scheme: 'red',
        text: 'Alert',
        fullRow: true,
      });

      expect(
        wrapper.find('[data-testid="table-row-alert-overlay"]').exists(),
      ).toBe(true);
      expect(wrapper.find('.row-alert').classes()).toContain(
        'row-alert--full-row',
      );
    });
  });

  describe('fullRow behavior', () => {
    it('should apply row alert class on the table row', async () => {
      const { wrapper } = mountInTable({
        scheme: 'orange',
        text: 'Alert',
        fullRow: true,
      });
      await nextTick();

      const row = wrapper.find('tr');
      expect(row.classes()).toContain('table-row--alert-orange');
    });

    it('should compute overlay style from row and cell rects', async () => {
      const { wrapper } = mountInTable({
        scheme: 'red',
        text: 'Alert',
        fullRow: true,
      });
      await nextTick();

      const overlay = wrapper.find('[data-testid="table-row-alert-overlay"]');
      expect(overlay.attributes('style')).toContain('width: 400px');
      expect(overlay.attributes('style')).toContain('height: 40px');
      expect(overlay.attributes('style')).toContain('left: 10px');
      expect(overlay.attributes('style')).toContain('top: 5px');
    });

    it('should set up ResizeObserver when fullRow is true', async () => {
      const { wrapper } = mountInTable({
        scheme: 'yellow',
        text: 'Alert',
        fullRow: true,
      });
      await nextTick();

      const row = wrapper.find('tr').element;
      expect(global.ResizeObserver).toBe(ResizeObserverMock);
      expect(row.classList.contains('table-row--alert-yellow')).toBe(true);
    });

    it('should update row class when scheme changes', async () => {
      const { wrapper, reactiveProps } = mountInTable({
        scheme: 'red',
        text: 'Alert',
        fullRow: true,
      });
      await nextTick();

      reactiveProps.scheme = 'yellow';
      await nextTick();

      const row = wrapper.find('tr');
      expect(row.classes()).toContain('table-row--alert-yellow');
      expect(row.classes()).not.toContain('table-row--alert-red');
    });

    it('should clean up row class and disconnect observer on unmount', async () => {
      const { wrapper } = mountInTable({
        scheme: 'red',
        text: 'Alert',
        fullRow: true,
      });
      await nextTick();

      const row = wrapper.find('tr').element;
      expect(row.classList.contains('table-row--alert-red')).toBe(true);

      wrapper.unmount();

      expect(row.classList.contains('table-row--alert-red')).toBe(false);
    });
  });

  describe('fullRow=false early returns', () => {
    it('should not apply row class when fullRow is false', async () => {
      const { wrapper } = mountInTable({
        scheme: 'red',
        text: 'Alert',
        fullRow: false,
      });
      await nextTick();

      const row = wrapper.find('tr');
      expect(row.classes()).not.toContain('table-row--alert-red');
    });
  });
});
