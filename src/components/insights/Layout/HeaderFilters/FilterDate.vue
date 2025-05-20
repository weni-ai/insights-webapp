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
    isMetaTemplateDashboard() {
      return !!this.currentDashboard?.config?.is_whatsapp_integration;
    },
    isHumanServiceDashboard() {
      return this.currentDashboard?.name === 'human_service_dashboard.title';
    },
    minDate() {
      if (this.isHumanServiceDashboard) return undefined;

      const momentStart = moment(this.selectedDates.start);
      const momentEnd = moment(this.selectedDates.end);

      const formattedMomentStart = momentStart.format('YYYY-MM-DD');
      const formattedMomentEnd = momentEnd.format('YYYY-MM-DD');

      const isDiffSelectedDates =
        formattedMomentStart !== formattedMomentEnd ||
        (formattedMomentStart === 'Invalid date' &&
          formattedMomentEnd === 'Invalid date');

      if (isDiffSelectedDates) return undefined;

      const minCalculatedDate = momentStart
        .subtract(89, 'days')
        .format('YYYY-MM-DD');

      const isMinLast90Days =
        minCalculatedDate === 'Invalid date' || this.isMetaTemplateDashboard;

      return isMinLast90Days
        ? moment().subtract(89, 'days').format('YYYY-MM-DD')
        : minCalculatedDate;
    },
    maxDate() {
      const today = moment();

      const momentStart = moment(this.selectedDates.start);
      const momentEnd = moment(this.selectedDates.end);

      const formattedMomentStart = momentStart.format('YYYY-MM-DD');
      const formattedMomentEnd = momentEnd.format('YYYY-MM-DD');

      const isDiffSelectedDates =
        formattedMomentStart !== formattedMomentEnd ||
        (formattedMomentStart === 'Invalid date' &&
          formattedMomentEnd === 'Invalid date');

      const maxCalculated = momentStart.add(89, 'days');

      const isMaxToday =
        this.isMetaTemplateDashboard ||
        this.isHumanServiceDashboard ||
        isDiffSelectedDates ||
        momentStart.format('YYYY-MM-DD') === 'Invalid date' ||
        maxCalculated.isAfter(today);

      if (isMaxToday) {
        return today.format('YYYY-MM-DD');
      }

      return maxCalculated.format('YYYY-MM-DD');
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
