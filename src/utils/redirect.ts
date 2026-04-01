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

const openNewTabLink = (internalUrl: string) => {
  const { project } = useConfig();
  if (!project.uuid) return;
  const [module, path] = internalUrl.split(':');
  const appBaseUrl = window.location.origin;
  const url = `${appBaseUrl}/projects/${project.uuid}/${module}/${path}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export { redirectToChatsConfig, openNewTabLink };
