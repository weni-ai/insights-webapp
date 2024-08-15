import {
  OutgoingDataCrossingCardConfig,
  OutgoingDataCrossingSubwidget,
  OutgoingExecutionsCardConfig,
  OutgoingFlowResultCardConfig,
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
      subconfig:
        | OutgoingExecutionsCardConfig
        | OutgoingFlowResultCardConfig
        | OutgoingDataCrossingSubwidget,
    ) => ({
      uuid: subconfig.filter?.flow || '',
      ...(subconfig.type_result === 'flow_result'
        ? {
            result: subconfig?.op_field || '',
          }
        : {}),
      ...('op_sub_field' in config
        ? {
            result_correspondence: config?.op_sub_field || '',
          }
        : {}),
    });

    const executionsConfig = (config: OutgoingExecutionsCardConfig) => ({
      flow: createFlowConfig(config),
    });

    const flowResultConfig = (config: OutgoingFlowResultCardConfig) => ({
      report_name: report_name || '',
      flow: createFlowConfig(config),
      operation: config.operation || '',
      currency: config.currency || false,
      data_suffix: config.operation === 'recurrence' ? '%' : '',
    });

    const dataCrossingConfig = (config: OutgoingDataCrossingCardConfig) => {
      const createSubwidgetConfig = (
        subwidgetConfig: OutgoingDataCrossingSubwidget,
      ) => ({
        result_type: subwidgetConfig?.type_result || 'executions',
        operation: subwidgetConfig?.operation || 'avg',
        flow: {
          ...createFlowConfig(subwidgetConfig),
          ...(subwidgetConfig?.type_result === 'flow_result'
            ? {
                result: subwidgetConfig?.op_field || '',
                result_correspondence: subwidgetConfig?.op_sub_field || '',
              }
            : {}),
        },
      });

      return {
        operation: config.operator || 'min',
        currency: config.currency || false,
        subwidget_1: createSubwidgetConfig(config.subwidget_1) || {},
        subwidget_2: createSubwidgetConfig(config.subwidget_2) || {},
      };
    };

    const additionalConfigMap = {
      executions: () =>
        executionsConfig(config as OutgoingExecutionsCardConfig),
      flow_result: () =>
        flowResultConfig(config as OutgoingFlowResultCardConfig),
      data_crossing: () =>
        dataCrossingConfig(config as OutgoingDataCrossingCardConfig),
    };

    const additionalConfig = additionalConfigMap[config.type_result]?.() || {};

    return {
      name,
      type: config.type_result || '',
      friendly_id: config.friendly_id || '',
      data_type: config.data_type || '',
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
