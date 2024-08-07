import {
  WidgetType,
  WidgetConfig,
  GridPosition,
  WidgetReport,
} from './types/WidgetTypes';

type WidgetParams = {
  uuid: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  grid_position: GridPosition;
  report: WidgetReport;
  source: string;
  is_configurable: boolean;
};

class Widget {
  uuid: string;
  name: string;
  type: WidgetType;
  config: WidgetConfig;
  grid_position: GridPosition;
  report: WidgetReport;
  source: string;
  is_configurable: boolean;

  private _treatTableDynamicConfig(config: WidgetConfig): WidgetConfig {
    Object.keys(config).forEach((key) => {
      const [name, scheme] = config[key].icon.split(':');
      config[key].icon = { name, scheme };
    });

    return {
      ...config,
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
    this.is_configurable = !!params.is_configurable;
  }
}

export default Widget;
