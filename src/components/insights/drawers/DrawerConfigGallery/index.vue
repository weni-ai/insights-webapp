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

import Config from '@/store/modules/config';
import env from '@/utils/env';
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
      if (this.widget.type === 'vtex_order') return 'vtex';

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

      const enabledProjectsProd = [
        '521d2c65-ae66-441d-96ff-2b8471d522c1',
        'd8d6d71d-3daf-4d2e-812b-85cc252a96d8',
        'e6c3ce0c-2bb5-45b6-b5ee-1d17ea88941b',
        'd646822b-07b4-4386-a242-4c9ec6bb485f',
        '661861a7-01ee-4986-8477-9195c7169858',
        '9bdbad04-bcca-4bc7-a718-06fb7965e07f',
        'a6c8fc78-495f-43bd-a2ee-d38dfa79aea6',
        '6294ee81-e89e-437b-a3e0-f4a99611bb51',
        '97265d10-d7e6-41e7-8dc7-9548069e76ed',
      ];

      const enabledProjectsStg = ['95fa43d6-d91a-48d4-bbe8-256d93bf5254'];

      const enabledProjects =
        env('ENVIROMENT') === 'staging'
          ? enabledProjectsStg
          : enabledProjectsProd;

      const isVtexEnabledProject = enabledProjects.includes(
        Config.state.project.uuid,
      );

      const empty_widget_options = ['funnel', 'recurrence'];

      if (isVtexEnabledProject) empty_widget_options.push('vtex');

      const optionsMap = {
        card: createOptions(['executions', 'flow_result', 'data_crossing']),
        empty_column: createOptions(empty_widget_options),
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
    if (!this.isLoadedProjectFlows && this.widget.type !== 'vtex_order') {
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
