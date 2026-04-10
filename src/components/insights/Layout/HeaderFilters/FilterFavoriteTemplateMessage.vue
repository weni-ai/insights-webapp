<template>
  <section class="filter-favorite-template">
    <UnnnicSelect
      :modelValue="selectedFavoriteValue"
      :options="favoriteOptions"
      enableSearch
      :search="searchText"
      data-testid="select-favorite-template"
      :placeholder="$t('template_messages_dashboard.select_favorite')"
      itemLabel="label"
      itemValue="value"
      @update:model-value="selectFavorite"
      @update:search="searchText = $event"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';
import { useDashboards } from '@/store/modules/dashboards';

const metaTemplateMessageStore = useMetaTemplateMessage();
const dashboardsStore = useDashboards();

const currentDashboard = computed(() => dashboardsStore.currentDashboard);

const favorites = computed(() => metaTemplateMessageStore.favoritesTemplates);

const selectedTemplateUuid = computed(
  () => metaTemplateMessageStore.selectedTemplateUuid,
);

const searchText = ref('');

const favoriteOptions = computed(() => {
  const options = [];

  favorites.value.forEach((favorite) =>
    options.push({ label: favorite.name, value: favorite.id }),
  );

  return options;
});

const selectedFavoriteValue = computed(() => {
  const stored = metaTemplateMessageStore.selectedFavoriteTemplate;
  if (Array.isArray(stored)) return stored[0]?.value || '';
  return stored?.value || '';
});

const selectFavorite = (value) => {
  const option = favoriteOptions.value.find((opt) => opt.value === value);
  metaTemplateMessageStore.setSelectedFavorite(
    option || { value: '', label: '' },
  );
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
  selectFavorite('');
});
</script>

<style lang="scss" scoped>
.filter-favorite-template {
  display: flex;
  align-items: center;

  &__label {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-muted;
  }
}
</style>
