/**
 * Platform-specific type declarations
 */

// Electron window extensions
declare global {
  interface Window {
    electron?: {
      store: {
        get(key: string): Promise<string | null>;
        set(key: string, value: string): Promise<void>;
        delete(key: string): Promise<void>;
      };
    };
  }
}

// React Native NetInfo module (optional dependency)
declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean | null;
    type: string;
  }

  export default class NetInfo {
    static addEventListener(callback: (state: NetInfoState) => void): () => void;
  }
}

export {};
