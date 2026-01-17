import apiClient, { createFormData, handleApiError } from './client';
import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, Teacher, LoginCredentials, RegisterData } from '../types';

export interface AuthResponse {
  teacher: Teacher;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
      ...credentials,
      device_name: 'mobile_app',
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<ApiResponse<{ phone_number: string }>> => {
    const formData = createFormData(data);
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyOtp: async (phoneNumber: string, verifyCode: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, {
      phone_number: phoneNumber,
      verify_code: verifyCode,
      device_name: 'mobile_app',
    });
    return response.data;
  },

  resendOtp: async (phoneNumber: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(API_ENDPOINTS.RESEND_OTP, {
      phone_number: phoneNumber,
    });
    return response.data;
  },

  forgotPassword: async (phoneNumber: string): Promise<ApiResponse<{ phone_number: string }>> => {
    const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, {
      phone_number: phoneNumber,
    });
    return response.data;
  },

  resetPassword: async (phoneNumber: string, verifyCode: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, {
      phone_number: phoneNumber,
      verify_code: verifyCode,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<Teacher>> => {
    const response = await apiClient.get(API_ENDPOINTS.ME);
    return response.data;
  },
};

export default authApi;
