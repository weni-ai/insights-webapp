<template>
  <section
    v-if="currentDashboard?.name === 'test-meta-templates-message'"
    class="filter-favorite-template"
  >
    <p class="filter-favorite-template__label">
      {{ `${$t('template_messages_dashboard.favorites')}:` }}
    </p>
    <UnnnicSelectSmart
      v-model="selectedFavorite"
      type="secondary"
      :options="favoriteOptions"
      autocomplete
      autocompleteClearOnFocus
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import i18n from '@/utils/plugins/i18n';

const store = useStore();

const currentDashboard = computed(
  () => store.state.dashboards.currentDashboard,
);

const favoriteOptions = computed(() => {
  const options = [{ label: i18n.global.t('select'), value: '' }];

  return options;
});

const selectedFavorite = ref([]);
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
