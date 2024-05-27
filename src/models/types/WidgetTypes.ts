type FilterConfig = {
  filter: object;
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
} & FilterConfig;

type GraphBarConfig = FilterConfig;

type GraphFunnelConfig = FilterConfig;

type TableFieldConfig = {
  name: string;
  value: string;
  display: boolean;
  hidden_name: boolean;
};

type TableConfig = {
  name_overwrite: string;
  icon: {
    name: string;
    scheme: string;
  };
  fields: TableFieldConfig[];
} & FilterConfig;

type TableDynamicByFilterConfig = {
  default: TableConfig;
  created_on: TableConfig;
};

type TableGroupConfig = FilterConfig;

type CardConfig = FilterConfig;

type InsightConfig = FilterConfig;

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
