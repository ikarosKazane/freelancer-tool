import { create } from 'zustand';
import type { Payment, CreatePaymentRequest } from '@/types';
import { get, post, patch, del } from '@/lib/api';

/**
 * 收款记录状态 Store
 *
 * 管理收款记录列表、已收/待收金额汇总、加载状态。
 * 提供收款记录 CRUD、状态切换和金额汇总计算功能。
 */

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  totalPaid: number;
  totalPending: number;
  fetchPayments: (projectId: number) => Promise<void>;
  createPayment: (projectId: number, data: CreatePaymentRequest) => Promise<void>;
  togglePaymentStatus: (id: number, currentStatus: string) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
}

/** 根据付款列表计算已付金额合计 */
function calcTotalPaid(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
}

/** 根据付款列表计算待付金额合计 */
function calcTotalPending(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,
  error: null,
  totalPaid: 0,
  totalPending: 0,

  fetchPayments: async (projectId: number) => {
    set({ loading: true, error: null });
    try {
      const payments = await get<Payment[]>(
        `/api/projects/${projectId}/payments`,
      );
      set({
        payments,
        totalPaid: calcTotalPaid(payments),
        totalPending: calcTotalPending(payments),
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createPayment: async (projectId: number, data: CreatePaymentRequest) => {
    set({ loading: true, error: null });
    try {
      const payment = await post<Payment>(
        `/api/projects/${projectId}/payment`,
        data,
      );
      set((state) => {
        const payments = [...state.payments, payment];
        return {
          payments,
          totalPaid: calcTotalPaid(payments),
          totalPending: calcTotalPending(payments),
          loading: false,
        };
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  togglePaymentStatus: async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    set({ loading: true, error: null });
    try {
      const updated = await patch<Payment>(`/api/payments/${id}`, {
        status: newStatus,
      });
      set((state) => {
        const payments = state.payments.map((p) =>
          p.id === id ? updated : p,
        );
        return {
          payments,
          totalPaid: calcTotalPaid(payments),
          totalPending: calcTotalPending(payments),
          loading: false,
        };
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  deletePayment: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await del(`/api/payments/${id}`);
      set((state) => {
        const payments = state.payments.filter((p) => p.id !== id);
        return {
          payments,
          totalPaid: calcTotalPaid(payments),
          totalPending: calcTotalPending(payments),
          loading: false,
        };
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },
}));
