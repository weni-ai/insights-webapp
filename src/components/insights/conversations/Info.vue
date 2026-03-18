<template>
  <section
    class="dashboard-conversational__info"
    data-testid="info-section"
  >
    <UnnnicIcon
      icon="info"
      size="sm"
      scheme="feedback-blue"
      data-testid="info-icon"
    />
    <p
      class="dashboard-conversational__info__description"
      data-testid="info-description"
    >
      {{
        shouldUseMock
          ? $t('conversations_dashboard.info.mock_description')
          : $t('conversations_dashboard.info.description', {
              date: formattedDate,
            })
      }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, type Locale } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { UnnnicIcon } from '@weni/unnnic-system';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const conversational = useConversational();
const { shouldUseMock } = storeToRefs(conversational);

const { locale } = useI18n();

const localeMap: Record<string, Locale> = {
  'pt-br': ptBR,
  en: enUS,
  es,
};

const formattedDate = computed(() => {
  const referenceDate = new Date(2026, 2, 14);
  const dateFnsLocale = localeMap[locale.value.toLowerCase()] || enUS;
  return format(referenceDate, 'P', { locale: dateFnsLocale });
});
</script>

<style scoped lang="scss">
.dashboard-conversational__info {
  display: flex;
  align-items: center;
  padding: $unnnic-space-4;
  gap: $unnnic-space-2;
  align-self: stretch;
  width: 100%;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-info;
  background: $unnnic-color-bg-info;

  &__description {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
