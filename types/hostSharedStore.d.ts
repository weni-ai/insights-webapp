declare module 'connect/sharedStore' {
  export function useSharedStore(): {
    auth: {
      token: string;
    };
    current: {
      project: {
        uuid: string;
        type?: number;
      };
    };
    user?: {
      language?: string;
    };
    isActiveFederatedModules?: {
      insights?: boolean;
    };
  };
}
