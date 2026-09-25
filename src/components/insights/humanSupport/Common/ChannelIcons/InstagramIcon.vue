<template>
  <UnnnicToolTip
    enabled
    text="Instagram"
    side="right"
  >
    <UnnnicIcon icon="thesvg-color:instagram" />
  </UnnnicToolTip>
</template>

<script setup lang="ts">
import { UnnnicIcon, UnnnicToolTip } from '@weni/unnnic-system';

defineOptions({
  name: 'InstagramIcon',
});
</script>
