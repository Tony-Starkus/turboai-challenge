import axios, { AxiosHeaders } from 'axios';

import { normalizeApiError } from '@/lib/api-error';
import { readStoredSession } from '@/lib/session-storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTHLESS_PATHS = new Set(['/auth/register/', '/auth/token/', '/auth/token/refresh/']);

api.interceptors.request.use((config) => {
  const requestUrl = typeof config.url === 'string' ? config.url : '';

  if (AUTHLESS_PATHS.has(requestUrl) || typeof window === 'undefined') {
    return config;
  }

  const session = readStoredSession();

  if (!session?.accessToken) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  config.headers = headers;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
);

export function withAccessToken(accessToken?: string) {
  if (!accessToken) {
    return undefined;
  }

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export default api;
