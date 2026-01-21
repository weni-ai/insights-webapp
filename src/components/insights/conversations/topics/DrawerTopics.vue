<template>
  <UnnnicDrawer
    v-if="isAddTopicsDrawerOpen"
    :modelValue="isAddTopicsDrawerOpen"
    :title="$t('conversations_dashboard.form_topic.title')"
    class="add-topics-drawer"
    data-testid="drawer-topics-drawer"
    :primaryButtonText="$t('conversations_dashboard.form_topic.save')"
    :secondaryButtonText="$t('conversations_dashboard.form_topic.cancel')"
    :disabledPrimaryButton="disabledPrimaryButton"
    :loadingPrimaryButton="isSavingTopics"
    @close="handleDrawerAddTopics"
    @primary-button-click="handleAddTopic"
    @secondary-button-click="handleDrawerAddTopics"
  >
    <template #content>
      <UnnnicDisclaimer
        class="drawer-topics-disclaimer"
        :description="$t('conversations_dashboard.form_topic.disclaimer')"
      />
      <FormTopic data-testid="drawer-topics-form" />
    </template>
  </UnnnicDrawer>
  <ModalTopic
    :isOpen="isOpenModal"
    type="cancel-topic"
    data-testid="drawer-topics-modal"
    @primary-button-click="handleCancelTopic"
    @secondary-button-click="handleKeepAddingTopic"
    @close="handleKeepAddingTopic"
  />
</template>

<script setup lang="ts">
import { UnnnicDisclaimer } from '@weni/unnnic-system';
import { computed, onMounted } from 'vue';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import FormTopic from './Form/FormTopic.vue';
import ModalTopic from './ModalTopic.vue';

const topicsStore = useConversationalTopics();

const isAddTopicsDrawerOpen = computed(() => topicsStore.isAddTopicsDrawerOpen);
const isOpenModal = computed(() => topicsStore.isOpenModal);
const isSavingTopics = computed(() => topicsStore.isSavingTopics);
const disabledPrimaryButton = computed(() => !topicsStore.allNewTopicsComplete);

const handleDrawerAddTopics = () => {
  if (topicsStore.hasNewTopics || topicsStore.hasNewSubTopics) {
    topicsStore.openModal('cancel-topic');
  } else {
    topicsStore.closeAddTopicsDrawer();
  }
};

const handleAddTopic = async () => {
  const success = await topicsStore.saveAllNewTopics();
  if (success) {
    topicsStore.closeAddTopicsDrawer();
  }
};

const handleKeepAddingTopic = () => {
  topicsStore.closeModal();
};

const handleCancelTopic = () => {
  topicsStore.closeModal();
  topicsStore.closeAddTopicsDrawer();
};

onMounted(() => {
  topicsStore.loadFormTopics();
});
</script>

<style lang="scss" scoped>
.add-topics {
  display: flex;
}

.drawer-topics-disclaimer {
  margin-bottom: $unnnic-spacing-sm;
}
</style>
