import { nanoid } from 'nanoid';

/**
 * 格式化工具函数集合
 *
 * 提供货币、日期、报价单编号等统一格式化方法。
 */

/**
 * 格式化货币金额
 * 使用 Intl.NumberFormat 输出人民币格式（¥1,234.56）
 *
 * @param amount - 金额数值
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * 格式化日期（中文长格式）
 * 输出格式：yyyy年MM月dd日
 *
 * @param date - ISO 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * 格式化日期（短格式，ISO 风格）
 * 输出格式：yyyy-MM-dd
 *
 * @param date - ISO 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成报价单编号
 * 格式：QT-YYYYMMDD-XXX（XXX 为 nanoid 随机 3 位字符）
 *
 * @returns 报价单编号字符串
 */
export function generateQuotationNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = nanoid(3);
  return `QT-${year}${month}${day}-${randomSuffix}`;
}
