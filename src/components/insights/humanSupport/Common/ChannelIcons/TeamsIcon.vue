<template>
  <UnnnicToolTip
    enabled
    text="Teams"
    side="right"
  >
    <UnnnicIcon icon="thesvg-color:microsoft-teams" />
  </UnnnicToolTip>
</template>

<script setup lang="ts">
import { UnnnicIcon, UnnnicToolTip } from '@weni/unnnic-system';

defineOptions({
  name: 'TeamsIcon',
});
</script>
