import { describe, it, expect } from 'vitest';
import Widget from '../Widget';

describe('Model Widget', () => {
  const baseWidgetParams = {
    uuid: 'uuid',
    name: 'Test Widget',
    type: 'card',
    grid_position: { x: 0, y: 0, width: 1, height: 1 },
    report: { type: 'sample_report', data: [] },
    source: 'test_source',
    is_configurable: true,
  };

  it('should initialize with given parameters and process card type config', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: {
        type_result: 'flow_result',
        friendly_id: 'test_friendly_id',
        data_type: 'string',
        operation: 'recurrence',
        currency: true,
        op_field: 'test_op_field',
        op_sub_field: 'test_op_sub_field',
        filter: { flow: 'flow_uuid' },
      },
      report_name: 'Test Report',
    };

    const widget = new Widget(widgetParams);

    expect(widget.uuid).toBe('uuid');
    expect(widget.name).toBe('Test Widget');
    expect(widget.type).toBe('card');
    expect(widget.grid_position).toEqual({ x: 0, y: 0, width: 1, height: 1 });
    expect(widget.report).toEqual({ type: 'sample_report', data: [] });
    expect(widget.source).toBe('test_source');
    expect(widget.is_configurable).toBe(true);

    expect(widget.config).toEqual({
      name: 'Test Widget',
      type: 'flow_result',
      friendly_id: 'test_friendly_id',
      data_type: 'string',
      report_name: 'Test Report',
      flow: {
        uuid: 'flow_uuid',
        result: 'test_op_field',
        result_correspondence: 'test_op_sub_field',
      },
      operation: 'recurrence',
      currency: true,
      data_suffix: '%',
    });
  });

  it('should handle table_dynamic_by_filter type config correctly', () => {
    const widgetParams = {
      ...baseWidgetParams,
      type: 'table_dynamic_by_filter',
      config: {
        key1: { icon: 'icon1:scheme1' },
        key2: { icon: 'icon2:scheme2' },
      },
    };

    const widget = new Widget(widgetParams);

    expect(widget.config).toEqual({
      key1: { icon: { name: 'icon1', scheme: 'scheme1' } },
      key2: { icon: { name: 'icon2', scheme: 'scheme2' } },
    });
  });

  it('should initialize with unprocessed config for unsupported types', () => {
    const widgetParams = {
      ...baseWidgetParams,
      type: 'unsupported_type',
      config: { rawConfigKey: 'rawConfigValue' },
    };

    const widget = new Widget(widgetParams);

    expect(widget.config).toEqual({ rawConfigKey: 'rawConfigValue' });
  });

  it('should handle missing optional parameters correctly', () => {
    const widgetParams = {
      ...baseWidgetParams,
      config: { type_result: 'executions' },
      is_configurable: undefined,
    };

    const widget = new Widget(widgetParams);

    expect(widget.is_configurable).toBe(false);
    expect(widget.config).toEqual({
      name: 'Test Widget',
      type: 'executions',
      friendly_id: '',
      data_type: '',
      flow: { uuid: '' },
    });
  });

  describe('dataCrossingConfig', () => {
    it('should process data_crossing type with subwidget configurations', () => {
      const widgetParams = {
        ...baseWidgetParams,
        config: {
          type_result: 'data_crossing',
          operator: 'max',
          currency: true,
          subwidget_1: {
            type_result: 'flow_result',
            operation: 'sum',
            op_field: 'field_1',
            op_sub_field: 'sub_field_1',
            filter: { flow: 'flow_uuid_1' },
          },
          subwidget_2: {
            type_result: 'executions',
            operation: 'avg',
            filter: { flow: 'flow_uuid_2' },
          },
        },
      };

      const widget = new Widget(widgetParams);

      expect(widget.config).toEqual({
        type: 'data_crossing',
        data_type: '',
        friendly_id: '',
        name: 'Test Widget',
        operation: 'max',
        currency: true,
        subwidget_1: {
          result_type: 'flow_result',
          operation: 'sum',
          flow: {
            uuid: 'flow_uuid_1',
            result: 'field_1',
            result_correspondence: 'sub_field_1',
          },
        },
        subwidget_2: {
          result_type: 'executions',
          operation: 'avg',
          flow: {
            uuid: 'flow_uuid_2',
          },
        },
      });
    });

    it('should default to "min" operation and false currency when not provided', () => {
      const widgetParams = {
        ...baseWidgetParams,
        config: {
          type_result: 'data_crossing',
          subwidget_1: {
            type_result: 'flow_result',
            filter: { flow: 'flow_uuid_1' },
          },
          subwidget_2: {
            operation: 'sum',
            filter: { flow: 'flow_uuid_2' },
          },
        },
      };

      const widget = new Widget(widgetParams);

      expect(widget.config).toMatchObject({
        operation: 'min',
        currency: false,
      });
    });

    it('should ignore invalid subwidget configurations', () => {
      const widgetParams = {
        ...baseWidgetParams,
        config: {
          type_result: 'data_crossing',
          operator: 'avg',
          subwidget_1: { type_result: null, operation: null },
          subwidget_2: { type_result: null },
        },
      };

      const widget = new Widget(widgetParams);

      expect(widget.config).toMatchObject({
        subwidget_1: {
          result_type: 'executions',
          operation: 'avg',
          flow: {
            uuid: '',
          },
        },
        subwidget_2: {
          result_type: 'executions',
          operation: 'avg',
          flow: {
            uuid: '',
          },
        },
      });
    });
  });
});
