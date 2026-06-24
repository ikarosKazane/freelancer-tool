import type { ContractTemplateType } from '@/types';

/**
 * 前端合同模板元信息数据
 *
 * 定义 4 种合同模板的名称、描述和图标，
 * 用于模板选择页面展示。完整合同文本由后端 contractGenerator 管理。
 */

export interface ContractTemplate {
  type: ContractTemplateType;
  name: string;
  description: string;
  icon: string;
}

export const contractTemplates: ContractTemplate[] = [
  {
    type: 'design',
    name: '设计服务合同',
    description: '适用于 UI 设计、品牌设计、插画设计、平面设计等视觉创意类项目，涵盖设计稿交付、修改次数、知识产权归属等条款。',
    icon: '🎨',
  },
  {
    type: 'development',
    name: '软件开发合同',
    description: '适用于网站开发、App 开发、小程序开发等技术类项目，涵盖需求范围、里程碑交付、源代码归属、技术维护等条款。',
    icon: '💻',
  },
  {
    type: 'writing',
    name: '内容撰稿合同',
    description: '适用于文案撰写、内容创作、翻译服务等文字类项目，涵盖稿件交付、修改次数、著作权归属、署名权等条款。',
    icon: '✍️',
  },
  {
    type: 'consulting',
    name: '咨询服务合同',
    description: '适用于商业咨询、技术咨询、运营顾问等服务类项目，涵盖咨询方式、服务时长、保密义务、成果交付等条款。',
    icon: '💼',
  },
];
