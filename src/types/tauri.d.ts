declare global {
  interface Window {
    __TAURI__?: {
      shell: {
        open: (url: string) => Promise<void>;
      };
      dialog: {
        save: (options: {
          title?: string;
          filters?: Array<{
            name: string;
            extensions: string[];
          }>;
          defaultPath?: string;
        }) => Promise<string | null>;
      };
      fs: {
        writeTextFile: (path: string, content: string) => Promise<void>;
      };
    };
  }
}

export {}; 