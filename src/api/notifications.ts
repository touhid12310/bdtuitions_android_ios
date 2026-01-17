import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, PaginatedResponse, Notification } from '../types';

export interface NotificationsFilter {
  status?: 'read' | 'unread';
  page?: number;
  per_page?: number;
}

export const notificationsApi = {
  getList: async (filters?: NotificationsFilter): Promise<PaginatedResponse<Notification>> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS, {
      params: filters,
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
    return response.data;
  },
};

export default notificationsApi;
