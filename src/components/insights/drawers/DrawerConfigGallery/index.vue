<template>
  <UnnnicDrawer
    v-if="galleryOptions.length && !showDrawerConfigWidget"
    class="drawer-config-gallery"
    wide
    :title="$t('drawers.config_gallery.title')"
    :description="$t('drawers.config_gallery.description')"
    :modelValue="modelValue"
    closeIcon="close"
    @close="closeAllDrawers"
  >
    <template #content>
      <ol class="drawer-config-gallery__options">
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
    @close="closeAllDrawers"
    @back="goToGallery"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';

import GalleryOption from './GalleryOption.vue';
import DrawerConfigWidgetDynamic from '../DrawerConfigWidgetDynamic.vue';

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
    }),

    closeAllDrawers() {
      this.goToGallery();
      this.$emit('close');
    },

    setDrawerConfigType(value) {
      this.drawerConfigType = value;

      if (value) {
        this.showDrawerConfigWidget = true;
      }
    },

    goToGallery() {
      this.showDrawerConfigWidget = false;
      this.drawerConfigType = '';
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
