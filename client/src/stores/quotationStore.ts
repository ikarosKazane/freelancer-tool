import { create } from 'zustand';
import type {
  Quotation,
  QuotationItem,
  CreateQuotationRequest,
  GenerateQuotationRequest,
  GenerateQuotationResponse,
} from '@/types';
import { get, post } from '@/lib/api';

/**
 * 报价单状态 Store
 *
 * 管理报价单列表、AI 生成的临时数据、加载状态。
 * 提供报价单查询、AI 生成、创建保存功能。
 */

interface QuotationState {
  quotations: Quotation[];
  generatedItems: QuotationItem[];
  suggestedPaymentTerms: string;
  loading: boolean;
  error: string | null;
  fetchQuotations: (projectId: number) => Promise<void>;
  generateQuotation: (request: GenerateQuotationRequest) => Promise<void>;
  createQuotation: (projectId: number, data: CreateQuotationRequest) => Promise<void>;
  setGeneratedItems: (items: QuotationItem[]) => void;
  clearGenerated: () => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  quotations: [],
  generatedItems: [],
  suggestedPaymentTerms: '',
  loading: false,
  error: null,

  fetchQuotations: async (projectId: number) => {
    set({ loading: true, error: null });
    try {
      const quotations = await get<Quotation[]>(
        `/api/projects/${projectId}/quotations`,
      );
      set({ quotations, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  generateQuotation: async (request: GenerateQuotationRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await post<GenerateQuotationResponse>(
        '/api/ai/generate-quotation',
        request,
      );
      set({
        generatedItems: response.items,
        suggestedPaymentTerms: response.suggestedPaymentTerms,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  createQuotation: async (projectId: number, data: CreateQuotationRequest) => {
    set({ loading: true, error: null });
    try {
      const quotation = await post<Quotation>(
        `/api/projects/${projectId}/quotation`,
        data,
      );
      set((state) => ({
        quotations: [quotation, ...state.quotations],
        generatedItems: [],
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  setGeneratedItems: (items: QuotationItem[]) => {
    set({ generatedItems: items });
  },

  clearGenerated: () => {
    set({ generatedItems: [], suggestedPaymentTerms: '' });
  },
}));
