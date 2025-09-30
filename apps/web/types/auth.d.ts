declare module '@ghxstship/auth/client' {
  export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  }

  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }

  export function useAuth(): AuthState;
  export function signIn(email: string, password: string): Promise<void>;
  export function signOut(): Promise<void>;
  export function signUp(email: string, password: string, name?: string): Promise<void>;
}
