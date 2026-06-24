/**
 * 报价模板数据（服务端存储）
 *
 * 按行业预设报价分项模板，每种行业包含多个标准分项，
 * 每个分项有 name（名称）和 description（描述）字段。
 */

export interface QuotationItemTemplate {
  name: string;
  description: string;
}

export type ProfessionType = 'designer' | 'developer' | 'writer' | 'consultant' | 'photographer';

const quotationTemplates: Record<ProfessionType, QuotationItemTemplate[]> = {
  designer: [
    { name: '需求分析与策划', description: '理解客户需求，制定设计策略和创意方向' },
    { name: '视觉概念设计', description: '提供 2-3 套视觉概念方案供选择' },
    { name: '方案细化与修改', description: '根据客户反馈细化设计方案，包含 3 次免费修改' },
    { name: '源文件交付', description: '交付 PSD/AI/Figma 等源文件及切图资源' },
    { name: '后期支持', description: '交付后 7 天内的微调支持' },
  ],

  developer: [
    { name: '需求分析', description: '需求梳理、功能拆解、技术方案评估' },
    { name: '系统设计', description: '架构设计、数据库设计、API 接口设计' },
    { name: '前端开发', description: '页面开发、组件封装、响应式适配' },
    { name: '后端开发', description: '服务端逻辑、数据库操作、API 开发' },
    { name: '测试与部署', description: '功能测试、性能测试、部署上线' },
    { name: '运维支持', description: '上线后 30 天内的 Bug 修复和技术支持' },
  ],

  writer: [
    { name: '选题策划', description: '确定选题方向、内容框架和目标受众分析' },
    { name: '资料调研', description: '行业资料收集、竞品分析、数据整理' },
    { name: '初稿撰写', description: '按照 brief 要求完成初稿创作' },
    { name: '修改润色', description: '根据反馈进行修改润色，包含 2 次免费修改' },
    { name: '终审定稿', description: '最终校对、排版、交付终稿文件' },
  ],

  consultant: [
    { name: '前期诊断', description: '业务现状调研、问题诊断、机会识别' },
    { name: '方案设计', description: '制定解决方案、实施路线图和 KPI 体系' },
    { name: '方案实施', description: '协助方案落地执行、过程监控和动态调整' },
    { name: '效果评估', description: '阶段性效果评估、数据分析和优化建议' },
    { name: '跟踪优化', description: '持续跟踪服务效果并提供优化迭代建议' },
  ],

  photographer: [
    { name: '前期沟通', description: '拍摄需求确认、场景规划、拍摄方案制定' },
    { name: '拍摄执行', description: '专业摄影师到场拍摄，包含灯光和道具准备' },
    { name: '后期修图', description: '精修照片，调色、构图优化，包含 2 轮修改' },
    { name: '成片交付', description: '交付高清原片和精修照片，支持多种格式' },
  ],
};

/** 获取指定行业的报价分项模板 */
export function getQuotationItemTemplates(
  profession: string,
): QuotationItemTemplate[] {
  const key = profession as ProfessionType;
  return quotationTemplates[key] ?? quotationTemplates.developer;
}

/** 获取所有支持的行业类型 */
export function getSupportedProfessions(): ProfessionType[] {
  return Object.keys(quotationTemplates) as ProfessionType[];
}

export default quotationTemplates;
