<template>
  <UnnnicDialog
    :open="modelValue"
    @update:open="emit('update:modelValue', $event)"
  >
    <UnnnicDialogContent size="large">
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ t('mcp_news.modal_title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <div
        class="mcp-news-modal__body"
        data-testid="mcp-news-modal-body"
      >
        <p class="mcp-news-modal__description">
          {{ t('mcp_news.modal_description') }}
        </p>

        <div class="mcp-news-modal__flow-diagram">
          <div class="mcp-news-modal__flow-diagram__gradient" />

          <div class="mcp-news-modal__flow-steps">
            <div class="mcp-news-modal__flow-step">
              <UnnnicIcon
                icon="bar_chart"
                size="sm"
                scheme="neutral-dark"
              />
              <span class="mcp-news-modal__flow-label">
                {{ t('mcp_news.flow_analytics') }}
              </span>
            </div>

            <UnnnicIcon
              icon="arrow_forward"
              size="md"
              scheme="neutral-dark"
            />

            <div
              class="mcp-news-modal__flow-step mcp-news-modal__flow-step--hero"
            >
              <UnnnicIcon
                icon="hub"
                size="md"
                scheme="neutral-dark"
              />
              <span class="mcp-news-modal__flow-label">
                {{ t('mcp_news.flow_mcp_connection') }}
              </span>
            </div>

            <UnnnicIcon
              icon="arrow_forward"
              size="md"
              scheme="neutral-dark"
            />

            <div class="mcp-news-modal__flow-step">
              <UnnnicIcon
                icon="deployed_code"
                size="sm"
                scheme="neutral-dark"
              />
              <span class="mcp-news-modal__flow-label">
                {{ t('mcp_news.flow_ai_tools') }}
              </span>
            </div>
          </div>

          <div class="mcp-news-modal__prompt-bubble">
            <UnnnicIcon
              icon="chat_bubble"
              size="sm"
              scheme="neutral-dark"
            />
            <span class="mcp-news-modal__prompt-text">
              {{ t('mcp_news.flow_prompt') }}
            </span>
          </div>
        </div>

        <ul class="mcp-news-modal__features">
          <li class="mcp-news-modal__feature-item">
            ✓ {{ t('mcp_news.feature_ask_questions') }}
          </li>
          <li class="mcp-news-modal__feature-item">
            ✓ {{ t('mcp_news.feature_track_metrics') }}
          </li>
          <li class="mcp-news-modal__feature-item">
            ✓ {{ t('mcp_news.feature_prepare_reports') }}
          </li>
        </ul>

        <div class="mcp-news-modal__privacy">
          <UnnnicIcon
            icon="lock"
            size="xs"
            scheme="fg-muted"
          />
          <span class="mcp-news-modal__privacy-text">
            {{ t('mcp_news.privacy_note') }}
          </span>
        </div>
      </div>

      <UnnnicDialogFooter>
        <div class="mcp-news-modal__footer-actions">
          <UnnnicDialogClose>
            <UnnnicButton
              :text="t('mcp_news.not_now')"
              type="tertiary"
              data-testid="mcp-news-not-now-button"
              @click="handleNotNow"
            />
          </UnnnicDialogClose>

          <UnnnicButton
            :text="t('mcp_news.view_setup_guide')"
            type="primary"
            data-testid="mcp-news-view-guide-button"
            @click="handleViewGuide"
          />
        </div>
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
  UnnnicDialog,
  UnnnicDialogContent,
  UnnnicDialogHeader,
  UnnnicDialogTitle,
  UnnnicDialogFooter,
  UnnnicDialogClose,
  UnnnicButton,
  UnnnicIcon,
} from '@weni/unnnic-system';

const MCP_SETUP_GUIDE_URL =
  'https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp';

const { t } = useI18n();

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'not-now'): void;
  (_e: 'view-guide'): void;
}>();

function handleNotNow() {
  emit('not-now');
}

function handleViewGuide() {
  window.open(MCP_SETUP_GUIDE_URL, '_blank');
  emit('view-guide');
}
</script>

<style scoped lang="scss">
.mcp-news-modal {
  &__body {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    padding: $unnnic-space-6;
  }

  &__description {
    margin: 0;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__flow-diagram {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    padding: $unnnic-space-4;
    border: 1px solid $unnnic-color-border-base;
    border-radius: $unnnic-radius-4;
    background-color: $unnnic-color-bg-base-soft;
    overflow: hidden;
  }

  &__flow-diagram__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      11deg,
      rgba(167, 139, 250, 0.05) 0%,
      rgba(167, 139, 250, 0) 100%
    );
    pointer-events: none;
  }

  &__flow-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  &__flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-space-2;

    &--hero {
      :deep(.unnnic-icon) {
        font-size: $unnnic-icon-size-7;
      }
    }
  }

  &__flow-label {
    font: $unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;
  }

  &__prompt-bubble {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-3;
    padding: 9px 17px;
    border: 1px solid $unnnic-color-border-accent-plain;
    border-radius: $unnnic-radius-full;
    background-color: $unnnic-color-bg-base;
    align-self: center;
  }

  &__prompt-text {
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-base;
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__feature-item {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__privacy {
    display: flex;
    align-items: center;
    gap: $unnnic-space-1;
  }

  &__privacy-text {
    font-family: $unnnic-font-family;
    font-size: 10px;
    line-height: 16px;
    color: $unnnic-color-fg-muted;
  }

  &__footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: $unnnic-space-2;
  }
}
</style>
