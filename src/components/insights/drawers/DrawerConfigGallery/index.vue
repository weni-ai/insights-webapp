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
    ...mapState(useProject, {
      isLoadedProjectFlows: 'isLoadedFlows',
      isCommerce: 'isCommerce',
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

    isVtexEnabledProject() {
      if (this.isCommerce) {
        return true;
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
        '0131514a-122e-4a09-a7f3-b7241e0e641c',
        '97265d10-d7e6-41e7-8dc7-9548069e76ed',
        'e1390b69-d170-4a37-8b52-5b99eadfbf57',
        'dc69866d-23ba-4e36-93f5-0ede5bdf240c',
        'b9ed3797-36c8-4b50-bfe1-42f1b89de6cf',
        '1db0c133-5d4b-4bc6-a0f1-e722f1385863',
        '0e1b929b-2fc7-4b26-85d0-d08d4189e78e',
        '8c81c536-3a78-4c49-b4df-e1c43831b3ea',
        '1e4cefb3-90ba-401b-a761-1ff62ca7421a',
        '37e1e32b-1460-4278-be9e-824ee821bcbe',
        '1deff1d8-d263-49ff-a685-41f5caeb12de',
        '2530af8c-7563-4efc-8512-d5b5968a4139',
        '8b5b3195-f008-41a2-b816-645db48a7050',
        'aca2822c-06bd-4066-8ee9-c38c7e68839a',
        '83ce2984-6058-4387-937a-d0dfd9964eb7',
        'ec66349e-0946-493a-8554-d304687a1023',
        '0f82bbfa-b629-430f-9609-4b52e2eead51',
        '916c4107-0683-4aff-a9f7-b0c738a493bd',
        'cd58be91-6218-4c0b-89ba-9fc2f032c0b3',
        '40a07171-6a99-422f-b58c-d7b93bead121',
        '66b59d1b-1354-470e-ab31-52fdeb72685d',
        '708f4212-b469-41cf-8765-ea880555133b',
        '61e07edb-2115-4e30-82b0-c3a22e2a5623',
        '86180061-b788-45a5-afd4-bb2af59e7e03',
        '73b5320e-68d4-48ce-86d0-ec5f977ed859',
        '494da827-f2e2-48d7-b88b-b0fb2a05e9c7',
        'd6ae23de-52a6-47df-bef1-791c9ed63f00',
        '505a85a8-fb08-4e06-b071-b36d2bd4aa1a',
        '2cdf5dc9-19e1-4eb3-af9c-3c2c85ac420c',
        '8f67466c-f38c-4a8b-8fb6-44221ba04f69',
        '740ad6cf-62a8-4f8f-8238-9ac9d1cd94c7',
        '891f3bfc-76c7-4fab-9cb0-42534b59d3cc',
        '9e296ee0-bd18-455c-9c47-4bfb7ce7b91f',
        'b70af849-6cf8-4235-baf2-96fc965810ed',
        'e406d698-f159-4adc-9673-e33994ce5f33',
        '6ee799bf-4479-4c0b-96fc-12df814313a0',
        '2618a43f-1bb8-4297-a6d2-8602d22853da',
        '9063f792-808a-401f-9e09-7108673a6375',
        'ebddc873-7fe6-479a-b9e7-8ad93083e279',
        '13bc9d5f-911a-46dd-8142-7b671658cc58',
        'c6a51184-d7c4-43e3-8c87-88fa379cbefe',
      ];

      const enabledProjectsStg = ['95fa43d6-d91a-48d4-bbe8-256d93bf5254'];

      const enabledProjects =
        env('ENVIRONMENT') === 'staging'
          ? enabledProjectsStg
          : enabledProjectsProd;

      return enabledProjects.includes(this.project.uuid);
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

      const empty_widget_options = ['funnel', 'recurrence'];

      if (this.isVtexEnabledProject) {
        empty_widget_options.push('vtex');

        empty_widget_options.push('vtex_conversions');
      }

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
