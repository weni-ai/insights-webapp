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
            data-testid="gallery-option"
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
import { mapActions, mapState } from 'pinia';

import { useProject } from '@/store/modules/project';
import { useWidgets } from '@/store/modules/widgets';
import { useOnboarding } from '@/store/modules/onboarding';
import { useConfig } from '@/store/modules/config';

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
    ...mapState(useProject, {
      isLoadedProjectFlows: 'isLoadedFlows',
    }),
    ...mapState(useWidgets, { widget: 'currentWidgetEditing' }),
    ...mapState(useOnboarding, [
      'onboardingRefs',
      'showConfigWidgetOnboarding',
    ]),
    ...mapState(useConfig, ['project']),

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

      const empty_widget_options = [
        'funnel',
        'recurrence',
        'vtex',
        'vtex_conversions',
      ];

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
    const isVtexWidget = ['vtex_order', 'vtex_conversions'].includes(
      this.widget?.type,
    );
    if (!this.isLoadedProjectFlows && !isVtexWidget) {
      await this.getProjectFlows();
    }
  },

  methods: {
    ...mapActions(useProject, ['getProjectFlows']),
    ...mapActions(useOnboarding, [
      'callTourNextStep',
      'callTourPreviousStep',
      'setOnboardingRef',
    ]),
    ...mapActions(useWidgets, ['updateCurrentWidgetEditing']),

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
      this.showDrawerConfigWidget = true;
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
