import { WidgetType, WidgetConfig, GridPosition } from './types/WidgetTypes';

type WidgetParams = {
  uuid: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  grid_position: GridPosition;
  report: string;
  source: string;
};

class Widget {
  uuid: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  grid_position: GridPosition;
  report: string;
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
