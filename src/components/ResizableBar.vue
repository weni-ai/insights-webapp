<template>
  <aside
    class="resizable-bar"
    :class="{ 'relative-class': isRelative }"
    :style="{
      bottom: sidebarBottom + '%',
      height: `${Math.min(sidebarHeight, maxHeight)}%`,
    }"
  >
    <header class="resizable-bar__header">
      <hr
        :class="{ 'green-color': isResizing }"
        class="resizable-bar__separator"
      />
      <button
        @click="resizeBar"
        class="resizable-bar__circle-up"
        v-if="sidebarBottom"
      >
        <unnnic-icon
          icon="expand_circle_up"
          size="md"
          scheme="neutral-cleanest"
          clickable
        />
      </button>
      <button
        @click="resizeBar"
        class="resizable-bar__circle-up"
        v-if="sidebarBottom > (-83 || -163)"
      >
        <unnnic-icon
          icon="expand_circle_down"
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
    <section class="resizable-bar__content">
      <section v-if="visibleInsights" class="resizable-bar__insights">
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
      </section>
      <section v-else class="resizable-bar__general-content">
        <div class="resizable-bar__content-doris" v-if="showContent">
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
            <InsightsCard v-if="showContent">
              <template v-slot:title>Titulo</template>
              <template v-slot:description>Descrição</template>
            </InsightsCard>
            <InsightsCard v-if="showContent">
              <template v-slot:title>Titulo</template>
              <template v-slot:description>Descrição</template>
            </InsightsCard>
            <InsightsCard>
              <template v-slot:title
                >Quais foram os principais erros no meu chatbot?</template
              >
              <template v-slot:description>Nos últimos 30 dias</template>
            </InsightsCard>
            <InsightsMainCard @click="showInsights">
              <template v-slot:description>
                Visualizar mais prompts prontos</template
              >
            </InsightsMainCard>
          </div>
        </div>
      </section>
    </section>
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
      startY: 0,
      startBottom: -163,
      minHeight: -320,
      maxHeight: 165,
      sidebarHeight: 165,
      initialContentHeight: -126,
      sidebarBottom: this.getInitialBarHeight(),
      sidebarLimit: 203,
      isResizing: false,
      visibleGeneral: false,
      visibleInsights: false,
      showContent: false,
      isRelative: false,
    };
  },

  methods: {
    getInitialBarHeight() {
      if (this.$route.path === '/insights') {
        this.showContent = false;
        this.isRelative = true;
        return -126;
      } else {
        return -163;
      }
    },
    updateContentVisibility() {
      if (this.sidebarBottom == this.initialContentHeight) {
        this.showContent = true;
      } else {
        this.showContent = true;
      }
    },
    showSomeContent() {
      if (this.sidebarBottom > 134) {
        this.showContent = true;
      }
    },
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

        this.updateContentVisibility();
      }
    },
    stopResizing() {
      this.isResizing = false;
      window.removeEventListener('mousemove', this.handleResizing);
      window.removeEventListener('mouseup', this.stopResizing);
    },
    resizeBar() {
      if (this.sidebarBottom != -82) {
        this.sidebarBottom = -82;
        this.$store.commit('sidebar/setChartVisibility', false);
      } else {
        this.sidebarBottom = -163;
        this.$store.commit('sidebar/setChartVisibility', true);
      }

      this.updateContentVisibility();
    },

    showChart() {
      this.showChart = true;
    },

    showInsights() {
      this.visibleInsights = !this.visibleInsights && !this.visibleGeneral;
      if (this.sidebarBottom != -80) {
        this.sidebarBottom = -80;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.resizable-bar {
  z-index: 1;
  position: absolute;
  background-color: $unnnic-color-neutral-white;
  width: 100%;
  height: 100%;

  &__header {
    display: flex;
    flex-direction: row;
    place-content: space-between;
    align-items: center;
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
    margin: 1rem 0;

    @media screen and (max-width: 900px) {
      overflow-y: scroll;
      overflow-x: hidden;
    }
  }

  &__content-doris {
    margin-bottom: 2rem;
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
    padding: 0 8rem;

    @media screen and (max-width: 900px) {
      padding: unset;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, auto);
    grid-template-rows: repeat(2, auto);
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
    grid-column-gap: $unnnic-spacing-sm;
    grid-row-gap: $unnnic-spacing-sm;
  }
}
</style>
