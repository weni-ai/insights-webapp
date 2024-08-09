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
  filter: {
    flow: string;
  };
};

export interface OutgoingExecutionsCardConfig extends OutgoingBaseCardConfig {}

export interface OutgoingFlowResultCardConfig extends OutgoingBaseCardConfig {
  operation: string;
  currency: boolean;
  op_field: string;
}
export interface OutgoingDataCrossingCardConfig extends OutgoingBaseCardConfig {
  operator: string;
  currency: boolean;
  friendly_id: string;
  subwidget_1: OutgoingDataCrossingSubwidget;
  subwidget_2: OutgoingDataCrossingSubwidget;
}

type OutgoingDataCrossingSubwidgetExecution = {
  operation: string;
  filter: {
    flow: string;
  };
  type_result: string;
};

type OutgoingDataCrossingSubwidgetFlowResult = {
  filter: {
    flow: string;
  };
  op_field: string;
  op_sub_field: string;
  operation: string;
  type_result: string;
};

type OutgoingDataCrossingSubwidget =
  | OutgoingDataCrossingSubwidgetExecution
  | OutgoingDataCrossingSubwidgetFlowResult;

export type OutgoingCardConfig =
  | OutgoingExecutionsCardConfig
  | OutgoingFlowResultCardConfig
  | OutgoingDataCrossingCardConfig;
