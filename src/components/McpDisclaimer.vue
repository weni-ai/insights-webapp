<template>
  <UnnnicDisclaimer
    class="mcp-disclaimer"
    data-testid="mcp-disclaimer"
    type="informational"
    :title="t('mcp_news.modal_title')"
  >
    <template #description>
      {{ t('mcp_news.modal_description') }}
      <a
        class="mcp-disclaimer__link"
        data-testid="mcp-disclaimer-link"
        :href="MCP_SETUP_GUIDE_URL"
        target="_blank"
        rel="noopener noreferrer"
        @click="handleViewGuide"
      >
        {{ t('mcp_news.view_setup_guide') }}
      </a>
    </template>
  </UnnnicDisclaimer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { UnnnicDisclaimer } from '@weni/unnnic-system';
import { moduleStorage } from '@/utils/storage';

const MCP_SETUP_GUIDE_URL =
  'https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp';

const { t } = useI18n();

const emit = defineEmits<{
  (_e: 'dismiss'): void;
}>();

function handleViewGuide() {
  moduleStorage.setItem('mcp_news_show_disclaimer', false);
  emit('dismiss');
}
</script>

<style scoped lang="scss">
.mcp-disclaimer {
  flex-shrink: 0;
  margin-right: $unnnic-space-4;

  &__link {
    color: $unnnic-color-fg-base;
    text-decoration: underline;
  }
}
</style>
