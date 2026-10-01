<template>
  <UnnnicToolTip
    enabled
    text="Facebook"
    side="right"
  >
    <UnnnicIcon icon="thesvg-color:facebook" />
  </UnnnicToolTip>
</template>

<script setup lang="ts">
import { UnnnicIcon, UnnnicToolTip } from '@weni/unnnic-system';

defineOptions({
  name: 'FacebookIcon',
});
</script>
