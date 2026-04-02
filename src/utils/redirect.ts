import { useConfig } from '@/store/modules/config';
const redirectToChatsConfig = () => {
  const chatsConfigLink = `settingsChats:r/init`;
  window.parent.postMessage(
    {
      event: 'redirect',
      path: chatsConfigLink,
    },
    '*',
  );
};

const openNewTabLink = (
  internalUrl: string,
  { concatInsights = false } = {},
) => {
  const { project } = useConfig();
  if (!project.uuid) return;

  const [module, fullPath] = internalUrl.split(':');
  const [path, query] = fullPath.split('?');

  const routerPath = `/projects/${project.uuid}/${module}/${path}${concatInsights ? '/insights' : '/'}`;

  const appBaseUrl = window.location.origin;

  const url = `${appBaseUrl}${routerPath}?${query ?? ''}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export { redirectToChatsConfig, openNewTabLink };
