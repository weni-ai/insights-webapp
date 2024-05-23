interface WidgetGridPosition {
  column_start: number;
  column_end: number;
  row_start: number;
  row_end: number;
}

type WidgetType =
  | 'time_colum_graph'
  | 'bar_graph'
  | 'funnel'
  | 'dynamic_by_filter_table'
  | 'tablegroup'
  | 'card'
  | 'insight';

interface WidgetParams {
  uuid: string;
  name: string;
  type: WidgetType;
  config: any; // TODO
  grid_position: WidgetGridPosition;
  report: any; // TODO
  source: string;
}

class Widget {
  uuid: string;
  name: string;
  type: WidgetType;
  config: any; // TODO
  grid_position: WidgetGridPosition;
  report: any; // TODO
  source: string;

  constructor(params: WidgetParams) {
    this.uuid = params.uuid;
    this.name = params.name;
    this.type = params.type;
    this.config = params.config;
    this.grid_position = params.grid_position;
    this.report = params.report;
    this.source = params.source;
  }
}

export default Widget;
