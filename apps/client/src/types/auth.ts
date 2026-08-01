export type UserRole = 'PATENT_ANALYST' | 'ADMIN' | 'INNOVATOR';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
}
