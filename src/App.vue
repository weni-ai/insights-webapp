<template>
  <div id="app">
    <InsightsLayout ref="insights-layout">
      <RouterView />
    </InsightsLayout>
  </div>
</template>

<script>
import InsightsLayout from '@/layouts/InsightsLayout.vue';

export default {
  components: { InsightsLayout },
};
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
}
</style>
