<template>
  <Transition>
    <section
      v-if="show"
      class="header-generate-insight-modal"
      @click.stop
    >
      <header class="header-generate-insight-modal__header">
        <section class="header__title">
          <img src="@/assets/images/shine.svg" />
          Insight
        </section>
        <button
          class="header__close-button"
          @click="$emit('close')"
        >
          <UnnnicIcon
            icon="close"
            scheme="neutral-clean"
            size="avatar-nano"
          />
        </button>
      </header>

      <section
        ref="content"
        class="header-generate-insight-modal__content"
        @scroll="checkScroll"
      >
        <HeaderGenerateInsightText :text="generatedInsight" />

        <div
          v-if="showGradient"
          class="gradient-overlay"
        ></div>

        <footer
          v-if="generatedInsight"
          class="content__footer"
        >
          <p class="footer__description">
            {{ $t('insights_header.generate_insight.by_ai') }}
          </p>
        </footer>
      </section>
    </section>
  </Transition>
</template>

<script>
import HeaderGenerateInsightText from './HeaderGenerateInsightText.vue';

export default {
  name: 'HeaderGenerateInsightModal',

  components: {
    HeaderGenerateInsightText,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close'],

  data() {
    return {
      generatedInsight: '',
      showGradient: false,
    };
  },

  watch: {
    show(newShow) {
      if (newShow && !this.generatedInsight) {
        this.generateInsight();
      }

      if (newShow) {
        this.$nextTick(() => {
          this.checkScroll();
        });
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.checkScroll();
    });
    window.addEventListener('resize', this.checkScroll);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScroll);
  },

  methods: {
    generateInsight() {
      //TODO: Remove this mock when text generation by AI is implemented
      setTimeout(() => {
        this.generatedInsight =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dictum mauris volutpat, ornare quam vel, scelerisque est. Nulla nulla neque, scelerisque ac velit tincidunt, dapibus accumsan quam. Quisque aliquam nulla interdum arcu aliquet molestie. Curabitur lobortis maximus fringilla. Phasellus nec dolor efficitur, mattis ipsum eu, volutpat urna. In cursus, lacus nec semper sagittis, felis ante viverra ante, sit amet lacinia metus purus non diam. Vivamus quis fringilla leo. Proin mattis aliquet risus. <br/><br/> Vestibulum tincidunt, ipsum ut tempor luctus, sapien elit laoreet mi, quis ornare lacus urna quis erat. Duis et imperdiet massa. Nunc fringilla efficitur tellus, a cursus odio suscipit vel. Ut tempus metus elit, non lobortis nisi ultrices nec. Proin sem arcu, ultrices in rutrum ac, pulvinar sit amet magna. Pellentesque non lacus in lacus sollicitudin ultrices. Morbi commodo et lectus in scelerisque. Aliquam scelerisque nisi arcu, ut scelerisque tortor pulvinar vitae. Suspendisse tempor tincidunt turpis. Vestibulum vehicula ante at odio facilisis lacinia. <br/><br/> Integer ut diam feugiat, faucibus neque sit amet, pretium lectus. Quisque vel libero consequat est interdum lacinia. Proin volutpat, elit et lacinia tincidunt, est est ullamcorper neque, quis pharetra nisi lectus eu nisi. Donec diam urna, aliquam et pellentesque sed, congue sit amet ligula. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras dictum mauris volutpat, ornare quam vel, scelerisque est. Nulla nulla neque, scelerisque ac velit tincidunt, dapibus accumsan quam. Quisque aliquam nulla interdum arcu aliquet molestie.';
        this.checkScroll();
      }, 3000);
    },

    checkScroll() {
      const content = this.$refs.content;
      const scrollHeight = content.scrollHeight;
      const clientHeight = content.clientHeight;

      console.log('checkScroll', content, scrollHeight, clientHeight);
      this.showGradient = scrollHeight > clientHeight;
    },
  },
};
</script>

<style scoped lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.header-generate-insight-modal {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 999;

  box-shadow: $unnnic-shadow-level-far;
  border-radius: $unnnic-border-radius-sm;
  padding: $unnnic-spacing-md;

  width: 35vw;
  height: 55vh;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: $unnnic-spacing-sm;

  background: $unnnic-color-neutral-darkest;

  cursor: default;

  &__header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: $unnnic-spacing-sm;

    .header__title {
      display: flex;
      align-items: center;
      gap: $unnnic-spacing-xs;

      color: $unnnic-color-weni-300;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
    }

    .header__close-button {
      border: none;
      background-color: transparent;

      width: 38px;
      height: 38px;

      padding: $unnnic-spacing-nano;
      display: flex;
      align-items: center;
      justify-content: center;

      cursor: pointer;
    }
  }

  &__content {
    overflow-y: auto;
    padding-right: $unnnic-spacing-ant;
    margin-right: -$unnnic-spacing-ant;

    .content__footer {
      .footer__description {
        color: $unnnic-color-neutral-clean;
        text-align: right;
        font-size: $unnnic-font-size-body-md;
      }
    }
  }

  .gradient-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 9rem;
    background: linear-gradient(
      359deg,
      #3b414d 0.54%,
      rgba(59, 65, 77, 0.8) 62.61%,
      rgba(59, 65, 77, 0) 91.82%
    );
    pointer-events: none;
  }
}
</style>
