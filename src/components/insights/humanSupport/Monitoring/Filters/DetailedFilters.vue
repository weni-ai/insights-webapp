<template>
  <section class="detailed-filters">
    <UnnnicLabel
      :label="
        $t(
          'human_support_dashboard.detailed_monitoring.filters.attendant.label',
        )
      "
    />
    <UnnnicSelectSmart
      data-testid="detailed-filters-select-attendant"
      :modelValue="selectedAttendant"
      :options="attendantsOptions"
      autocomplete
      autocompleteClearOnFocus
      autocompleteIconLeft
      :isLoading="isLoadingAttendants"
      @update:model-value="handleChangeAttendant"
    />
  </section>
</template>

<script setup lang="ts">
import { UnnnicSelectSmart } from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';
import { ref, computed, onMounted } from 'vue';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

interface Attendant {
  uuid: string;
  name: string;
  email: string;
}

interface AttendantOption {
  value: string;
  label: string;
}

const humanSupportMonitoring = useHumanSupportMonitoring();
const { saveAppliedAgentFilter } = humanSupportMonitoring;

const currentAttendant = ref<Attendant | null>(null);
const attendants = ref<Attendant[]>([]);
const isLoadingAttendants = ref(false);

const selectedAttendant = computed(() => {
  if (!currentAttendant.value) {
    return [];
  }
  return [
    {
      value: currentAttendant.value.uuid,
      label: currentAttendant.value.name,
    },
  ];
});

const attendantsOptions = computed(() => {
  return attendants.value.map((attendant) => ({
    value: attendant.uuid,
    label: attendant.name,
  }));
});

const handleChangeAttendant = (selectedOptions: AttendantOption[]) => {
  if (!selectedOptions || !selectedOptions.length) {
    currentAttendant.value = null;
    return;
  }

  const selected = selectedOptions[0];
  const attendant = attendants.value.find((a) => a.uuid === selected.value);

  if (attendant) {
    currentAttendant.value = attendant;
    saveAppliedAgentFilter(attendant.uuid, attendant.name);
  }
};

const loadData = async () => {
  try {
    isLoadingAttendants.value = true;
    const response = await Projects.getProjectSource('agents');
    attendants.value = response;
  } catch (error) {
    console.error('Error loading attendants', error);
  } finally {
    isLoadingAttendants.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.detailed-filters {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-nano;
}
</style>
