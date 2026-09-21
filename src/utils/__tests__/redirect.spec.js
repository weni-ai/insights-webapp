import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const projectRef = { uuid: 'project-uuid-123' };

vi.mock('@/store/modules/config', () => ({
  useConfig: () => ({
    project: projectRef,
  }),
}));

describe('redirect', () => {
  let redirectToChatsConfig;
  let openNewTabLink;
  let postMessageSpy;
  let openSpy;

  beforeEach(async () => {
    vi.resetModules();
    projectRef.uuid = 'project-uuid-123';

    postMessageSpy = vi.fn();
    openSpy = vi.fn();

    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: { postMessage: postMessageSpy },
    });
    window.open = openSpy;

    const redirect = await import('../redirect.ts');
    redirectToChatsConfig = redirect.redirectToChatsConfig;
    openNewTabLink = redirect.openNewTabLink;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('redirectToChatsConfig', () => {
    it('should post redirect message to parent window', () => {
      redirectToChatsConfig();

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          event: 'redirect',
          path: 'settingsChats:r/init',
        },
        '*',
      );
    });
  });

  describe('openNewTabLink', () => {
    it('should not open a tab when project uuid is missing', () => {
      projectRef.uuid = '';
      openNewTabLink('chats:rooms/list');

      expect(openSpy).not.toHaveBeenCalled();
    });

    it('should open the correct url without concatInsights', () => {
      openNewTabLink('chats:rooms/list?tab=open');

      expect(openSpy).toHaveBeenCalledWith(
        `${window.location.origin}/projects/project-uuid-123/chats/rooms/list/?tab=open`,
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('should append /insights when concatInsights is true', () => {
      openNewTabLink('chats:rooms/list?tab=open', { concatInsights: true });

      expect(openSpy).toHaveBeenCalledWith(
        `${window.location.origin}/projects/project-uuid-123/chats/rooms/list/insights?tab=open`,
        '_blank',
        'noopener,noreferrer',
      );
    });

    it('should handle urls without query string', () => {
      openNewTabLink('chats:rooms/list');

      expect(openSpy).toHaveBeenCalledWith(
        `${window.location.origin}/projects/project-uuid-123/chats/rooms/list/?`,
        '_blank',
        'noopener,noreferrer',
      );
    });
  });
});
