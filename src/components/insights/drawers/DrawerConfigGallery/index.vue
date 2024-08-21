<template>
  <UnnnicDrawer
    v-if="galleryOptions.length && !showDrawerConfigWidget"
    ref="unnnicDrawer"
    class="drawer-config-gallery"
    wide
    :title="$t('drawers.config_gallery.title')"
    :description="$t('drawers.config_gallery.description')"
    :modelValue="modelValue"
    closeIcon="close"
    @close="closeAllDrawers({ handlerNextStep: false })"
  >
    <template #content>
      <ol
        data-onboarding-id="widget-gallery"
        class="drawer-config-gallery__options"
      >
        <li
          v-for="{ title, description, value } of galleryOptions"
          :key="title"
        >
          <GalleryOption
            :title="title"
            :description="description"
            @click="setDrawerConfigType(value)"
          />
        </li>
      </ol>
    </template>
  </UnnnicDrawer>
  <DrawerConfigWidgetDynamic
    v-if="showDrawerConfigWidget"
    :modelValue="showDrawerConfigWidget"
    :configType="drawerConfigType"
    @close="closeAllDrawers($event)"
    @back="goToGallery"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import GalleryOption from './GalleryOption.vue';
import DrawerConfigWidgetDynamic from '../DrawerConfigWidgetDynamic.vue';

import { clearDeepValues } from '@/utils/object.js';

export default {
  name: 'DrawerConfigGallery',

  components: {
    GalleryOption,
    DrawerConfigWidgetDynamic,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close'],

  data() {
    return { showDrawerConfigWidget: false, drawerConfigType: '' };
  },

  computed: {
    ...mapState({
      isLoadedProjectFlows: (state) => state.project.isLoadedFlows,
      widget: (state) => state.widgets.currentWidgetEditing,
      onboardingRefs: (state) => state.onboarding.onboardingRefs,
      showConfigWidgetOnboarding: (state) =>
        state.onboarding.showConfigWidgetOnboarding,
    }),

    widgetConfigType() {
      return this.widget.config?.type;
    },

    galleryOptions() {
      const { $t } = this;
      function createOptions(optionKeys) {
        return optionKeys.map((option) => ({
          title: $t(`drawers.config_gallery.options.${option}.title`),
          description: $t(
            `drawers.config_gallery.options.${option}.description`,
          ),
          value: option,
        }));
      }

      const optionsMap = {
        card: createOptions(['executions', 'flow_result', 'data_crossing']),
      };

      return optionsMap[this.widget?.type] || [];
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler() {
        this.setDrawerConfigType(this.widgetConfigType);

        if (!this.galleryOptions.length) {
          this.showDrawerConfigWidget = true;
        }
      },
    },
  },

  async created() {
    if (!this.isLoadedProjectFlows) {
      await this.getProjectFlows();
    }
  },

  methods: {
    ...mapActions({
      getProjectFlows: 'project/getProjectFlows',
      callTourNextStep: 'onboarding/callTourNextStep',
      callTourPreviousStep: 'onboarding/callTourPreviousStep',
      updateCurrentWidgetEditing: 'widgets/updateCurrentWidgetEditing',
    }),

    ...mapMutations({
      setOnboardingRef: 'onboarding/SET_ONBOARDING_REF',
    }),

    async closeAllDrawers({ handleTourNextStep } = {}) {
      this.showDrawerConfigWidget = false;
      this.drawerConfigType = '';

      if (handleTourNextStep) this.callTourNextStep('widgets-onboarding-tour');

      this.$emit('close');
    },

    setDrawerConfigType(configType) {
      this.drawerConfigType = configType;

      if (configType) {
        this.callTourNextStep('widgets-onboarding-tour');
        this.handleShowDrawerConfigWidget();
      }

      if (configType !== this.widgetConfigType) {
        this.cleanCurrentWidget();
      }
    },

    handleShowDrawerConfigWidget() {
      if (this.$refs.unnnicDrawer) {
        this.$refs.unnnicDrawer.transitionClose(() => {
          this.showDrawerConfigWidget = true;
        });
      } else {
        this.showDrawerConfigWidget = true;
      }
    },

    cleanCurrentWidget() {
      const cleanWidget = {
        ...this.widget,
        name: '',
        config: clearDeepValues(this.widget.config),
      };

      this.updateCurrentWidgetEditing(cleanWidget);
    },

    goToGallery() {
      this.showDrawerConfigWidget = false;
      this.drawerConfigType = '';

      this.callTourPreviousStep({
        tour: 'widgets-onboarding-tour',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer-config-gallery {
  &__options {
    display: grid;
    gap: $unnnic-spacing-ant;
  }
}
</style>
