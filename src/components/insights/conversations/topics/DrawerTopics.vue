<template>
  <UnnnicDrawer
    v-if="isAddTopicsDrawerOpen"
    :modelValue="isAddTopicsDrawerOpen"
    :title="$t('conversations_dashboard.form_topic.title')"
    class="add-topics-drawer"
    data-testid="add-topics-drawer"
    :primaryButtonText="$t('conversations_dashboard.form_topic.save')"
    :secondaryButtonText="$t('conversations_dashboard.form_topic.cancel')"
    @close="handleDrawerAddTopics"
    @primary-button-click="handleAddTopic"
    @secondary-button-click="handleDrawerAddTopics"
  >
    <template #content>
      <FormTopic />
    </template>
  </UnnnicDrawer>
  <ModalTopic
    :isOpen="isOpenModal"
    type="cancel-topic"
    @primary-button-click="handleCancelTopic"
    @secondary-button-click="handleKeepAddingTopic"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import FormTopic from './Form/FormTopic.vue';
import ModalTopic from './ModalTopic.vue';

const topicsStore = useConversationalTopics();

const isAddTopicsDrawerOpen = computed(() => topicsStore.isAddTopicsDrawerOpen);
const isOpenModal = computed(() => topicsStore.isOpenModal);

onMounted(() => {
  topicsStore.initializeMockData();
  topicsStore.openAddTopicsDrawer();
});

const handleDrawerAddTopics = () => {
  if (topicsStore.hasNewTopics) {
    topicsStore.openModal('cancel-topic');
  } else {
    topicsStore.closeAddTopicsDrawer();
  }
};

const handleAddTopic = () => {
  console.log('Saving topics:', topicsStore.topics);
  topicsStore.closeAddTopicsDrawer();
};

const handleKeepAddingTopic = () => {
  topicsStore.closeModal();
};

const handleCancelTopic = () => {
  topicsStore.closeModal();
  topicsStore.closeAddTopicsDrawer();
};
</script>

<style lang="scss" scoped>
.add-topics {
  display: flex;
}
</style>
