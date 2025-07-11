<template>
  <section class="filter-favorite-template">
    <p class="filter-favorite-template__label">
      {{ `${$t('template_messages_dashboard.favorites')}:` }}
    </p>
    <UnnnicSelectSmart
      :modelValue="selectedFavorite"
      type="secondary"
      :options="favoriteOptions"
      autocomplete
      autocompleteClearOnFocus
      data-testid="select-favorite-template"
      :locale="i18n.global.locale"
      @update:model-value="selectFavorite"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';

import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';
import { useDashboards } from '@/store/modules/dashboards';

import i18n from '@/utils/plugins/i18n';

const metaTemplateMessageStore = useMetaTemplateMessage();
const dashboardsStore = useDashboards();

const currentDashboard = computed(() => dashboardsStore.currentDashboard);

const favorites = computed(() => metaTemplateMessageStore.favoritesTemplates);

const selectedTemplateUuid = computed(
  () => metaTemplateMessageStore.selectedTemplateUuid,
);

const favoriteOptions = computed(() => {
  const options = [{ label: i18n.global.t('select'), value: '' }];

  favorites.value.forEach((favorite) =>
    options.push({ label: favorite.name, value: favorite.id }),
  );

  return options;
});

const selectedFavorite = computed(
  () => metaTemplateMessageStore.selectedFavoriteTemplate,
);

const selectFavorite = (favorite) => {
  metaTemplateMessageStore.setSelectedFavorite(favorite);
};

onMounted(async () => {
  await metaTemplateMessageStore.getFavoritesTemplates(
    currentDashboard.value?.uuid,
  );
});

watch(selectedTemplateUuid, (newUuid, oldUuid) => {
  const favoritesIds = favorites.value.map((favorite) => favorite.id);
  const newSelectedIsFavorite = favoritesIds.includes(newUuid);
  if (!oldUuid || newSelectedIsFavorite) return;
  selectFavorite(favoriteOptions.value[0]);
});
</script>

<style lang="scss" scoped>
.filter-favorite-template {
  display: flex;
  align-items: center;

  &__label {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
