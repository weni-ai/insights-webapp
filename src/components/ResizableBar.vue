<template>
  <aside
    class="resizable-bar"
    :style="{
      bottom: sidebarBottom + 'px',
      height: `${Math.min(sidebarHeight, maxHeight)}px`,
    }"
  >
    <header
      class="resizable-bar__header"
      @mousedown="startResizing"
    >
      <hr
        :class="{ 'green-color': isResizing }"
        class="resizable-bar__separator"
      />
      <button
        @click="resizeBar"
        class="resizable-bar__circle-up"
      >
        <UnnnicIcon
          icon="expand_circle_up"
          size="md"
          scheme="neutral-cleanest"
          clickable
        />
      </button>
      <hr
        :class="{ 'green-color': isResizing }"
        class="resizable-bar__separator"
      />
    </header>
    <div class="resizable-bar__content">
      <div
        v-if="visibleInsights"
        class="resizable-bar__insights"
      >
        <header class="resizable-bar__insights-header">
          <p
            class="resizable-bar__insights-description unnnic-font body-md bold"
          >
            InsightsGPT:
          </p>
          <h2 class="resizable-bar__insights-title unnnic-font title-sm bold">
            Aqui estão algumas sugestões para você:
          </h2>
        </header>
        <div class="resizable-bar__insights-content">
          <nav class="resizable-bar__insights-nav">
            <ul class="resizable-bar__insights-list">
              <li class="list-item">Recentes</li>
              <li class="list-item">Segmentos</li>
              <li class="list-item">Varejo</li>
              <li class="list-item">Weni plataforma</li>
              <li class="list-item selected">Atendimento humano</li>
            </ul>
          </nav>
          <div class="resizable-bar__insights-cards">
            <InsightsCard>
              <template v-slot:title> Titulo </template>
              <template v-slot:description> Descrição </template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title> Titulo </template>
              <template v-slot:description> Descrição </template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title> Titulo </template>
              <template v-slot:description> Descrição </template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title> Titulo </template>
              <template v-slot:description> Descrição </template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title> Titulo </template>
              <template v-slot:description> Descrição </template>
            </InsightsCard>
          </div>
        </div>
      </div>
      <div
        v-else
        class="resizable-bar__general-content"
      >
        <div class="resizable-bar__content-doris">
          <img
            class="resizable-bar__doris-image"
            src="../assets/images/doris.png"
            alt="Dóris"
          />
          <h1 class="unnnic-font title-lg resizable-bar__doris-title">
            Como posso te ajudar hoje?
          </h1>
        </div>
        <div class="resizable-bar__content-text">
          <div class="resizable-bar__cards">
            <InsightsCard>
              <template v-slot:title>Titulo</template>
              <template v-slot:description>Descrição</template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title>Titulo</template>
              <template v-slot:description>Descrição</template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title>Titulo</template>
              <template v-slot:description>Descrição</template>
            </InsightsCard>
            <InsightsMainCard @click="showInsights">
              <template v-slot:description>
                Visualizar mais prompts prontos</template
              >
            </InsightsMainCard>
          </div>
        </div>
      </div>
    </div>
    <InsightsInput />
  </aside>
</template>

<script>
import InsightsMainCard from '@/components/InsightsMainCard.vue';
import InsightsCard from '@/components/InsightsCard.vue';
import InsightsInput from '@/components/InsightsInput.vue';

export default {
  name: 'ResizableBar',

  components: {
    InsightsMainCard,
    InsightsCard,
    InsightsInput,
  },

  data() {
    return {
      isResizing: false,
      startY: 0,
      startBottom: -214,
      sidebarBottom: -339,
      minHeight: -320,
      maxHeight: 350,
      sidebarHeight: 350,
      visibleGeneral: false,
      visibleInsights: false,
    };
  },
  methods: {
    startResizing(event) {
      this.isResizing = true;
      this.startY = event.clientY;
      this.startBottom = this.sidebarBottom;
      window.addEventListener('mousemove', this.handleResizing);
      window.addEventListener('mouseup', this.stopResizing);
    },
    handleResizing(event) {
      if (this.isResizing) {
        const offsetY = event.clientY - this.startY;
        this.sidebarBottom = Math.max(
          Math.min(this.startBottom - offsetY, this.maxHeight),
          this.minHeight,
        );
      }
    },
    stopResizing() {
      this.isResizing = false;
      window.removeEventListener('mousemove', this.handleResizing);
      window.removeEventListener('mouseup', this.stopResizing);
    },
    resizeBar() {
      if (this.sidebarBottom != 350) {
        this.sidebarBottom = 350;
      } else {
        this.sidebarBottom = -320;
      }
    },
    showInsights() {
      this.visibleInsights = !this.visibleInsights && !this.visibleGeneral;
    },
  },
};
</script>

<style lang="scss" scoped>
$insightsContainerPadding: $unnnic-spacing-ant * 2;

.resizable-bar {
  z-index: 1;
  position: fixed;
  background-color: $unnnic-color-neutral-white;
  width: calc(100% - $insightsContainerPadding);
  height: 210px;

  &__header {
    display: flex;
    flex-direction: row;
    place-content: space-between;
    align-items: center;
    margin-bottom: 6rem;
    cursor: ns-resize;
    position: relative;
  }

  &__separator {
    border: 1px solid $unnnic-color-neutral-clean;
    border-radius: $unnnic-spacing-nano;
    height: 1px;
    width: 50%;
  }

  .green-color {
    border: 2px solid $unnnic-color-brand-weni;
  }

  &__circle-up {
    border-radius: $unnnic-spacing-nano;
    background-color: $unnnic-color-neutral-white;
    border: none;
    cursor: pointer;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  &__content {
    background-color: $unnnic-color-neutral-white;
    display: flex;
    flex-direction: column;
    place-content: center;
    gap: 2rem;
    padding-bottom: 6rem;

    @media screen and (max-width: 900px) {
      overflow-y: scroll;
      overflow-x: hidden;
    }
  }

  &__content-doris {
    margin-bottom: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__doris-image {
    height: 8rem;
    width: 8rem;
  }

  &__doris-title {
    font-weight: $unnnic-font-weight-bold;
  }

  &__content-text {
    max-height: 164px;
    min-height: 164px;
    padding: 0 8rem;
    margin-bottom: 2.5rem;

    @media screen and (max-width: 900px) {
      padding: unset;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, 2fr);
    grid-template-rows: repeat(2, 2fr);
    grid-column-gap: $unnnic-spacing-sm;
    grid-row-gap: $unnnic-spacing-sm;
  }

  &__insights {
    display: flex;
    flex-direction: column;
    padding: 0 8rem;
    margin-bottom: 3rem;

    @media screen and (max-width: 900px) {
      padding: unset;
    }
  }

  &__insights-description {
    margin-bottom: $unnnic-spacing-xs;
  }

  &__insights-title {
    margin-bottom: $unnnic-spacing-lg;
  }

  &__insights-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    @media screen and (max-width: 900px) {
      max-height: 300px;
      flex-direction: column;
    }
  }

  &__insights-list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
    @media screen and (max-width: 900px) {
      margin-bottom: $unnnic-spacing-lg;
    }
    .list-item {
      font-size: $unnnic-font-size-body-lg;
      cursor: pointer;
      width: 200px;
      padding: $unnnic-spacing-xs;

      &.selected {
        font-weight: $unnnic-font-weight-bold;
        background-color: $unnnic-color-neutral-light;
        padding: $unnnic-spacing-xs;
      }
    }
  }

  &__insights-cards {
    display: grid;
    grid-template-columns: repeat(2, 2fr);
    grid-template-rows: repeat(2, 2fr);
    grid-column-gap: $unnnic-spacing-sm;
    grid-row-gap: $unnnic-spacing-sm;
  }
}
</style>
