export interface LoginResponse {
  user_id: string;
  email: string;
  picture?: string | null;
}

export interface AuthUser {
  user_id: string;
  email: string;
  picture?: string | null;
}