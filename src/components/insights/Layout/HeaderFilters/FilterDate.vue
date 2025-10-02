<template>
  <UnnnicInputDatePicker
    class="filter-date"
    data-testid="filter-date"
    :modelValue="modelValue"
    :inputFormat="$t('date_format')"
    size="md"
    position="right"
    :minDate="minDate"
    :maxDate="maxDate"
    @select-date="selectedDates = $event"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
import { useDashboards } from '@/store/modules/dashboards';

import { mapState } from 'pinia';

import moment from 'moment';

export default {
  name: 'FilterDate',
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      selectedDates: { start: '', end: '' },
    };
  },
  computed: {
    ...mapState(useDashboards, ['currentDashboard']),
    isHumanServiceDashboard() {
      return this.currentDashboard?.name === 'human_service_dashboard.title';
    },
    isConversationalDashboard() {
      return this.currentDashboard?.name === 'conversations_dashboard.title';
    },
    minDate() {
      if (this.isHumanServiceDashboard) return undefined;
      if (this.isConversationalDashboard) return undefined;
      return moment().subtract(89, 'days').format('YYYY-MM-DD');
    },
    maxDate() {
      if (this.isConversationalDashboard) {
        return moment().subtract(1, 'days').format('YYYY-MM-DD');
      }
      return moment().format('YYYY-MM-DD');
    },
  },
};
</script>

<style lang="scss" scoped>
// .dropdown class comes from the unnnic component and is used here to override its style
.filter-date.dropdown {
  display: grid;
  height: 100%;
  z-index: 3;
}
</style>
