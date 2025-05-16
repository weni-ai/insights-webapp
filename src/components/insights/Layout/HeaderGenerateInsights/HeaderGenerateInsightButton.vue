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
import { mapState } from 'pinia';

import { useConfig } from '@/store/modules/config';
import { useWidgets } from '@/store/modules/widgets';

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
    ...mapState(useConfig, ['token']),
    ...mapState(useWidgets, {
      isDisableBtn: 'isLoadingCurrentDashboardWidgets',
    }),
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
