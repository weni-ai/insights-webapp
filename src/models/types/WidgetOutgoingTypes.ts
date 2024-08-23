import {
  WidgetConfig,
  WidgetReport,
  WidgetInternalType,
  CardConfigTypeResults,
} from './WidgetTypes';

export type OutgoingWidgetType =
  | OutgoingWidgetTypeBase
  | OutgoingWidgetTypeCard;

type OutgoingWidgetTypeBase = {
  uuid: string;
  name: string;
  type: WidgetInternalType;
  config: WidgetConfig;
  grid_position: any;
  report: WidgetReport;
  source: string;
  is_configurable: boolean;
};

export interface OutgoingWidgetTypeCard extends OutgoingWidgetTypeBase {
  config: OutgoingCardConfig;
  type: 'card';
  source: 'flowruns';
  report_name?: string;
}

type OutgoingBaseCardConfig = {
  type_result: CardConfigTypeResults;
  friendly_id: string;
};

export interface OutgoingExecutionsCardConfig extends OutgoingBaseCardConfig {
  type_result: 'executions';
  filter: {
    flow: string;
  };
}

export interface OutgoingFlowResultCardConfig extends OutgoingBaseCardConfig {
  type_result: 'flow_result';
  filter: {
    flow: string;
  };
  operation: string;
  currency: boolean;
  op_field: string;
}
export interface OutgoingDataCrossingCardConfig extends OutgoingBaseCardConfig {
  type_result: 'data_crossing';
  config_type: 'crossing_data';
  operator: string;
  currency: boolean;
  subwidget_1: OutgoingDataCrossingSubwidget;
  subwidget_2: OutgoingDataCrossingSubwidget;
}

type OutgoingDataCrossingSubwidgetExecution = {
  type_result: 'executions';
  operation: string;
  filter: {
    flow: string;
  };
};

type OutgoingDataCrossingSubwidgetFlowResult = {
  type_result: 'flow_result';
  filter: {
    flow: string;
  };
  op_field: string;
  op_sub_field: string;
  operation: string;
};

export type OutgoingDataCrossingSubwidget =
  | OutgoingDataCrossingSubwidgetExecution
  | OutgoingDataCrossingSubwidgetFlowResult;

export type OutgoingCardConfig =
  | OutgoingExecutionsCardConfig
  | OutgoingFlowResultCardConfig
  | OutgoingDataCrossingCardConfig;
