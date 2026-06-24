import { create } from 'zustand';
import type {
  Contract,
  CreateContractRequest,
  GenerateContractRequest,
  GenerateContractResponse,
} from '@/types';
import { get, post } from '@/lib/api';

/**
 * 合同状态 Store
 *
 * 管理合同列表、AI 生成的合同内容、加载状态。
 * 提供合同查询、AI 生成、创建保存功能。
 */

interface ContractState {
  contracts: Contract[];
  generatedContent: string;
  loading: boolean;
  error: string | null;
  fetchContracts: (projectId: number) => Promise<void>;
  generateContract: (request: GenerateContractRequest) => Promise<void>;
  createContract: (projectId: number, data: CreateContractRequest) => Promise<void>;
  clearGeneratedContent: () => void;
}

export const useContractStore = create<ContractState>((set) => ({
  contracts: [],
  generatedContent: '',
  loading: false,
  error: null,

  fetchContracts: async (projectId: number) => {
    set({ loading: true, error: null });
    try {
      const contracts = await get<Contract[]>(
        `/api/projects/${projectId}/contracts`,
      );
      set({ contracts, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  generateContract: async (request: GenerateContractRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await post<GenerateContractResponse>(
        '/api/ai/generate-contract',
        request,
      );
      set({ generatedContent: response.content, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  createContract: async (projectId: number, data: CreateContractRequest) => {
    set({ loading: true, error: null });
    try {
      const contract = await post<Contract>(
        `/api/projects/${projectId}/contract`,
        data,
      );
      set((state) => ({
        contracts: [contract, ...state.contracts],
        generatedContent: '',
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  clearGeneratedContent: () => {
    set({ generatedContent: '' });
  },
}));
