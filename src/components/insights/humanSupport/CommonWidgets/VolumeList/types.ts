export type WidgetContext = 'monitoring' | 'analysis' | 'sales';

export interface VolumeBarListTabItem {
  name: string;
  key: string;
}

export interface VolumeBarListItemDescription {
  label: string;
  value: number;
  percentage?: number;
}

export interface VolumeBarListDescriptionSlotProps {
  item: {
    description: string;
    percentage?: number;
  };
  currentTab: string;
}

export type VolumeBarListFetchMethod = (_params: {
  cursor: string | null;
  limit: number;
  chip_name: string;
  offset?: number;
}) => Promise<{
  results: unknown[];
  next: string | null;
  count: number;
}>;
