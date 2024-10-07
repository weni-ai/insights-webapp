<template>
  <button
    class="header-generate-insight-button"
    :disabled="isDisableBtn"
    @click="openModal"
  >
    <img src="@/assets/images/shine.svg" />
    {{ $t('insights_header.generate_insight.title') }}

    <HeaderGenerateInsightModal
      :show="isGenerateInsightModalOpen"
      @close="closeModal"
    />
  </button>
</template>

<script>
import { mapState } from 'vuex';

import HeaderGenerateInsightModal from './HeaderGenerateInsightModal.vue';

export default {
  name: 'HeaderGenerateInsightButton',

  components: {
    HeaderGenerateInsightModal,
  },

  data() {
    return {
      isGenerateInsightModalOpen: false,
    };
  },

  computed: {
    ...mapState({
      token: (state) => state.config.token,
    }),
    isDisableBtn() {
      return this.$store.state.widgets.isLoadingCurrentDashboardWidgets;
    },
  },

  methods: {
    openModal() {
      this.isGenerateInsightModalOpen = true;
    },
    closeModal() {
      this.isGenerateInsightModalOpen = false;
    },
  },
};
</script>

<style scoped lang="scss">
.header-generate-insight-button {
  position: relative;

  border: none;

  display: flex;
  gap: $unnnic-spacing-nano;
  justify-content: center;
  align-items: center;

  padding: $unnnic-spacing-ant $unnnic-spacing-sm;

  border-radius: $unnnic-border-radius-sm;
  background: $unnnic-color-neutral-darkest;

  color: $unnnic-color-weni-300;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;

  cursor: pointer;
}
</style>
