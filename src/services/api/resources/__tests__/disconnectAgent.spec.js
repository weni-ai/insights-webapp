import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();

vi.mock('@/services/api/chatsHttp', () => ({
  default: {
    post: (...args) => post(...args),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(() => ({
    project: { uuid: 'project-123' },
  })),
}));

describe('disconnectAgent API', () => {
  let disconnectAgentApi;

  beforeEach(async () => {
    vi.clearAllMocks();
    post.mockResolvedValue(undefined);
    disconnectAgentApi = (await import('../disconnectAgent')).default;
  });

  it('posts disconnect payload with project uuid and agent email', async () => {
    await disconnectAgentApi.disconnectAgent({ agent: 'agent@email.com' });

    expect(post).toHaveBeenCalledWith('/chats/agent/disconnect/', {
      project_uuid: 'project-123',
      agent: 'agent@email.com',
    });
  });

  it('propagates API errors', async () => {
    post.mockRejectedValue(new Error('Disconnect failed'));

    await expect(
      disconnectAgentApi.disconnectAgent({ agent: 'agent@email.com' }),
    ).rejects.toThrow('Disconnect failed');
  });
});
