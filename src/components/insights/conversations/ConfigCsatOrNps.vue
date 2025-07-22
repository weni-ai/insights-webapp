<template>
  <section class="config-csat-or-nps">
    <h2 class="config-csat-or-nps__title">
      {{ $t(`conversations_dashboard.${type}`) }}
    </h2>

    <p class="config-csat-or-nps__description">
      {{
        $t(
          'conversations_dashboard.customize_your_dashboard.config_csat_or_nps_description',
          { type },
        )
      }}
    </p>

    <UnnnicCheckbox
      :modelValue="humanSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.human_support')
      "
      @change="humanSupport = $event"
    />

    <section
      v-if="humanSupport"
      class="config-csat-or-nps__section"
    >
      <SelectFlow
        v-model="flow.uuid"
        data-test-id="select-flow"
      />

      <SelectFlowResult
        v-model="flow.result"
        data-test-id="select-flow-result"
        :flow="flow.uuid"
        :disabled="!flow.uuid"
      />
    </section>

    <UnnnicCheckbox
      :modelValue="aiSupport"
      :textRight="
        $t('conversations_dashboard.customize_your_dashboard.ai_support')
      "
      @change="aiSupport = $event"
    />
    <section
      v-if="aiSupport"
      class="config-csat-or-nps__section"
    >
      <p>test</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useProject } from '@/store/modules/project';

import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';

defineProps<{
  type: 'csat' | 'nps';
}>();

const { isLoadedFlows, getProjectFlows } = useProject();

const humanSupport = ref(false);
const aiSupport = ref(false);
const flow = ref({
  uuid: null,
  result: null,
});

async function getFlows() {
  if (!isLoadedFlows) {
    getProjectFlows();
  }
}

// onMounted(() => {
//   getFlows();
// });
</script>

<style lang="scss" scoped>
.config-csat-or-nps,
.config-csat-or-nps__section {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
}

.config-csat-or-nps {
  &__title {
    color: $unnnic-color-neutral-black;
    font-weight: $unnnic-font-weight-bold;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;
  }

  &__title,
  &__description {
    font-size: $unnnic-font-size-body-lg;
    font-family: $unnnic-font-family-secondary;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  &__section {
    :deep(.unnnic-label__label) {
      margin: 0;
      margin-bottom: $unnnic-spacing-xs;
    }
  }
}
</style>
