<template>
  <section
    class="content-section"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

defineOptions({ name: 'Markdown' });

interface MarkdownProps {
  content?: string;
}

const props = withDefaults(defineProps<MarkdownProps>(), {
  content: '',
});

const html = computed(() => DOMPurify.sanitize(marked.parse(props.content)));
</script>

<style scoped>
.content-section {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
