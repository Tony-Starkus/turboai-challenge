import axios from 'axios';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const details = error.response?.data ?? null;
    const message = flattenDetails(details) || error.message || `Request failed with status ${status}.`;

    return new ApiError(message, status, details);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500, null);
  }

  return new ApiError('Something went wrong. Please try again.', 500, null);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const detailsMessage = flattenDetails(error.details);

    return detailsMessage || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function flattenDetails(details: unknown): string {
  if (!details) {
    return '';
  }

  if (typeof details === 'string') {
    return details;
  }

  if (Array.isArray(details)) {
    return details
      .map((item) => flattenDetails(item))
      .filter(Boolean)
      .join(' ');
  }

  if (typeof details === 'object') {
    return Object.values(details as Record<string, unknown>)
      .map((item) => flattenDetails(item))
      .filter(Boolean)
      .join(' ');
  }

  return '';
}
