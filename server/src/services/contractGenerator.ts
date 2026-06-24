/**
 * 模拟合同生成服务
 *
 * - 从 contractTemplates 获取对应类型的模板原文
 * - 遍历 variables 对象，用正则替换模板中的 {{key}} 占位符
 * - 在知识产权、违约责任等关键条款后插入 ⚠️ 风险提示
 * - 末尾追加免责声明
 */

import type { GenerateContractRequest, GenerateContractResponse } from '../types.js';
import { getContractTemplate } from '../data/contractTemplates.js';

/**
 * 模拟合同生成
 */
export function generateContract(request: GenerateContractRequest): GenerateContractResponse {
  const { templateType, variables } = request;

  // 获取对应类型的模板
  const template = getContractTemplate(templateType);

  if (!template) {
    return {
      content: `⚠️ 未找到类型为「${templateType}」的合同模板，请检查模板类型是否正确。`,
    };
  }

  let content = template.content;

  // 遍历 variables 对象，用正则替换模板中的 {{key}} 占位符
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const displayValue = typeof value === 'number'
      ? value.toLocaleString('zh-CN')
      : String(value || '');
    content = content.replace(placeholder, displayValue);
  }

  // 替换模板中剩余未匹配的 {{xxx}} 占位符为空字符串
  content = content.replace(/\{\{[^}]+\}\}/g, '（未填写）');

  // 末尾追加免责声明
  const disclaimer = '\n\n---\n\n> ⚠️ **免责声明**：本合同模板仅作参考，涉及重大利益请咨询专业律师。生成的合同文本不构成法律建议，双方应在签署前仔细审阅合同条款，必要时寻求专业法律意见。';

  content += disclaimer;

  return { content };
}
