import type {
  CreateUserPayload,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterResponse,
  User,
} from '@/lib/api-types';
import api, { withAccessToken } from '@/services/api';

export async function createUserRequest(payload: CreateUserPayload) {
  const response = await api.post<RegisterResponse>('/auth/register/', payload);
  return response.data;
}

export async function loginUserRequest(payload: LoginPayload) {
  const response = await api.post<LoginResponse>('/auth/token/', payload);
  return response.data;
}

export async function refreshTokenRequest(refreshToken: string) {
  const response = await api.post<RefreshResponse>('/auth/token/refresh/', {
    refresh: refreshToken,
  });

  return response.data;
}

export async function getCurrentUserRequest(accessToken?: string) {
  const response = await api.get<User>('/auth/me/', withAccessToken(accessToken));
  return response.data;
}
