import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiError, NetworkError, apiErrorResponseSchema } from "./errors";
import { getAccessToken } from "../auth-utils";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Get token from Better Auth
// (Function removed and replaced by shared utility)

// Create axios instance
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    withCredentials: true, // Send cookies for CSRF protection
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Request cancelled
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      // Network error
      if (!error.response) {
        return Promise.reject(new NetworkError());
      }

      const { status, data } = error.response;

      // Handle auth errors globally
      if (status === 401 || status === 403) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth:unauthorized", { detail: { status } }),
          );
        }
      }

      // Parse error response
      const parsed = apiErrorResponseSchema.safeParse(data);
      const errorData = parsed.success ? parsed.data : undefined;

      return Promise.reject(ApiError.fromResponse(status, errorData));
    },
  );

  return client;
}

export const apiClient = createApiClient();

// Request options with abort signal support
interface RequestOptions {
  signal?: AbortSignal;
  params?: Record<string, unknown>;
}

// Type-safe request helpers
export async function get<T>(
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const config: AxiosRequestConfig = {};
  if (options?.signal) config.signal = options.signal;
  if (options?.params) config.params = options.params;
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const response = await apiClient.post<T>(url, data, {
    signal: options?.signal,
  });
  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const response = await apiClient.put<T>(url, data, {
    signal: options?.signal,
  });
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, {
    signal: options?.signal,
  });
  return response.data;
}

export async function del<T>(
  url: string,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const response = await apiClient.delete<T>(url, { signal: options?.signal });
  return response.data;
}
