<template>
  <div
    class="resizable-bar"
    :style="{
      bottom: sidebarBottom + 'px',
      height: `${Math.min(sidebarHeight, maxHeight)}px`,
    }"
  >
    <div class="resizable-bar__header" @mousedown="startResizing">
      <hr :class="{ 'green-color': isResizing }" />
      <button @click="resizeBar">
        <img src="../assets/images/icons/expand_circle_up.png" alt="Seta" />
      </button>
      <hr :class="{ 'green-color': isResizing }" />
    </div>
    <div class="resizable-bar__content">
      <div v-if="visibleInsights" class="insights">
        <div>
          <p>InsightsGPT:</p>
          <h2>Aqui estão algumas sugestões para você:</h2>
        </div>
        <div class="insights-content">
          <div class="insights-list">
            <ul>
              <li>Recentes</li>
              <li>Segmentos</li>
              <li>Varejo</li>
              <li>Weni plataforma</li>
              <li class="selected">Atendimento humano</li>
            </ul>
          </div>
          <div class="insights-cards">
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="general-content">
        <div class="content-doris">
          <img src="../assets/images/doris.png" alt="Dóris" />
          <h1>Como posso te ajudar hoje?</h1>
        </div>
        <div class="content-text">
          <div class="cards">
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div class="prompt-card">
              <p class="prompt-card-title">
                Quais foram os principais erros no meu chatbot?
              </p>
              <p class="prompt-card-description">Nos últimos 30 dias</p>
            </div>
            <div @click="showInsights" class="prompt-card more-prompts-card">
              <p>Visualizar mais prompts prontos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content-input">
      <input type="text" placeholder="Peça insights ao InsightsGPT..." />
      <button><img src="../assets/images/icons/send.png" alt="" /></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResizableBar',

  data() {
    return {
      isResizing: false,
      startY: 0,
      startBottom: -214,
      sidebarBottom: -214,
      minHeight: -214,
      maxHeight: 300,
      sidebarHeight: 230,
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
      if (this.sidebarBottom != 300) {
        this.sidebarBottom = 300;
      } else {
        this.sidebarBottom = -214;
      }
    },
    showInsights() {
      this.visibleInsights = !this.visibleInsights && !this.visibleGeneral;
    },
  },
};
</script>

<style lang="scss" scoped>
.resizable-bar {
  z-index: 1;
  position: fixed;
  right: 0;
  background-color: $unnnic-color-neutral-white;
  width: 100%;
  height: 210px;

  &__header {
    display: flex;
    flex-direction: row;
    place-content: space-between;
    align-items: center;
    margin-bottom: $unnnic-spacing-lg;
    cursor: ns-resize;
    position: relative;

    button {
      border-radius: 50%;
      background-color: white;
      border: none;
      cursor: pointer;
      position: absolute;
      right: 49.1%;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    hr {
      border: 1px solid $unnnic-color-neutral-clean;
      border-radius: 5px;
      height: 1px;
      width: 50%;
    }

    .green-color {
      border: 2px solid $unnnic-color-brand-weni !important;
    }
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

    .content-doris {
      text-align: center;
      margin-bottom: 2rem;
      h1 {
        font-weight: 700;
        font-size: 24px;
      }
      img {
        height: 8rem;
        width: 8rem;
      }
    }

    .content-text {
      max-height: 164px;
      min-height: 164px;
      padding: 0 8rem;
      margin-bottom: 2.5rem;

      @media screen and (max-width: 900px) {
        padding: unset;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(2, 2fr);
        grid-template-rows: repeat(2, 2fr);
        grid-column-gap: $unnnic-spacing-sm;
        grid-row-gap: $unnnic-spacing-sm;

        .more-prompts-card {
          background-color: $unnnic-color-neutral-soft;
          color: $unnnic-color-neutral-darkest;
          font-size: 20px;
          font-weight: 700;
        }
      }
    }

    .insights {
      display: flex;
      flex-direction: column;
      padding: 0 8rem;

      @media screen and (max-width: 900px) {
        padding: unset;
      }

      p {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      h2 {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 3rem;
      }

      .insights-content {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        @media screen and (max-width: 900px) {
          max-height: 300px;
          flex-direction: column;
        }

        .insights-list {
          ul {
            display: flex;
            flex-direction: column;
            gap: $unnnic-spacing-nano;
            @media screen and (max-width: 900px) {
              margin-bottom: 2rem;
            }
            li {
              font-size: 14px;
              padding: $unnnic-spacing-nano;
              cursor: pointer;
              width: 200px;

              &.selected {
                font-weight: 700;
                background-color: $unnnic-color-neutral-light;
                padding: 8px 8px 8px 8px;
              }
            }
          }
        }

        .insights-cards {
          display: grid;
          grid-template-columns: repeat(2, 2fr);
          grid-template-rows: repeat(2, 2fr);
          grid-column-gap: 16px;
          grid-row-gap: 16px;
        }
      }
    }
  }
  .content-input {
    margin-top: auto;
    width: 100%;
    padding: 0 8rem;
    display: flex;
    flex-direction: row;
    position: relative;
    margin-top: 2rem;

    @media screen and (max-width: 900px) {
      padding: unset;
    }

    input {
      width: 100%;
      height: 62px;
      padding: $unnnic-spacing-xs;
      border: none;
      border-radius: $unnnic-spacing-nano;
      background-color: $unnnic-color-neutral-lightest;
      color: $unnnic-color-neutral-cloudy;
    }

    button {
      position: absolute;
      height: 46px;
      width: 46px;
      border: 2px $unnnic-color-neutral-cleanest solid;
      border-radius: $unnnic-border-radius-sm;
      background-color: $unnnic-color-neutral-white;
      right: 8.5rem;
      top: 0.6rem;
      cursor: pointer;

      @media screen and (max-width: 900px) {
        right: 0;
      }
    }
  }
  .prompt-card {
    background-color: $unnnic-color-neutral-lightest;
    padding: $unnnic-spacing-sm;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    cursor: pointer;

    .prompt-card-title {
      color: $unnnic-color-neutral-darkest;
      font-weight: 700;
      font-size: 14px;
    }

    .prompt-card-description {
      color: $unnnic-color-neutral-dark;
      font-size: 12px;
    }
  }
}
</style>
