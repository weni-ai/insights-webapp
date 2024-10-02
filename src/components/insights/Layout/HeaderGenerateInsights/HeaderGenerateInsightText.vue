<!-- eslint-disable vue/no-v-html -->
<template>
  <section
    v-if="!displayedText"
    class="header-generate-insight-text__generating"
  >
    {{ $t('insights_header.generate_insight.generating_insights') }}
    <span
      v-for="dot of 3"
      :key="dot"
      class="generating__dot"
    />
  </section>
  <section
    v-else
    class="header-generate-insight-text__generated"
  >
    <Markdown :content="displayedText" />
  </section>
</template>

<script>
import Markdown from '@/components/Markdown.vue';

export default {
  name: 'HeaderGenerateInsightText',

  components: {
    Markdown,
  },

  props: {
    text: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isTyping: false,
      animatedText: '',
    };
  },
  computed: {
    displayedText() {
      const { animatedText, text } = this;
      return text.length && !this.isTyping ? text : animatedText;
    },
  },

  watch: {
    text(newText) {
      this.typeWriter(newText, 1);
    },
  },

  methods: {
    async typeWriter(text, speed) {
      this.isTyping = true;
      this.animatedText = '';

      for (let i = 0; i < text.length; i++) {
        this.animatedText += text.charAt(i);
        await new Promise((resolve) => setTimeout(resolve, speed));
      }

      this.isTyping = false;
    },
  },
};
</script>

<style scoped lang="scss">
.header-generate-insight-text {
  &__generating {
    text-align: start;

    color: $unnnic-color-neutral-clean;
    font-size: $unnnic-font-size-body-gt;

    @keyframes wave {
      0%,
      60%,
      100% {
        transform: initial;
      }

      30% {
        transform: translateY(-3px);
      }
    }

    .generating__dot {
      display: inline-block;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      margin-right: 2px;
      background-color: $unnnic-color-neutral-clean;
      animation: wave 1.3s linear infinite;

      &:nth-child(2) {
        animation-delay: -1.1s;
      }

      &:nth-child(3) {
        animation-delay: -0.9s;
      }
    }
  }

  &__generated {
    text-align: start;
    color: $unnnic-color-neutral-white;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-light;
    line-height: $unnnic-line-height-large * 1.4;
  }
}
</style>
