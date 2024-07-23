<template>
  <template
    v-for="n in 2"
    :key="n"
  >
    <section class="skeleton-input">
      <UnnnicSkeletonLoading
        width="100px"
        height="10px"
      />
      <UnnnicSkeletonLoading
        width="100%"
        height="46px"
      />
    </section>
  </template>
  <UnnnicSkeletonLoading
    width="100px"
    height="10px"
  />
  <template
    v-for="n in 2"
    :key="n"
  >
    <section class="skeleton-radio">
      <UnnnicSkeletonLoading
        circle
        width="24px"
        height="24px"
      />
      <UnnnicSkeletonLoading
        width="100px"
        height="16px"
      />
    </section>
  </template>
  <section class="skeleton-input">
    <UnnnicSkeletonLoading
      width="100px"
      height="10px"
    />
    <UnnnicSkeletonLoading
      width="100%"
      height="46px"
    />
  </section>
  <section class="skeleton-group-radio">
    <template
      v-for="n in 5"
      :key="n"
    >
      <section class="skeleton-radio">
        <UnnnicSkeletonLoading
          circle
          width="24px"
          height="24px"
        />
        <UnnnicSkeletonLoading
          width="100px"
          height="16px"
        />
      </section>
    </template>
  </section>
  <UnnnicSkeletonLoading
    width="100%"
    height="46px"
  />
</template>

<script>
export default {
  name: 'SkeletonConfigWidgetDynamyc',
};
</script>

<style lang="scss" scoped>
.skeleton-radio {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-nano;
}
.skeleton-group-radio {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $unnnic-spacing-sm;
  row-gap: $unnnic-spacing-sm;
}
</style>
