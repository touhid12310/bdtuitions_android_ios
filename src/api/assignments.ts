import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, PaginatedResponse, Assignment, Report } from '../types';

export interface AssignmentsFilter {
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface GuardianInfo {
  guardian_number: string;
  tuition_address: string;
  city: string;
  area: string;
}

export const assignmentsApi = {
  getList: async (filters?: AssignmentsFilter): Promise<PaginatedResponse<Assignment>> => {
    const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS, {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Assignment>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ASSIGNMENTS}/${id}`);
    return response.data;
  },

  getGuardian: async (assignmentId: number): Promise<ApiResponse<GuardianInfo>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ASSIGNMENTS}/${assignmentId}/guardian`);
    return response.data;
  },

  getReports: async (assignmentId: number): Promise<ApiResponse<Report[]>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ASSIGNMENTS}/${assignmentId}/reports`);
    return response.data;
  },

  submitReport: async (assignmentId: number, report: string): Promise<ApiResponse<Report>> => {
    const response = await apiClient.post(`${API_ENDPOINTS.ASSIGNMENTS}/${assignmentId}/reports`, {
      report,
    });
    return response.data;
  },
};

export default assignmentsApi;
