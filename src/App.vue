<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script>
import './assets/scss/unnnic.scss';
import env from './utils/env';
console.log('env:', env('VITE_TEST'));
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
}
</style>
