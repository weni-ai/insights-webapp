<template>
  <aside
    class="resizable-bar"
    :class="{ 'resizable-bar--position': isRelative }"
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
        v-if="sidebarBottom"
      >
        <UnnnicIcon
          icon="expand_circle_up"
          size="md"
          scheme="neutral-clean"
          clickable
        />
      </button>
      <button
        @click="resizeBar"
        class="resizable-bar__circle-up"
        v-if="sidebarBottom > 100"
      >
        <UnnnicIcon
          icon="expand_circle_down"
          size="md"
          scheme="neutral-clean"
          clickable
        />
      </button>
      <hr
        :class="{ 'green-color': isResizing }"
        class="resizable-bar__separator"
      />
    </header>
    <section class="resizable-bar__content">
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
            <SugestionCard>
              <template v-slot:title
                >Análise de Desempenho do Atendente</template
              >
              <template v-slot:description>Nos últimos 30 dias</template>
            </SugestionCard>
            <SugestionCard>
              <template v-slot:title>Satisfação do Cliente</template>
              <template v-slot:description
                >Combine os dados de atendimento com feedbacks de satisfação do
                cliente para avaliar a eficácia dos diferentes setores e
                atendentes.</template
              >
            </SugestionCard>
            <SugestionCard>
              <template v-slot:title
                >Relatório de Distribuição de Atendimentos</template
              >
              <template v-slot:description
                >Gere um relatório mostrando a distribuição de atendimentos por
                setor e fila ao longo do tempo, identificando picos de
                demanda.</template
              >
            </SugestionCard>
            <SugestionCard>
              <template v-slot:title>Tendências de Contato</template>
              <template v-slot:description
                >Analise a frequência de contatos de cada cliente e identifique
                padrões ou tendências em suas solicitações de
                atendimento.</template
              >
            </SugestionCard>
            <SugestionCard>
              <template v-slot:title
                >Avaliação de Tags de Encerramento</template
              >
              <template v-slot:description
                >Examine as tags de encerramento do atendimento e determine as
                categorias mais comuns de problemas ou solicitações dos
                clientes.</template
              >
            </SugestionCard>
          </div>
        </div>
      </div>
      <div
        v-else
        class="resizable-bar__general-content"
      >
        <div
          class="resizable-bar__content-doris"
          v-if="showContent"
        >
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
              <template v-slot:title
                >Quais foram os principais erros no meu chatbot?</template
              >
              <template v-slot:description>Nos últimos 30 dias</template>
            </InsightsCard>
            <InsightsCard v-if="showContent">
              <template v-slot:title
                >Quais foram os principais erros no meu chatbot?</template
              >
              <template v-slot:description>Nos últimos 30 dias</template>
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
      </div>
    </section>
    <InsightsInput />
  </aside>
</template>

<script>
import InsightsMainCard from '@/components/InsightsMainCard.vue';
import InsightsCard from '@/components/InsightsCard.vue';
import SugestionCard from '@/components/SugestionCard.vue';
import InsightsInput from '@/components/InsightsInput.vue';

export default {
  name: 'ResizableBar',

  components: {
    InsightsMainCard,
    InsightsCard,
    SugestionCard,
    InsightsInput,
  },

  data() {
    return {
      startY: 0,
      startBottom: -214,
      minHeight: -270,
      maxHeight: 288,
      sidebarHeight: 288,
      sidebarBottom: this.getInitialBarHeight(),
      isResizing: false,
      visibleGeneral: false,
      visibleInsights: false,
      showContent: false,
      isRelative: this.changePosition(),
    };
  },

  methods: {
    getInitialBarHeight() {
      if (this.$route.name === 'home') {
        this.showContent = true;
        return 1;
      } else {
        this.isRelative = false;
        return -270;
      }
    },

    changePosition() {
      if (this.$route.name !== 'home') {
        return (this.isRelative = false);
      } else {
        return (this.isRelative = true);
      }
    },

    updateContentVisibility() {
      if (this.sidebarBottom == this.initialContentHeight) {
        this.showContent = true;
      } else {
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
        this.isRelative = false;
        this.$store.commit('sidebar/setChartVisibility', false);
        this.updateContentVisibility();
        const offsetY = event.clientY - this.startY;
        this.sidebarBottom = Math.max(
          Math.min(this.startBottom - offsetY, this.maxHeight),
          this.minHeight,
        );
      }

      if (this.isResizing && this.sidebarBottom < -200) {
        this.$store.commit('sidebar/setChartVisibility', true);
      }
    },

    stopResizing() {
      this.isResizing = false;
      window.removeEventListener('mousemove', this.handleResizing);
      window.removeEventListener('mouseup', this.stopResizing);
    },

    resizeBar() {
      if (this.sidebarBottom != 288) {
        this.sidebarBottom = 288;
        this.isRelative = false;
        this.$store.commit('sidebar/setChartVisibility', false);
      } else {
        this.sidebarBottom = -270;
        this.$store.commit('sidebar/setChartVisibility', true);
      }

      this.updateContentVisibility();
    },

    showInsights() {
      this.visibleInsights = !this.visibleInsights && !this.visibleGeneral;
      if (this.sidebarBottom != 288) {
        this.sidebarBottom = 288;
        this.isRelative = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$insightsContainerPadding: $unnnic-spacing-ant * 2;

.resizable-bar {
  z-index: 1;
  position: absolute;
  background-color: $unnnic-color-neutral-white;
  width: calc(100% - $insightsContainerPadding);
  height: 210px;

  &__header {
    display: flex;
    flex-direction: row;
    place-content: space-between;
    align-items: center;
    margin-bottom: $unnnic-spacing-lg;
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
    border: 2px solid $unnnic-color-neutral-dark;
  }

  &__circle-up {
    border-radius: 50%;
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

    @media screen and (max-width: 900px) {
      overflow-y: scroll;
      overflow-x: hidden;
    }
  }

  &__general-content {
    margin-bottom: 2rem;
  }

  &__content-doris {
    margin: 3rem;
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
    grid-template-columns: repeat(2, 2fr);
    grid-template-rows: repeat(2, auto);
    grid-column-gap: $unnnic-spacing-xs;
    grid-row-gap: $unnnic-spacing-xs;
  }

  &__insights {
    display: flex;
    flex-direction: column;
    padding: 6rem 8rem 1rem 8rem;

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
    gap: $unnnic-spacing-xs;
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
    grid-template-rows: repeat(2, auto);
    grid-column-gap: $unnnic-spacing-sm;
    grid-row-gap: $unnnic-spacing-sm;
  }
}

.resizable-bar--position {
  position: inherit;
  width: 100%;
}
</style>
