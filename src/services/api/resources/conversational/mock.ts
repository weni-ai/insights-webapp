import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

interface ShouldShowMockResponse {
  should_show_mock: boolean;
}

export default {
  async getShouldShowMock(): Promise<boolean> {
    const { project } = useConfig();
    const response = (await http.get(
      '/metrics/conversations/should-show-mock/',
      { params: { project_uuid: project.uuid } },
    )) as ShouldShowMockResponse;
    return !!response?.should_show_mock;
  },
};

export type { ShouldShowMockResponse };
