import { describe, it, expect } from 'vitest';
import WidgetOutgoing from '../WidgetOutgoing';

describe('Model WidgetOutgoing', () => {
  const baseWidgetParams = {
    uuid: 'uuid',
    name: 'Test Widget',
    type: 'card',
    grid_position: { x: 0, y: 0 },
    report: { type: 'test_report', data: [] },
    report_name: 'Test Report',
    source: 'test_source',
    is_configurable: true,
  };

  it('should initialize with a valid widget type and prepare card configuration', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: {
        type: 'executions',
        flow: { uuid: 'flow-uuid-1' },
      },
    };

    const widget = new WidgetOutgoing(widgetParams);

    expect(widget.uuid).toBe('uuid');
    expect(widget.name).toBe('Test Widget');
    expect(widget.type).toBe('card');
    expect(widget.config).toEqual({
      config_type: '',
      type_result: 'executions',
      friendly_id: '',
      filter: { flow: 'flow-uuid-1' },
      operation: 'count',
    });
  });

  it('should handle flow_result configuration with all fields', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: {
        type: 'flow_result',
        flow: { uuid: 'flow-uuid-2', result: 'field_1' },
        operation: 'sum',
        currency: true,
      },
    };

    const widget = new WidgetOutgoing(widgetParams);

    expect(widget.config).toEqual({
      config_type: '',
      type_result: 'flow_result',
      friendly_id: '',
      filter: { flow: 'flow-uuid-2' },
      op_field: 'field_1',
      operation: 'sum',
      currency: true,
      data_suffix: '',
    });
  });

  it('should handle data_crossing configuration with subwidgets', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: {
        type: 'data_crossing',
        operation: 'max',
        currency: true,
        subwidget_1: {
          result_type: 'flow_result',
          flow: {
            uuid: 'flow-uuid-3',
            result: 'field_2',
            result_correspondence: 'sub_field_2',
          },
          operation: 'avg',
        },
        subwidget_2: {
          result_type: 'executions',
          flow: { uuid: 'flow-uuid-4' },
        },
      },
    };

    const widget = new WidgetOutgoing(widgetParams);

    expect(widget.config).toEqual({
      config_type: 'crossing_data',
      type_result: 'data_crossing',
      friendly_id: '',
      operator: 'max',
      currency: true,
      subwidget_1: {
        type_result: 'flow_result',
        operation: 'avg',
        filter: { flow: 'flow-uuid-3' },
        op_field: 'field_2',
        op_sub_field: 'sub_field_2',
      },
      subwidget_2: {
        type_result: 'executions',
        operation: '',
        filter: { flow: 'flow-uuid-4' },
      },
    });
  });

  it('should handle missing or invalid config gracefully', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: {
        type: 'executions',
        flow: {},
      },
    };

    const widget = new WidgetOutgoing(widgetParams);

    expect(widget.config).toEqual({
      config_type: '',
      type_result: 'executions',
      friendly_id: '',
      filter: { flow: '' },
      operation: 'count',
    });
  });

  it('should default to widget config if type is not recognized', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: {
        type: 'unknown_type',
        custom_field: 'custom_value',
      },
    };

    const widget = new WidgetOutgoing(widgetParams);

    expect(widget.config).toMatchObject({
      type: 'unknown_type',
      custom_field: 'custom_value',
    });
  });
});
