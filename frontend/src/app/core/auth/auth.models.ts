export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES_REP' | 'SUPPORT_AGENT';
  orgId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
  orgId?: string;
}
