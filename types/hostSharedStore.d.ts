declare module 'host/sharedStore' {
  export function useSharedStore(): {
    auth: {
      token: string;
    };
    current: {
      project: {
        uuid: string;
      };
    };
  };
}
