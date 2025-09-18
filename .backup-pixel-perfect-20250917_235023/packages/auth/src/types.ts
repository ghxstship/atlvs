export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

export interface AuthError {
  message: string;
}

export interface SessionData {
  session: any;
  user?: User;
}

export interface AuthResponse {
  data: SessionData | User | null;
  error: AuthError | null;
}
