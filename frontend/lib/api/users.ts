import { apiRequest } from '../api';

export interface User {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  bio?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  bio?: string;
  picture?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export interface CheckUsernameResponse {
  available: boolean;
}

export const usersApi = {
  getMe: (): Promise<any> => apiRequest('get', '/users/me'),

  updateProfile: (data: UpdateProfileRequest): Promise<any> =>
    apiRequest('patch', '/users/me', data),

  checkUsername: (name: string): Promise<any> =>
    apiRequest('get', '/users/check-username', null, { name }),
};
