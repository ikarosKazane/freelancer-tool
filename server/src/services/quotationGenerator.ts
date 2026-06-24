/**
 * 模拟 AI 报价生成服务
 *
 * - 根据 profession 从 quotationTemplates 选取分项名称
 * - 若有 budgetHint，按比例分配各项金额
 * - 否则在合理范围随机生成 rate 和 hours
 * - rate 取整到 50 的倍数
 * - 生成 3-8 个报价项
 * - 从预设列表中选一个 suggestedPaymentTerms
 * - validDays 默认 15
 */

import type { QuotationItem, GenerateQuotationRequest, GenerateQuotationResponse } from '../types.js';
import { getQuotationItemTemplates } from '../data/quotationTemplates.js';

/** 预设的付款条款 */
const PAYMENT_TERMS_OPTIONS: string[] = [
  '分两期支付：首期 50% 预付款，验收后支付尾款 50%',
  '分三期支付：签约 30%，中期 40%，验收后 30%',
  '一次性支付：验收通过后 7 日内全额支付',
  '按月支付：每月 15 日前支付当月服务费',
  '里程碑支付：按项目阶段分期支付，每阶段完成后支付对应款项',
];

/**
 * 将数值取整到最近的 50 的倍数
 */
function roundTo50(value: number): number {
  return Math.round(value / 50) * 50;
}

/**
 * 在 [min, max] 范围内生成随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选取一个元素
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 模拟 AI 生成报价单
 */
export function generateQuotation(request: GenerateQuotationRequest): GenerateQuotationResponse {
  const { budgetHint, profession } = request;

  // 获取行业模板分项
  const templates = getQuotationItemTemplates(profession);

  // 决定生成分项数量（3-8 个，不超过模板数量）
  const maxItems = Math.min(templates.length, 8);
  const itemCount = randomInt(3, maxItems);

  // 从模板中随机选取分项
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, itemCount);

  // 生成比例系数（用于 budgetHint 模式）
  const proportions = selectedTemplates.map(() => Math.random() + 0.5);
  const proportionSum = proportions.reduce((sum, p) => sum + p, 0);

  const items: QuotationItem[] = selectedTemplates.map((tmpl, index) => {
    let rate: number;
    let hours: number;

    if (budgetHint && budgetHint > 0) {
      // 按 budgetHint 分配：该项的预算份额
      const itemBudget = (budgetHint * proportions[index]) / proportionSum;
      hours = randomInt(4, 30);
      rate = roundTo50(Math.max(50, itemBudget / hours));
    } else {
      // 随机生成
      rate = roundTo50(randomInt(200, 2000));
      hours = randomInt(2, 40);
    }

    const subtotal = rate * hours;

    return {
      name: tmpl.name,
      description: tmpl.description,
      hours,
      rate,
      subtotal,
    };
  });

  // 从预设列表中随机选择付款条款
  const suggestedPaymentTerms = randomPick(PAYMENT_TERMS_OPTIONS);

  return {
    items,
    suggestedPaymentTerms,
    validDays: 15,
  };
}
