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

  private _treatTableDynamicConfig(config: WidgetConfig): WidgetConfig {
    let dynamicConfigKey = 'created_on' in config ? 'created_on' : 'default';

    const [name, scheme] = config[dynamicConfigKey].icon.split(':');

    return {
      ...config[dynamicConfigKey],
      icon: { name, scheme },
    };
  }

  private _treatConfig(widget: WidgetParams): WidgetConfig {
    const treatMap = {
      table_dynamic_by_filter: () =>
        this._treatTableDynamicConfig(widget.config),
    };

    return treatMap[widget.type] ? treatMap[widget.type]() : widget.config;
  }

  constructor(params: WidgetParams) {
    this.uuid = params.uuid;
    this.name = params.name;
    this.type = params.type;
    this.grid_position = params.grid_position;
    this.report = params.report;
    this.source = params.source;
    this.config = this._treatConfig(params);
  }
}

export default Widget;
