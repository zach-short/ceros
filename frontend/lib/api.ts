import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';

type ApiSuccessResponse<T = any> = {
  success: true;
  data: T;
  status: number;
};

type ApiErrorResponse = {
  success: false;
  error: {
    status: number;
    message: string;
    data?: any;
  };
  isOffline?: boolean;
};

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export type CheckEmailResponse = {
  exists: boolean;
  hasPassword: boolean;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const API = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(
  async (config) => {
    const isPublicEndpoint = config.url?.includes('/auth/');

    if (!isPublicEndpoint) {
      try {
        const session = await getSession();
        const token = session?.apiToken || session?.user?.apiToken;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('No authentication token available for API request');
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await signOut({ redirect: false });
        toast.info('Your session has expired. Please sign in again.');
      } catch (signOutError) {
        console.error('Error signing out user:', signOutError);
      }
    }

    return Promise.reject(error);
  },
);

const handleApiResponse = async (promise: Promise<any>) => {
  return promise
    .then((response) => ({
      success: true,
      data: response.data,
      status: response.status,
    }))
    .catch((error) => {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return {
          success: false,
          error: {
            status: 0,
            message: 'Network error. Please check your connection.',
          },
          isOffline: true,
        };
      }

      return {
        success: false,
        error: {
          status: error.response?.status || 500,
          message: error.response?.data?.error || error.message,
          data: error.response?.data,
        },
      };
    });
};

export const apiRequest = (
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  body?: any,
  params?: any,
  config?: any,
) => {
  let promise: Promise<any>;

  const requestConfig = {
    params,
    ...config,
  };

  switch (method) {
    case 'get':
      promise = API.get(url, requestConfig);
      break;
    case 'post':
      promise = API.post(url, body, requestConfig);
      break;
    case 'put':
      promise = API.put(url, body, requestConfig);
      break;
    case 'patch':
      promise = API.patch(url, body, requestConfig);
      break;
    case 'delete':
      promise = API.delete(url, { data: body, ...requestConfig });
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }

  return handleApiResponse(promise);
};

export default API;

export const authApi = {
  login: (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> =>
    apiRequest('post', '/auth/login', credentials) as Promise<
      ApiResponse<AuthResponse>
    >,

  register: (data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<ApiResponse<AuthResponse>> =>
    apiRequest('post', '/auth/register', data) as Promise<
      ApiResponse<AuthResponse>
    >,

  checkEmail: (email: string): Promise<ApiResponse<CheckEmailResponse>> =>
    apiRequest('post', '/auth/check-email', { email }) as Promise<
      ApiResponse<CheckEmailResponse>
    >,

  socialAuth: (data: {
    provider: string;
    providerId: string;
    email: string;
    name?: string;
    image?: string;
  }): Promise<ApiResponse<AuthResponse>> =>
    apiRequest('post', '/auth/social', data) as Promise<
      ApiResponse<AuthResponse>
    >,
};
