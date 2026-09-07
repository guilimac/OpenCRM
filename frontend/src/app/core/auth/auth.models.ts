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

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  orgId?: string;
}
