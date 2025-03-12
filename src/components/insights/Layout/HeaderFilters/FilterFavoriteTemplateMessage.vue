<template>
  <section
    v-if="currentDashboard?.config?.is_whatsapp_integration"
    class="filter-favorite-template"
  >
    <p class="filter-favorite-template__label">
      {{ `${$t('template_messages_dashboard.favorites')}:` }}
    </p>
    <UnnnicSelectSmart
      :modelValue="selectedFavorite"
      type="secondary"
      :options="favoriteOptions"
      autocomplete
      autocompleteClearOnFocus
      @update:model-value="selectFavorite"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import i18n from '@/utils/plugins/i18n';

const store = useStore();

const currentDashboard = computed(
  () => store.state.dashboards.currentDashboard,
);

const favorites = computed(
  () => store.state.metaTemplateMessage.favoritesTemplates,
);

const selectedTemplateUuid = computed(
  () => store.state.metaTemplateMessage.selectedTemplateUuid,
);

const favoriteOptions = computed(() => {
  const options = [{ label: i18n.global.t('select'), value: '' }];

  favorites.value.forEach((favorite) =>
    options.push({ label: favorite.name, value: favorite.id }),
  );

  return options;
});

const selectedFavorite = computed(
  () => store.state.metaTemplateMessage.selectedFavoriteTemplate,
);

const selectFavorite = (favorite) => {
  store.dispatch('metaTemplateMessage/setSelectedFavorite', favorite);
};

onMounted(async () => {
  await store.dispatch('metaTemplateMessage/getFavoritesTemplates');
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
