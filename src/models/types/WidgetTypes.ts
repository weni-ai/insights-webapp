export type WidgetType = {
  report_name?: string;
  uuid: string;
  name: string;
  type: WidgetInternalType;
  config: WidgetConfig;
  grid_position: GridPosition;
  report: WidgetReport;
  source: string;
  is_configurable: boolean;
};

export type GridPosition = {
  column_start: number;
  column_end: number;
  row_start: number;
  row_end: number;
};

type GraphColumnConfig = {
  start_time: string;
  end_time: string;
  interval: string;
};

type GraphBarConfig = object;

type GraphFunnelConfig = object;

type TableFieldConfig = {
  name: string;
  value: string;
  display: boolean;
  hidden_name: boolean;
};

type TableConfig = {
  name_overwrite: string;
  icon:
    | {
        name: string;
        scheme: string;
      }
    | `${string}:${string}`;
  fields: TableFieldConfig[];
};

export type TableDynamicByFilterConfig = {
  default?: TableConfig;
  created_on?: TableConfig;
};

type TableGroupConfig = object;

export type CardConfigTypeResults =
  | 'executions'
  | 'flow_result'
  | 'data_crossing'
  | '';

type BaseCardConfig = {
  name: string;
  type: CardConfigTypeResults;
  friendly_id: string;
  data_type?: string;
};

export interface ExecutionsCardConfig extends BaseCardConfig {
  type: 'executions';
  flow: {
    uuid: string;
  };
}

export interface FlowResultCardConfig extends BaseCardConfig {
  type: 'flow_result';
  report_name?: string;
  flow: {
    uuid: string;
    result: string;
  };
  operation: string;
  currency: boolean;
  data_suffix: string;
}

export interface DataCrossingCardConfig extends BaseCardConfig {
  operation: string;
  currency: boolean;
  subwidget_1: DataCrossingSubwidget;
  subwidget_2: DataCrossingSubwidget;
}

type DataCrossingSubwidgetExecution = {
  result_type: 'executions';
  operation: string;
  flow: {
    uuid: string;
  };
};

export type DataCrossingSubwidgetFlowResult = {
  flow: {
    uuid: string;
    result: string;
    result_correspondence: string;
  };
  result_type: 'flow_result';
  operation: string;
};

export interface CsatOrNpsCardConfig {
  filter: {
    flow: string;
  };
  op_field: string;
  type: string;
  operation: string;
  datalake_config: {
    type: string;
    agent_uuid: string;
  };
}

export type DataCrossingSubwidget =
  | DataCrossingSubwidgetExecution
  | DataCrossingSubwidgetFlowResult;

export type CardConfig =
  | ExecutionsCardConfig
  | FlowResultCardConfig
  | DataCrossingCardConfig
  | CsatOrNpsCardConfig
  | BaseCardConfig;

type InsightConfig = object;

export type WidgetConfig =
  | GraphColumnConfig
  | GraphBarConfig
  | GraphFunnelConfig
  | TableDynamicByFilterConfig
  | TableGroupConfig
  | CardConfig
  | InsightConfig;

export type WidgetInternalType =
  | 'graph_column'
  | 'graph_bar'
  | 'graph_funnel'
  | 'table_dynamic_by_filter'
  | 'table_group'
  | 'card'
  | 'insight'
  | 'flow_result';

export type WidgetReport = {
  type: 'internal' | 'external';
  url: string;
};
