const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
const AUTH_BASE = `${API_BASE.replace(/\/$/, '')}/auth`;

export type AppRole = 'admin' | 'artisan' | 'buyer';

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  phone: string | null;
  location: string | null;
  bio: string | null;
  craft_specialty: string | null;
  years_experience: number | null;
  portfolio_url: string | null;
  is_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  refresh_expires_at: string;
  user: AuthProfile;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  role: Extract<AppRole, 'buyer' | 'artisan'>;
  location?: string;
  craft_specialty?: string;
}

export interface UpdateProfileInput {
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  craft_specialty?: string | null;
  years_experience?: number | null;
  portfolio_url?: string | null;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = body?.detail || body?.message || text || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AuthResponse>(response);
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return parseResponse<AuthResponse>(response);
}

export async function refreshAuthToken(refreshToken: string): Promise<AuthResponse> {
  const response = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  return parseResponse<AuthResponse>(response);
}

export async function getCurrentUser(accessToken: string): Promise<AuthProfile> {
  const response = await fetch(`${AUTH_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseResponse<AuthProfile>(response);
}

export async function updateMyProfile(accessToken: string, input: UpdateProfileInput): Promise<AuthProfile> {
  const response = await fetch(`${AUTH_BASE}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  return parseResponse<AuthProfile>(response);
}
