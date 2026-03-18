export type WidgetContext = 'monitoring' | 'analysis';

export interface VolumeBarListTabItem {
  name: string;
  key: string;
}

export interface VolumeBarListMockConfig {
  labelPrefix: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
}

export type VolumeBarListFetchMethod = (_params: {
  cursor: string | null;
  limit: number;
  chip_name: string;
}) => Promise<{
  results: unknown[];
  next: string | null;
  count: number;
}>;
