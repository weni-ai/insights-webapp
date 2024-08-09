import {
  OutgoingWidgetType,
  OutgoingWidgetTypeCard,
} from './types/WidgetOutgoingTypes';
import {
  WidgetConfig,
  GridPosition,
  WidgetReport,
  CardConfig,
  WidgetInternalType,
} from './types/WidgetTypes';

class Widget {
  uuid: string;
  name: string;
  type: WidgetInternalType;
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

  private _treatCardConfig({
    name,
    config,
    report_name,
  }: OutgoingWidgetTypeCard): CardConfig {
    const isFlowResult = config.type_result === 'flow_result';

    const flowResultConfig = isFlowResult
      ? {
          report_name: report_name || '',
          flow: {
            uuid: config.filter?.flow || '',
            result: 'op_field' in config ? config.op_field : '',
          },
          operation: 'operation' in config ? config.operation : '',
          currency: 'currency' in config ? config.currency : false,
          data_suffix:
            'operation' in config && config.operation === 'recurrence'
              ? '%'
              : '',
        }
      : {};

    return {
      name,
      type: config.type_result || '',
      flow: {
        uuid: config.filter?.flow || '',
      },
      ...flowResultConfig,
    };
  }

  private _treatConfig(widget: OutgoingWidgetType): WidgetConfig {
    const treatMap = {
      table_dynamic_by_filter: () =>
        this._treatTableDynamicConfig(widget.config),
      card: () =>
        this._treatCardConfig({
          name: widget.name,
          config: widget.config,
          report_name: 'report_name' in widget ? widget.report_name : '',
        } as OutgoingWidgetTypeCard),
    };

    return treatMap[widget.type] ? treatMap[widget.type]() : widget.config;
  }

  constructor(params: OutgoingWidgetType) {
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
