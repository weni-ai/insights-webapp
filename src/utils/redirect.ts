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

export { redirectToChatsConfig };
