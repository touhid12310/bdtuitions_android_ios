import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../constants/api';
import { useAuthStore } from '../store/authStore';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<any>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstKey = Object.keys(errors)[0];
    if (firstKey && errors[firstKey]?.[0]) {
      return errors[firstKey][0];
    }
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper for multipart form data
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item.uri) {
          // File object
          formData.append(`${key}[${index}]`, item);
        } else {
          formData.append(`${key}[${index}]`, item);
        }
      });
    } else if (typeof value === 'object' && value.uri) {
      // File object
      formData.append(key, {
        uri: value.uri,
        type: value.type || 'image/jpeg',
        name: value.fileName || `${key}.jpg`,
      } as any);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value.toString());
    }
  });

  return formData;
};

export default apiClient;
