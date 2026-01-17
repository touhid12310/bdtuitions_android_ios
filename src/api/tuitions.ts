import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, PaginatedResponse, Tuition } from '../types';

export interface TuitionsFilter {
  tuition_code?: string;
  city?: string;
  area?: string | string[];
  class?: string;
  medium?: string;
  gender?: string;
  min_salary?: number;
  max_salary?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface TuitionDetailResponse {
  tuition: Tuition;
  has_applied: boolean;
  can_apply: boolean;
  status: string;
}

export const tuitionsApi = {
  getList: async (filters?: TuitionsFilter): Promise<PaginatedResponse<Tuition>> => {
    const response = await apiClient.get(API_ENDPOINTS.TUITIONS, {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<TuitionDetailResponse>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TUITIONS}/${id}`);
    return response.data;
  },

  apply: async (tuitionId: number, coverLetter?: string): Promise<ApiResponse<{ application_id: number }>> => {
    const response = await apiClient.post(`${API_ENDPOINTS.TUITIONS}/${tuitionId}/apply`, {
      cover_letter: coverLetter,
    });
    return response.data;
  },

  getCities: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TUITIONS}/cities`);
    return response.data;
  },

  getAreas: async (city: string): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TUITIONS}/areas`, {
      params: { city },
    });
    return response.data;
  },
};

export default tuitionsApi;
