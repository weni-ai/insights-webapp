import {
  WidgetType,
  WidgetConfig,
  GridPosition,
  WidgetReport,
  CardConfig,
  WidgetInternalType,
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
    const isFlowResult = config.type === 'flow_result';

    const flowResultConfig = isFlowResult
      ? {
          op_field: 'result' in config.flow ? config.flow.result : '',
          operation: 'operation' in config ? config.operation : '',
          currency: 'operation' in config ? config.currency : '',
        }
      : {};

    return {
      filter: { flow: config.flow.uuid || '' },
      type_result: config.type,
      ...flowResultConfig,
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
