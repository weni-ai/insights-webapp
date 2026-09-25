<template>
  <UnnnicToolTip
    enabled
    text="Whatsapp"
    side="right"
  >
    <UnnnicIcon icon="thesvg-color:whatsapp" />
  </UnnnicToolTip>
</template>

<script setup lang="ts">
import { UnnnicIcon, UnnnicToolTip } from '@weni/unnnic-system';

defineOptions({
  name: 'WhatsappIcon',
});
</script>
