import {
  OutgoingCardConfig,
  OutgoingDataCrossingSubwidget,
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
    const createFlowConfig = (
      config: OutgoingCardConfig | OutgoingDataCrossingSubwidget,
    ) => ({
      uuid: config.filter?.flow || '',
      result: 'op_field' in config ? config.op_field : '',
    });

    const createSubwidgetConfig = (
      subwidgetConfig: OutgoingDataCrossingSubwidget,
    ) => ({
      result_type: subwidgetConfig?.type_result || '',
      operation:
        'operation' in subwidgetConfig ? subwidgetConfig?.operation : '',
      flow: {
        ...createFlowConfig(subwidgetConfig),
        result_correspondence:
          'op_sub_field' in subwidgetConfig
            ? subwidgetConfig?.op_sub_field
            : '',
      },
    });

    const flowResultConfig = {
      report_name: report_name || '',
      flow: createFlowConfig(config),
      operation: 'operation' in config ? config.operation : '',
      currency: 'currency' in config ? config.currency : false,
      data_suffix:
        'operation' in config && config.operation === 'recurrence' ? '%' : '',
    };

    const dataCrossingConfig = {
      operation: 'operator' in config ? config.operator : '',
      currency: 'currency' in config ? config.currency : false,
      friendly_id: 'friendly_id' in config ? config.friendly_id : '',
      subwidget_1:
        'subwidget_1' in config
          ? createSubwidgetConfig(config.subwidget_1)
          : {},
      subwidget_2:
        'subwidget_2' in config
          ? createSubwidgetConfig(config.subwidget_2)
          : {},
    };

    const additionalConfigMap = {
      flow_result: flowResultConfig,
      data_crossing: dataCrossingConfig,
    };

    const additionalConfig = additionalConfigMap[config.type_result] || {};

    return {
      name,
      type: config.type_result || '',
      flow: {
        uuid: config.filter?.flow || '',
      },
      ...additionalConfig,
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
