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

type TableDynamicByFilterConfig = {
  default?: TableConfig;
  created_on?: TableConfig;
};

type TableGroupConfig = object;

type CardConfig = object;

type InsightConfig = object;

export type WidgetConfig =
  | GraphColumnConfig
  | GraphBarConfig
  | GraphFunnelConfig
  | TableDynamicByFilterConfig
  | TableGroupConfig
  | CardConfig
  | InsightConfig;

export type WidgetType =
  | 'graph_column'
  | 'graph_bar'
  | 'graph_funnel'
  | 'table_dynamic_by_filter'
  | 'table_group'
  | 'card'
  | 'insight';

export type WidgetReport = {
  type: 'internal' | 'external';
  url: string;
};
