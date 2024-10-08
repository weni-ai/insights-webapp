<template>
  <div :class="gridLayoutClass">
    <div
      v-for="(_, index) in boxes"
      :key="index"
      :class="getBoxClass(index)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps({
  numberCards: {
    type: Number,
    required: true,
    validator: (value: number) => [0, 1, 2, 3].includes(value),
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const gridLayoutClass = computed(() => {
  return 'grid_layout layout-' + props.numberCards;
});

const boxes = computed(() =>
  props.numberCards >= 0 && props.numberCards <= 3
    ? new Array(9 - 2 * props.numberCards).fill(null)
    : [],
);

const getBoxClass = (index: number) => {
  const defaultClass = props.active ? 'box box-active' : 'box';

  switch (props.numberCards) {
    case 0:
      return defaultClass;
    case 1:
      return index === 2 ? `${defaultClass} box-filled box-3` : defaultClass;
    case 2:
      return index === 3
        ? `${defaultClass} box-filled box-2`
        : index === 4
          ? `${defaultClass} box-filled box-3`
          : defaultClass;
    case 3:
      return index === 0
        ? `${defaultClass} box-filled box-1`
        : index === 1
          ? `${defaultClass} box-filled box-2`
          : `${defaultClass} box-filled box-3`;
  }
};
</script>

<style scoped lang="scss">
.grid_layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0.125rem;
  height: 100%;
  width: 100%;
}

.box {
  border-radius: 0.1025rem;
  background-color: $unnnic-color-neutral-cleanest;

  &-active {
    background-color: $unnnic-color-weni-600;
  }
}

.box-filled {
  grid-row: 1 / 4;
}

.box-1 {
  grid-column: 1;
}

.box-2 {
  grid-column: 2;
}

.box-3 {
  grid-column: 3;
}
</style>
