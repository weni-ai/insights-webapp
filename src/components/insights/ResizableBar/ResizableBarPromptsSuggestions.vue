<template>
  <section class="resizable-bar__insights">
    <header class="resizable-bar__insights-header">
      <p class="resizable-bar__insights-description unnnic-font body-md bold">
        InsightsGPT:
      </p>
      <h2 class="resizable-bar__insights-title unnnic-font title-sm bold">
        Aqui estão algumas sugestões para você:
      </h2>
    </header>
    <section class="resizable-bar__insights-content">
      <nav class="resizable-bar__insights-nav">
        <ul class="resizable-bar__insights-list">
          <li class="list-item">Recentes</li>
          <li class="list-item">Segmentos</li>
          <li class="list-item">Varejo</li>
          <li class="list-item">Weni plataforma</li>
          <li class="list-item selected">Atendimento humano</li>
        </ul>
      </nav>
      <section class="resizable-bar__insights-cards">
        <SugestionCard>
          <template v-slot:title>Análise de Desempenho do Atendente</template>
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
            padrões ou tendências em suas solicitações de atendimento.</template
          >
        </SugestionCard>
        <SugestionCard>
          <template v-slot:title>Avaliação de Tags de Encerramento</template>
          <template v-slot:description
            >Examine as tags de encerramento do atendimento e determine as
            categorias mais comuns de problemas ou solicitações dos
            clientes.</template
          >
        </SugestionCard>
      </section>
    </section>
  </section>
</template>

<script>
import SugestionCard from '@/components/SugestionCard.vue';

export default {
  name: 'ResizableBarPromptsSuggestions',
  components: {
    SugestionCard,
  },
};
</script>

<style lang="scss" scoped>
.resizable-bar {
  &__insights {
    display: flex;
    flex-direction: column;
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
  }

  &__insights-list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;

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
</style>
