import { describe, it, expect, vi, beforeEach } from 'vitest';

import WidgetService from '../widgets';
import http from '@/services/api/http';
import { WidgetOutgoing } from '@/models';

vi.mock('@/services/api/http', () => ({
  default: { patch: vi.fn() },
}));

vi.mock('@/models', () => ({
  WidgetOutgoing: vi.fn(),
}));

describe('updateWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if no widget is provided', async () => {
    await expect(WidgetService.updateWidget({})).rejects.toThrow(
      'Please provide a valid uuid to request update widget.',
    );
  });

  it('should call the API with the correct URL and data', async () => {
    const widget = { uuid: 'mock-uuid', name: 'Widget 1' };
    const mockResponse = { success: true };
    http.patch.mockResolvedValueOnce(mockResponse);

    const expectedWidgetOutgoing = new WidgetOutgoing(widget);

    const response = await WidgetService.updateWidget({ widget });

    expect(WidgetOutgoing).toHaveBeenCalledWith(widget);
    expect(http.patch).toHaveBeenCalledWith(
      '/widgets/mock-uuid/',
      expectedWidgetOutgoing,
    );
    expect(response).toEqual(mockResponse);
  });

  it('should handle API errors correctly', async () => {
    const widget = { uuid: 'mock-uuid', name: 'Widget 1' };
    const mockError = new Error('API Error');
    http.patch.mockRejectedValueOnce(mockError);

    await expect(WidgetService.updateWidget({ widget })).rejects.toThrow(
      'API Error',
    );
  });
});
