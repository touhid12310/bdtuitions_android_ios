import apiClient from './client';
import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, PaginatedResponse, Transaction, PendingPayment } from '../types';

export interface PendingPaymentsResponse {
  assignments: PendingPayment[];
  total_due: string;
}

export interface ManualPaymentData {
  assignment_id: number;
  amount: number;
  payment_method: 'bkash' | 'nagad' | 'rocket';
  transaction_id: string;
}

export interface BkashPaymentResponse {
  bkash_url: string;
  payment_id: string;
}

export interface BkashExecuteResponse {
  transaction: Transaction;
  trx_id: string;
}

export const paymentsApi = {
  getPending: async (): Promise<ApiResponse<PendingPaymentsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS_PENDING);
    return response.data;
  },

  getHistory: async (page = 1, perPage = 20, assignmentId?: number): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS_HISTORY, {
      params: { page, per_page: perPage, assignment_id: assignmentId },
    });
    return response.data;
  },

  getAssignmentPayments: async (assignmentId: number): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS_HISTORY, {
      params: { assignment_id: assignmentId, per_page: 50 },
    });
    return response.data;
  },

  createManualPayment: async (data: ManualPaymentData): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS_MANUAL, data);
    return response.data;
  },

  createBkashPayment: async (assignmentId: number, amount: number): Promise<ApiResponse<BkashPaymentResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS_BKASH_CREATE, {
      assignment_id: assignmentId,
      amount,
    });
    return response.data;
  },

  executeBkashPayment: async (paymentId: string, status: string): Promise<ApiResponse<BkashExecuteResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS_BKASH_EXECUTE, {
      payment_id: paymentId,
      status,
    });
    return response.data;
  },

  createVerificationPayment: async (amount: number): Promise<ApiResponse<BkashPaymentResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.VERIFICATION_PAY, {
      amount,
    });
    return response.data;
  },

  executeVerificationPayment: async (paymentId: string, status: string): Promise<ApiResponse<{ trx_id: string; status: string }>> => {
    const response = await apiClient.post(API_ENDPOINTS.VERIFICATION_EXECUTE, {
      payment_id: paymentId,
      status,
    });
    return response.data;
  },
};

export default paymentsApi;
