import {
  WidgetType,
  WidgetConfig,
  GridPosition,
  WidgetReport,
  CardConfig,
  WidgetInternalType,
  DataCrossingSubwidget,
  ExecutionsCardConfig,
  FlowResultCardConfig,
  DataCrossingCardConfig,
} from './types/WidgetTypes';
import { OutgoingCardConfig } from './types/WidgetOutgoingTypes';

class OutgoingWidget {
  uuid: string;
  name: string;
  type: WidgetInternalType;
  config: WidgetConfig;
  grid_position: GridPosition;
  report: WidgetReport;
  source: string;
  is_configurable: boolean;

  private _prepareCardConfig(config: CardConfig): OutgoingCardConfig {
    const createFlowConfig = (
      config:
        | ExecutionsCardConfig
        | FlowResultCardConfig
        | DataCrossingSubwidget,
    ) => ({
      flow: config.flow.uuid || '',
    });

    const executionsConfig = (config: ExecutionsCardConfig) => ({
      filter: createFlowConfig(config),
    });

    const flowResultConfig = (config: FlowResultCardConfig) => ({
      filter: createFlowConfig(config),
      // report_name: report_name || '',
      op_field: config.flow.result || '',
      operation: config.operation || '',
      currency: config.currency || false,
      data_suffix: config.operation === 'recurrence' ? '%' : '',
    });

    const dataCrossingConfig = (config: DataCrossingCardConfig) => {
      const createSubwidgetConfig = (
        subwidgetConfig: DataCrossingSubwidget,
      ) => ({
        type_result: subwidgetConfig?.result_type || '',
        operation:
          'operation' in subwidgetConfig ? subwidgetConfig?.operation : '',
        filter: createFlowConfig(subwidgetConfig),
        ...(subwidgetConfig?.result_type === 'flow_result'
          ? {
              op_field: subwidgetConfig.flow.result,
              op_sub_field: subwidgetConfig.flow.result_correspondence,
              operation: subwidgetConfig.operation,
            }
          : {}),
      });

      return {
        operator: config.operation || '',
        currency: config.currency || false,
        subwidget_1: createSubwidgetConfig(config.subwidget_1) || {},
        subwidget_2: createSubwidgetConfig(config.subwidget_2) || {},
      };
    };

    const additionalConfigMap = {
      executions: () => executionsConfig(config as ExecutionsCardConfig),
      flow_result: () => flowResultConfig(config as FlowResultCardConfig),
      data_crossing: () => dataCrossingConfig(config as DataCrossingCardConfig),
    };

    const additionalConfig = additionalConfigMap[config.type]?.() || {};

    return {
      type_result: config.type,
      friendly_id: config.friendly_id || '',
      ...additionalConfig,
    };
  }

  private _prepareConfig(widget: WidgetType): WidgetConfig {
    const prepareMap = {
      card: () => this._prepareCardConfig(widget.config as CardConfig),
    };

    return prepareMap[widget.type] ? prepareMap[widget.type]() : widget.config;
  }

  constructor(params: WidgetType) {
    this.uuid = params.uuid;
    this.name = params.name;
    this.type = params.type;
    this.grid_position = params.grid_position;
    this.report = params.report;
    this.source = params.source;
    this.config = this._prepareConfig(params);
    this.is_configurable = params.is_configurable;
  }
}

export default OutgoingWidget;
