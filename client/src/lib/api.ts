import type { ApiResponse } from '@/types';

/**
 * fetch 封装
 *
 * 提供 get/post/patch/del 四个方法，统一处理：
 * - baseUrl 拼接（开发环境为空，走 Vite proxy）
 * - JSON 序列化/反序列化
 * - ApiResponse<T> 解包（提取 data 字段）
 * - 统一错误处理
 */

const BASE_URL = '';

/**
 * 通用请求方法
 * @param method HTTP 方法
 * @param url API 路径（以 / 开头）
 * @param body 请求体（仅 POST/PATCH 使用）
 * @returns 解包后的 data 字段
 */
async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${url}`, options);

  if (!response.ok) {
    // 尝试解析后端返回的错误信息
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorBody: ApiResponse<null> = await response.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // 忽略 JSON 解析失败，使用默认错误信息
    }
    throw new Error(errorMessage);
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 0) {
    throw new Error(result.message || `业务错误码: ${result.code}`);
  }

  return result.data;
}

/** GET 请求 */
export function get<T>(url: string): Promise<T> {
  return request<T>('GET', url);
}

/** POST 请求 */
export function post<T>(url: string, data?: unknown): Promise<T> {
  return request<T>('POST', url, data);
}

/** PATCH 请求 */
export function patch<T>(url: string, data?: unknown): Promise<T> {
  return request<T>('PATCH', url, data);
}

/** DELETE 请求 */
export function del<T>(url: string): Promise<T> {
  return request<T>('DELETE', url);
}
