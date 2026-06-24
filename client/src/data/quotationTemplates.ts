/**
 * 前端报价模板数据
 *
 * 按行业类型预设报价分项名称和描述，
 * 用于 QuotationForm 中的预设参考和 AI 模拟时的行业匹配。
 */

export interface QuotationTemplate {
  profession: string;
  items: { name: string; description: string }[];
}

export const quotationTemplates: QuotationTemplate[] = [
  {
    profession: 'design',
    items: [
      { name: '需求分析与调研', description: '竞品分析、用户调研、需求梳理与确认' },
      { name: '视觉设计', description: '主视觉风格设计、UI 界面设计、设计稿输出' },
      { name: '交互原型', description: '页面交互流程设计、可点击原型制作' },
      { name: '切图与标注', description: '设计切图导出、开发标注文档制作' },
      { name: '设计修改', description: '根据反馈进行设计调整与优化（含 2 轮修改）' },
    ],
  },
  {
    profession: 'developer',
    items: [
      { name: '需求分析与技术方案', description: '需求评审、技术选型、架构设计' },
      { name: '前端开发', description: '页面开发、组件封装、接口对接' },
      { name: '后端开发', description: 'API 开发、数据库设计、业务逻辑实现' },
      { name: '测试与部署', description: '单元测试、集成测试、服务器部署上线' },
      { name: '维护与支持', description: 'Bug 修复、性能优化、30 天免费维护' },
    ],
  },
  {
    profession: 'writer',
    items: [
      { name: '选题与大纲', description: '主题调研、内容大纲规划与确认' },
      { name: '内容撰写', description: '正文撰写、资料查阅、原创内容创作' },
      { name: '编辑润色', description: '文字校对、排版优化、SEO 优化建议' },
      { name: '修改与定稿', description: '根据反馈修改（含 2 轮修改）、终稿交付' },
    ],
  },
  {
    profession: 'consultant',
    items: [
      { name: '现状诊断', description: '业务现状调研、问题分析与诊断报告' },
      { name: '方案设计', description: '解决方案设计、实施路径规划' },
      { name: '咨询会议', description: '一对一咨询会议、方案讲解与讨论' },
      { name: '报告输出', description: '详细咨询报告、改进建议与行动计划' },
      { name: '跟踪服务', description: '方案落地跟踪、阶段性复盘（30 天）' },
    ],
  },
];
