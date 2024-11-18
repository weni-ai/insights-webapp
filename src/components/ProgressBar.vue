<template>
  <section class="progress-bar-container">
    <UnnnicProgressBar
      v-model="progress"
      data-test-id="progress-bar"
      inline
      :title="title"
    />
  </section>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    title: {
      type: String,
      default: '',
    },
    timeInterval: {
      type: Number,
      default: 50,
    },
  },
  emits: ['progress-complete'],
  data() {
    return {
      progress: 0,
      interval: null,
    };
  },
  mounted() {
    setTimeout(this.startProgressBar, 2000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
  methods: {
    startProgressBar() {
      this.progress = 0;

      this.interval = setInterval(this.updateProgress, this.timeInterval);
    },
    updateProgress() {
      this.progress === 100
        ? this.$emit('progress-complete')
        : (this.progress += 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-bar-container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  background-color: rgba(0, 0, 0, 0.4);
  top: 0;
  left: 0;
}
</style>
