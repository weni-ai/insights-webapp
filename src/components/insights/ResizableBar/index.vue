<template>
  <aside class="resizable-bar">
    <section class="resizable-bar__gradient" />
    <section
      class="resizable-bar__handler"
      @mousedown.prevent.stop="startResizing"
    >
      <hr class="handler__separator" />
      <button
        class="handler__button"
        @click.stop="handleResizeClick"
      >
        <UnnnicIcon
          :icon="handlerIcon"
          size="lg"
          scheme="neutral-clean"
        />
      </button>
      <hr class="handler__separator" />
    </section>
    <main
      class="resizable-bar__content"
      :style="{
        height: `${contentHeight}vh`,
        transition: resizeTransition,
      }"
    >
      <section class="content__section">
        <ResizableBarCards />
        <PromptsHistory />
      </section>
      <InsightsInput />
    </main>
  </aside>
</template>

<script>
import InsightsInput from '@/components/InsightsInput.vue';
import ResizableBarCards from './ResizableBarCards.vue';
import PromptsHistory from '@/components/insights/PromptsHistory/index.vue';

export default {
  components: { ResizableBarCards, PromptsHistory, InsightsInput },
  name: 'ResizableBar',

  data() {
    return {
      isResizing: false,
      resizeTransition: 'none',

      startHandlerY: null,
      startContentHeight: null,

      contentHeightMax: 60,
      contentHeight: 24,
    };
  },

  mounted() {
    const { resizableBarContentScroll } = this.$refs;
    resizableBarContentScroll.scrollTop =
      resizableBarContentScroll.scrollHeight;
  },

  computed: {
    handlerIcon() {
      return this.contentHeight === this.contentHeightMax
        ? 'expand_circle_down'
        : 'expand_circle_up';
    },
  },

  methods: {
    pxToVh(px) {
      const vh = window.innerHeight;
      const pxAsVh = (px / vh) * 100;
      return pxAsVh;
    },

    handleResizeClick() {
      const { contentHeight, contentHeightMax } = this;

      if (
        (contentHeight > 0 && contentHeight !== contentHeightMax) ||
        contentHeight === 0
      ) {
        this.resizeHeightWithTransition(contentHeightMax);
      } else {
        this.resizeHeightWithTransition(0);
      }
    },

    startResizing(event) {
      this.isResizing = true;
      this.startHandlerY = event.clientY;
      this.startContentHeight = this.contentHeight;
      this.resizeTransition = 'none';
    },

    handleResizing(event) {
      if (this.isResizing) {
        const deltaY = -(event.clientY - this.startHandlerY);
        const remainingContentHeight =
          this.startContentHeight + this.pxToVh(deltaY);
        const adjustedContentHeight = Math.min(
          remainingContentHeight,
          this.contentHeightMax,
        );

        this.contentHeight = adjustedContentHeight;
      }
    },

    stopResizing() {
      this.isResizing = false;
    },

    resizeHeightWithTransition(height) {
      this.resizeTransition = 'height ease-in-out 0.3s';
      this.contentHeight = height;
    },
  },

  watch: {
    isResizing(newIsResizing) {
      if (newIsResizing) {
        document.body.style.cursor = 'ns-resize';
        window.addEventListener('mousemove', this.handleResizing);
        window.addEventListener('mouseup', this.stopResizing);
      } else {
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', this.handleResizing);
        window.removeEventListener('mouseup', this.stopResizing);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$insightsLayoutPadding: ($unnnic-spacing-sm * 2);

.resizable-bar {
  position: absolute;
  bottom: 0;

  width: calc(100% - $insightsLayoutPadding);

  &__gradient {
    width: 100%;
    height: 8vh;

    background: linear-gradient(
      180deg,
      #ffffff00 2%,
      $unnnic-color-background-white 98%
    );
  }

  &__handler {
    display: flex;
    align-items: center;

    width: 100%;

    background: $unnnic-color-background-white;

    cursor: ns-resize;

    .handler__separator {
      width: 100%;

      margin: $unnnic-spacing-xs 0;

      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    .handler__button {
      margin: 0 $unnnic-spacing-xs;

      display: flex;

      background-color: transparent;
      border: none;

      user-select: none;
      cursor: pointer;
    }
  }

  &__content {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: $unnnic-spacing-sm;

    background-color: $unnnic-color-background-white;

    padding-bottom: $unnnic-spacing-sm;

    .content__section {
      overflow: auto;

      display: grid;
      gap: $unnnic-spacing-xl;
    }

    > * {
      margin: 0 $unnnic-spacing-awesome;

      &:first-child {
        margin-top: $unnnic-spacing-sm;
      }
    }
  }
}
</style>
