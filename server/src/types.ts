/**
 * 后端 TypeScript 类型定义
 *
 * - 与前端 types/index.ts 保持类型对齐
 * - 提供 snake_case ↔ camelCase 转换工具函数
 * - 提供 DbRow 相关的 snake_case 类型（对应数据库表字段）
 */

// ===== 通用类型（与前端对齐） =====

export type ProjectStatus = 'draft' | 'quoted' | 'signed' | 'paid' | 'completed';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type ContractTemplateType = 'design' | 'development' | 'writing' | 'consulting';
export type ContractStatus = 'draft' | 'sent' | 'signed';
export type PaymentStatus = 'pending' | 'paid';

export interface QuotationItem {
  name: string;
  description: string;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface ContractVariables {
  partyA: string;
  partyB: string;
  projectName: string;
  amount: number;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  specialRequirements: string;
  [key: string]: string | number;
}

// ===== API 响应包装 =====

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/** 构造成功响应 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return { code: 0, data, message: 'ok' };
}

/** 构造失败响应 */
export function errorResponse(code: number, message: string): ApiResponse<null> {
  return { code, data: null, message };
}

// ===== 数据库行类型（snake_case） =====

export interface DbUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  profession: string;
  brand_name: string;
  brand_logo_url: string;
  brand_address: string;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: number;
  user_id: number;
  name: string;
  client_name: string;
  client_contact: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface DbQuotation {
  id: number;
  project_id: number;
  user_id: number;
  items_json: string;
  total_amount: number;
  valid_until: string;
  payment_terms: string;
  notes: string;
  status: QuotationStatus;
  created_at: string;
  updated_at: string;
}

export interface DbContract {
  id: number;
  project_id: number;
  user_id: number;
  template_type: ContractTemplateType;
  variables_json: string;
  content: string;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface DbPayment {
  id: number;
  project_id: number;
  user_id: number;
  amount: number;
  payment_date: string;
  due_date: string;
  status: PaymentStatus;
  note: string;
  created_at: string;
  updated_at: string;
}

// ===== snake_case ↔ camelCase 转换工具 =====

/**
 * 将字符串从 snake_case 转为 camelCase
 * @example snakeToCamel('client_name') → 'clientName'
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * 将字符串从 camelCase 转为 snake_case
 * @example camelToSnake('clientName') → 'client_name'
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 递归转换对象的所有键名
 */
function transformKeys(obj: unknown, keyTransformer: (key: string) => string): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, keyTransformer));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const newKey = keyTransformer(key);
      result[newKey] = transformKeys(value, keyTransformer);
    }
    return result;
  }

  return obj;
}

/**
 * 将对象的键名从 snake_case 转换为 camelCase
 * 用于将数据库行转换为前端 API 响应格式
 *
 * @param obj - snake_case 键名的对象（如数据库行）
 * @returns camelCase 键名的对象
 *
 * @example
 * toCamelCase({ client_name: '张三', created_at: '2026-01-01' })
 * // → { clientName: '张三', createdAt: '2026-01-01' }
 */
export function toCamelCase<T>(obj: unknown): T {
  return transformKeys(obj, snakeToCamel) as T;
}

/**
 * 将对象的键名从 camelCase 转换为 snake_case
 * 用于将前端请求数据转换为数据库存储格式
 *
 * @param obj - camelCase 键名的对象
 * @returns snake_case 键名的对象
 *
 * @example
 * toSnakeCase({ clientName: '张三', budget: 5000 })
 * // → { client_name: '张三', budget: 5000 }
 */
export function toSnakeCase<T>(obj: unknown): T {
  return transformKeys(obj, camelToSnake) as T;
}

// ===== 请求体类型 =====

export interface CreateProjectRequest {
  name: string;
  clientName: string;
  clientContact: string;
  description: string;
  budget: number;
}

export interface UpdateProjectRequest {
  name?: string;
  clientName?: string;
  clientContact?: string;
  description?: string;
  budget?: number;
  status?: ProjectStatus;
}

export interface CreateQuotationRequest {
  items: QuotationItem[];
  validUntil: string;
  paymentTerms: string;
  notes: string;
}

export interface GenerateQuotationRequest {
  projectName: string;
  description: string;
  budgetHint?: number;
  profession: string;
}

export interface GenerateQuotationResponse {
  items: QuotationItem[];
  suggestedPaymentTerms: string;
  validDays: number;
}

export interface CreateContractRequest {
  templateType: ContractTemplateType;
  variables: ContractVariables;
}

export interface GenerateContractRequest {
  templateType: ContractTemplateType;
  variables: ContractVariables;
}

export interface GenerateContractResponse {
  content: string;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentDate: string;
  dueDate: string;
  note: string;
}

export interface UserStats {
  totalProjects: number;
  monthlyProjects: number;
  totalIncome: number;
  monthlyIncome: number;
  pendingAmount: number;
  monthlyTrend: { month: string; income: number }[];
}
