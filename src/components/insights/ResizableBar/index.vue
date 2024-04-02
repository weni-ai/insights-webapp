<template>
  <aside class="resizable-bar">
    <section class="resizable-bar__gradient" />
    <section
      class="resizable-bar__handler"
      @mousedown="startResizing"
      @mousemove="handleResizing"
      @mouseup="stopResizing"
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
    <section
      class="resizable-bar__content"
      :style="{
        height: `${contentHeight}vh`,
        transition: resizeTransition,
      }"
    >
      <ResizableBarCards />
      <InsightsInput />
    </section>
  </aside>
</template>

<script>
import InsightsInput from '@/components/InsightsInput.vue';
import ResizableBarCards from './ResizableBarCards.vue';

export default {
  components: { InsightsInput, ResizableBarCards },
  name: 'ResizableBar',

  data() {
    return {
      startY: 0,
      maxContentHeight: 60,
      contentHeight: 24,
      isResizing: false,
      resizeTransition: 'none',
    };
  },

  computed: {
    handlerIcon() {
      return this.contentHeight === this.maxContentHeight
        ? 'expand_circle_down'
        : 'expand_circle_up';
    },
  },

  methods: {
    handleResizeClick() {
      this.resizeTransition = 'height ease-in-out 0.3s';
      if (
        (this.contentHeight > 0 &&
          this.contentHeight !== this.maxContentHeight) ||
        this.contentHeight === 0
      ) {
        this.contentHeight = this.maxContentHeight;
      } else {
        this.contentHeight = 0;
      }
    },

    startResizing(event) {
      this.isResizing = true;
      this.startY = event.clientY;
      this.resizeTransition = 'none';
    },

    handleResizing(event) {
      if (this.isResizing) {
        const relativeVHFromClick = (event.clientY * 100) / window.innerHeight;
        const remainingRelativeVHFromClick = 100 - relativeVHFromClick;
        const adjustedcontentHeight = Math.min(
          remainingRelativeVHFromClick,
          this.maxContentHeight,
        );

        this.contentHeight = adjustedcontentHeight;
      }
    },

    stopResizing() {
      this.isResizing = false;
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

    .handler__separator {
      width: 100%;

      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;

      cursor: ns-resize;
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
    overflow: hidden;

    display: grid;
    grid-template-rows: 1fr auto;
    gap: $unnnic-spacing-sm;

    background-color: $unnnic-color-background-white;

    padding-bottom: $unnnic-spacing-sm;

    > * {
      margin: 0 $unnnic-spacing-awesome;

      &:first-child {
        margin-top: $unnnic-spacing-sm;
      }
    }
  }
}
</style>
