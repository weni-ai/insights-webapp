<template>
  <aside class="resizable-bar">
    <section
      class="resizable-bar__gradient"
      :class="{ show: contentHeight > contentHeightToClose }"
    />
    <section
      class="resizable-bar__handler"
      ref="resizableBarHandler"
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
      ref="resizableBarContent"
      :style="{
        height: `${contentHeight}vh`,
        transition: resizeTransition,
      }"
    >
      <section
        class="content__section"
        ref="resizableBarContentScroll"
      >
        <!-- This element has flex-direction as column-reverse, to resize with correct behavior -->
        <PromptsHistory />
        <ResizableBarCards
          ref="resizableBarCards"
          v-show="!showMorePromptsSuggestions"
          @show-more-prompts-suggestions="showMorePromptsSuggestions = true"
        />
        <ResizableBarDoris v-show="!showMorePromptsSuggestions" />
        <ResizableBarPromptsSuggestions v-show="showMorePromptsSuggestions" />
      </section>
      <InsightsInput ref="insightsInput" />
    </main>
  </aside>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { pxToVh } from '@/utils/css';

import InsightsInput from '@/components/InsightsInput.vue';
import ResizableBarCards from './ResizableBarCards.vue';
import ResizableBarDoris from './ResizableBarDoris.vue';
import ResizableBarPromptsSuggestions from './ResizableBarPromptsSuggestions.vue';
import PromptsHistory from '@/components/insights/PromptsHistory/index.vue';

export default {
  components: {
    ResizableBarCards,
    ResizableBarDoris,
    ResizableBarPromptsSuggestions,
    PromptsHistory,
    InsightsInput,
  },
  name: 'ResizableBar',

  data() {
    return {
      isResizing: false,
      resizeTransition: 'none',

      startHandlerY: null,
      startContentHeight: null,

      contentHeightToClose: null,

      showMorePromptsSuggestions: false,
    };
  },

  mounted() {
    this.setContentHeight(24);
    this.setBarHandlerHeight(this.$refs.resizableBarHandler.clientHeight);
    this.scrollContentToBottom();
    this.calculateDefaultContentHeight();
  },

  computed: {
    ...mapState({
      contentHeight: (state) => state.resizableBar.contentHeight,
      contentHeightMax: (state) => state.resizableBar.contentHeightMax,
    }),
    handlerIcon() {
      return this.contentHeight === this.contentHeightMax
        ? 'expand_circle_down'
        : 'expand_circle_up';
    },
  },

  methods: {
    ...mapActions({
      setContentHeight: 'resizableBar/setContentHeight',
      setBarHandlerHeight: 'resizableBar/setBarHandlerHeight',
    }),
    getPropertyValueAsNumber(styles, property) {
      return parseFloat(styles.getPropertyValue(property)) || 0;
    },

    calculateDefaultContentHeight() {
      const resizableBarHandler = this.$refs.resizableBarCards.$el;
      const resizableBarContent = this.$refs.resizableBarContent;

      const resizableBarContentStyles =
        window.getComputedStyle(resizableBarContent);

      const resizableBarContentGap = this.getPropertyValueAsNumber(
        resizableBarContentStyles,
        'gap',
      );
      const resizableBarContentPadding = this.getPropertyValueAsNumber(
        resizableBarContentStyles,
        'padding-bottom',
      );

      const insightsInputHeight = this.$refs.insightsInput.$el.clientHeight;
      const resizableBarHandlerHeight = resizableBarHandler.clientHeight;
      this.setContentHeight(
        pxToVh(
          resizableBarContentPadding * 2 +
            resizableBarHandlerHeight +
            resizableBarContentGap +
            insightsInputHeight,
        ),
      );
      this.contentHeightToClose = this.contentHeight;
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
        const remainingContentHeight = this.startContentHeight + pxToVh(deltaY);
        const adjustedContentHeight = Math.min(
          remainingContentHeight,
          this.contentHeightMax,
        );

        this.setContentHeight(adjustedContentHeight);
      }
    },

    stopResizing() {
      this.isResizing = false;

      if (this.contentHeight < this.contentHeightToClose) {
        this.resizeHeightWithTransition(0);
      }
    },

    resizeHeightWithTransition(height) {
      this.resizeTransition = 'height ease-in-out 0.3s';
      this.setContentHeight(height);
    },

    scrollContentToBottom() {
      const { resizableBarContentScroll } = this.$refs;
      resizableBarContentScroll.scrollTop =
        resizableBarContentScroll.scrollHeight;
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

  justify-self: center;

  width: calc(100% - $insightsLayoutPadding);
  max-height: 100%;

  &__gradient {
    width: 100%;
    height: 8vh;

    background: linear-gradient(
      180deg,
      #ffffff00 2%,
      $unnnic-color-background-white 98%
    );

    animation-duration: 0.3s;
    animation-fill-mode: forwards;
    animation-name: disappear;

    &.show {
      animation-name: appear;
    }

    @keyframes appear {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes disappear {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  }

  &__handler {
    padding: $unnnic-spacing-nano 0;

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

      display: flex;
      flex-direction: column-reverse;
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
