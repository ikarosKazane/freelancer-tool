/**
 * 全局 TypeScript 类型定义
 *
 * 完整对应架构文档 3.1 节的所有类型。
 * 前端和后端的共享类型均从此处定义。
 */

// ===== 用户 =====

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  profession: 'designer' | 'developer' | 'writer' | 'consultant' | 'photographer';
  brandName: string;
  brandLogoUrl: string;
  brandAddress: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ===== 项目 =====

export type ProjectStatus = 'draft' | 'quoted' | 'signed' | 'paid' | 'completed';

export interface Project {
  id: number;
  userId: number;
  name: string;
  clientName: string;
  clientContact: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

// ===== 报价单 =====

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface QuotationItem {
  name: string;
  description: string;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface Quotation {
  id: number;
  projectId: number;
  userId: number;
  items: QuotationItem[];
  totalAmount: number;
  validUntil: string; // ISO date
  paymentTerms: string;
  notes: string;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

// ===== 合同 =====

export type ContractTemplateType = 'design' | 'development' | 'writing' | 'consulting';
export type ContractStatus = 'draft' | 'sent' | 'signed';

export interface ContractVariables {
  partyA: string;        // 甲方（客户）
  partyB: string;        // 乙方（自由职业者）
  projectName: string;
  amount: number;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  specialRequirements: string;
  [key: string]: string | number; // 允许扩展变量
}

export interface Contract {
  id: number;
  projectId: number;
  userId: number;
  templateType: ContractTemplateType;
  variables: ContractVariables;
  content: string;       // 生成后的完整合同文本
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

// ===== 收款记录 =====

export type PaymentStatus = 'pending' | 'paid';

export interface Payment {
  id: number;
  projectId: number;
  userId: number;
  amount: number;
  paymentDate: string; // ISO date
  dueDate: string;
  status: PaymentStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// ===== API 请求/响应类型 =====

/** 通用响应包装 */
export interface ApiResponse<T> {
  code: number;      // 0 表示成功，非 0 为错误码
  data: T;
  message: string;
}

/** 创建项目 */
export type CreateProjectRequest = Pick<Project, 'name' | 'clientName' | 'clientContact' | 'description' | 'budget'>;

/** 更新项目 */
export type UpdateProjectRequest = Partial<Pick<Project, 'name' | 'clientName' | 'clientContact' | 'description' | 'budget' | 'status'>>;

/** 创建报价单 */
export type CreateQuotationRequest = {
  items: QuotationItem[];
  validUntil: string;
  paymentTerms: string;
  notes: string;
};

/** AI 生成报价（模拟） */
export type GenerateQuotationRequest = {
  projectName: string;
  description: string;
  budgetHint?: number;
  profession: string;
};

export type GenerateQuotationResponse = {
  items: QuotationItem[];
  suggestedPaymentTerms: string;
  validDays: number;
};

/** 创建合同 */
export type CreateContractRequest = {
  templateType: ContractTemplateType;
  variables: ContractVariables;
};

/** AI 生成合同（模拟） */
export type GenerateContractRequest = {
  templateType: ContractTemplateType;
  variables: ContractVariables;
};

export type GenerateContractResponse = {
  content: string;
};

/** 创建收款记录 */
export type CreatePaymentRequest = Pick<Payment, 'amount' | 'paymentDate' | 'dueDate' | 'note'>;

/** 用户统计 */
export type UserStats = {
  totalProjects: number;
  monthlyProjects: number;
  totalIncome: number;
  monthlyIncome: number;
  pendingAmount: number;
  monthlyTrend: { month: string; income: number }[];
};

/** 合同模板列表项 */
export type TemplateInfo = {
  type: ContractTemplateType;
  name: string;
  summary: string;
};

/** 合同模板详情 */
export type TemplateDetail = {
  type: ContractTemplateType;
  name: string;
  summary: string;
  content: string;
};
