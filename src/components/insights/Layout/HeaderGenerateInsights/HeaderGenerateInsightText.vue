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

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import Markdown from '@/components/Markdown.vue';

defineOptions({ name: 'HeaderGenerateInsightText' });

interface HeaderGenerateInsightTextProps {
  text?: string;
}

const props = withDefaults(defineProps<HeaderGenerateInsightTextProps>(), {
  text: '',
});

const emit = defineEmits<{
  typingComplete: [];
}>();

const isTyping = ref(false);
const animatedText = ref('');

const displayedText = computed(() => {
  const { text } = props;
  return text.length && !isTyping.value ? text : animatedText.value;
});

const typeWriter = async (text: string, speed: number) => {
  isTyping.value = true;
  animatedText.value = '';

  for (let i = 0; i < text.length; i++) {
    animatedText.value += text.charAt(i);
    await new Promise((resolve) => setTimeout(resolve, speed));
  }

  isTyping.value = false;
  emit('typingComplete');
};

watch(
  () => props.text,
  (newText) => {
    typeWriter(newText, 1);
  },
);

onBeforeUnmount(() => {
  if (isTyping.value) emit('typingComplete');
});
</script>

<style scoped lang="scss">
.header-generate-insight-text {
  &__generating {
    text-align: start;

    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;

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
      background-color: $unnnic-color-gray-5;
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
    color: $unnnic-color-gray-0;
    font: $unnnic-font-display-4;
    font-weight: 300;
  }
}
</style>
