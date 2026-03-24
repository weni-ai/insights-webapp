<template>
  <ProgressWidget
    title="ADD"
    :progressItems="MOCK_DATA"
    :isLoading="false"
    type="add"
  />

  <AddCustomizableWidget
    class="conversational-add__overlay"
    @add="handleOpenDrawer(true)"
  />
</template>

<script setup lang="ts">
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCustomizableWidget from '@/components/insights/conversations/CustomizableWidget/AddCustomizableWidget.vue';
import { useConversational } from '@/store/modules/conversational/conversational';
import {
  colorBgPurpleStrong,
  colorBgPurplePlain,
} from '@weni/unnnic-system/tokens/colors';

const conversational = useConversational();
const { setIsDrawerCustomizableOpen } = conversational;

const handleOpenDrawer = (isNew: boolean) => {
  setIsDrawerCustomizableOpen(true, 'add', isNew);
};

const MOCK_DATA = [
  {
    text: '🤩 Very satisfied',
    value: 57,
    color: colorBgPurpleStrong,
    backgroundColor: colorBgPurplePlain,
  },
  {
    text: '😁 Satisfied',
    value: 25,
    color: colorBgPurpleStrong,
    backgroundColor: colorBgPurplePlain,
  },
  {
    text: '😐 Neutral',
    value: 12,
    color: colorBgPurpleStrong,
    backgroundColor: colorBgPurplePlain,
  },
  {
    text: '☹️ Dissatisfied',
    value: 5,
    color: colorBgPurpleStrong,
    backgroundColor: colorBgPurplePlain,
  },
  {
    text: '😡 Very dissatisfied',
    value: 1,
    color: colorBgPurpleStrong,
    backgroundColor: colorBgPurplePlain,
  },
];
</script>

<style lang="scss" scoped>
.conversational-add {
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
</style>
