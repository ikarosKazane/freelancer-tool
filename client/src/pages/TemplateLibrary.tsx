import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractTemplates } from '@/data/contractTemplates';
import type { ContractTemplateType } from '@/types';
import { useProjectStore } from '@/stores/projectStore';

/**
 * 合同模板库页面
 *
 * 展示 4 种合同模板卡片（设计/开发/撰稿/咨询），
 * 点击卡片弹出 Modal 预览完整模板内容。
 */

/** 合同全文模板内容（前端内嵌，供预览使用） */
const templateContentMap: Record<ContractTemplateType, string> = {
  design: `# 设计服务合同

## 一、合同双方

甲方（委托方）：{{partyA}}
乙方（服务方）：{{partyB}}

## 二、项目概述

项目名称：{{projectName}}
项目金额：¥{{amount}}
项目周期：{{startDate}} 至 {{endDate}}

## 三、服务内容

乙方为甲方提供以下设计服务：
1. UI 界面设计（含原型图、视觉稿）
2. 品牌视觉识别系统设计
3. 插画/图标/平面设计

## 四、交付标准

1. 设计稿以 Figma/Sketch 源文件格式交付
2. 包含所有切图资源和标注文件
3. 每个设计阶段提供不超过 3 次修改

## 五、付款条款

{{paymentTerms}}

## 六、知识产权

1. 设计终稿交付并付清全款后，知识产权归甲方所有
2. 乙方保留将作品用于个人作品集展示的权利
3. 未付清全款前，设计稿知识产权归乙方所有

## 七、违约责任

1. 甲方逾期付款，每逾期一日按未付金额的 0.1% 支付违约金
2. 乙方逾期交付，每逾期一日按合同总额的 0.1% 支付违约金
3. 因不可抗力导致合同无法履行的，双方均不承担违约责任

## 八、其他约定

{{specialRequirements}}

---
签署日期：____年____月____日`,

  development: `# 软件开发合同

## 一、合同双方

甲方（委托方）：{{partyA}}
乙方（开发方）：{{partyB}}

## 二、项目概述

项目名称：{{projectName}}
项目金额：¥{{amount}}
开发周期：{{startDate}} 至 {{endDate}}

## 三、开发内容

乙方为甲方开发以下软件产品：
1. Web 应用/移动应用/小程序
2. 后端服务及 API 接口
3. 管理后台系统

## 四、里程碑交付

| 阶段 | 交付物 | 时间节点 |
|------|--------|---------|
| 需求确认 | 需求文档 | 签约后 5 个工作日 |
| 设计完成 | UI 设计稿 | 需求确认后 10 个工作日 |
| 开发完成 | 可测试版本 | 设计确认后 20 个工作日 |
| 验收交付 | 正式版本 + 源代码 | 测试通过后 5 个工作日 |

## 五、付款条款

{{paymentTerms}}

## 六、技术维护

1. 交付后提供 30 天免费 Bug 修复期
2. 免费维护期后，按 ¥500/天 收取维护费用
3. 新增功能需求另行报价

## 七、源代码归属

1. 项目全款付清后，源代码及所有技术文档归甲方所有
2. 乙方保留通用工具库和框架组件的复用权

## 八、违约责任

1. 甲方逾期付款，每逾期一日按未付金额的 0.1% 支付违约金
2. 乙方逾期交付，每逾期一日按合同总额的 0.1% 支付违约金

## 九、其他约定

{{specialRequirements}}

---
签署日期：____年____月____日`,

  writing: `# 内容撰稿合同

## 一、合同双方

甲方（委托方）：{{partyA}}
乙方（撰稿方）：{{partyB}}

## 二、项目概述

项目名称：{{projectName}}
项目金额：¥{{amount}}
合作周期：{{startDate}} 至 {{endDate}}

## 三、服务内容

乙方为甲方提供以下撰稿服务：
1. 原创内容撰写（文章/文案/报告）
2. 内容编辑与校对
3. SEO 优化建议

## 四、交付标准

1. 稿件以 Word/Markdown 格式交付
2. 每篇稿件字数按约定要求
3. 每篇稿件提供不超过 2 次免费修改

## 五、付款条款

{{paymentTerms}}

## 六、著作权归属

1. 稿件交付并付清全款后，著作财产权归甲方所有
2. 乙方保留署名权和将作品收入个人作品集的权利
3. 未经乙方书面同意，甲方不得将稿件转授权第三方使用

## 七、原创性保证

1. 乙方保证交付内容为原创，不存在抄袭、洗稿等侵权行为
2. 如因版权问题产生纠纷，由乙方承担全部法律责任

## 八、违约责任

1. 甲方逾期付款，每逾期一日按未付金额的 0.1% 支付违约金
2. 乙方逾期交付，每逾期一日按合同总额的 0.1% 支付违约金

## 九、其他约定

{{specialRequirements}}

---
签署日期：____年____月____日`,

  consulting: `# 咨询服务合同

## 一、合同双方

甲方（委托方）：{{partyA}}
乙方（咨询方）：{{partyB}}

## 二、项目概述

项目名称：{{projectName}}
项目金额：¥{{amount}}
服务周期：{{startDate}} 至 {{endDate}}

## 三、服务内容

乙方为甲方提供以下咨询服务：
1. 商业策略/技术咨询/运营顾问
2. 定期线上/线下咨询会议
3. 书面咨询报告与建议方案

## 四、服务方式

1. 每月提供不超过 4 次线上咨询（每次 1 小时）
2. 每月提供 1 份书面分析报告
3. 紧急咨询可通过即时通讯工具沟通

## 五、付款条款

{{paymentTerms}}

## 六、保密义务

1. 乙方对甲方提供的商业信息、技术秘密承担保密责任
2. 保密期限自签约之日起 2 年，不因合同终止而解除
3. 违反保密义务造成损失的，违约方应赔偿实际损失

## 七、成果交付

1. 咨询建议仅供甲方参考，不构成对结果的保证
2. 乙方不对甲方基于咨询建议做出的决策承担连带责任

## 八、违约责任

1. 甲方逾期付款，每逾期一日按未付金额的 0.1% 支付违约金
2. 乙方未按约定提供服务，甲方有权按比例扣减服务费

## 九、其他约定

{{specialRequirements}}

---
签署日期：____年____月____日`,
};

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const { projects } = useProjectStore();

  const [selectedType, setSelectedType] = useState<ContractTemplateType | null>(null);

  /** 当前选中的模板 */
  const selectedTemplate = selectedType
    ? contractTemplates.find((t) => t.type === selectedType)
    : null;

  /** 模板全文内容 */
  const selectedContent = selectedType ? templateContentMap[selectedType] : '';

  /** 使用此模板：跳转到项目合同生成页 */
  const handleUseTemplate = () => {
    if (projects.length === 0) {
      return; // 没有项目，按钮禁用
    }
    if (selectedType) {
      // 跳转到第一个项目的合同生成页，并预选模板类型
      const firstProject = projects[0];
      navigate(`/projects/${firstProject.id}/contract?template=${selectedType}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-text">合同模板库</h2>
        <p className="text-sm text-text-secondary mt-1">
          选择适合你项目类型的合同模板，快速生成专业合同
        </p>
      </div>

      {/* 模板卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {contractTemplates.map((template) => (
          <div
            key={template.type}
            onClick={() => setSelectedType(template.type)}
            className="
              bg-surface rounded-xl border border-border p-5
              hover:shadow-md hover:border-primary/30
              transition-all cursor-pointer group
            "
          >
            {/* 图标 */}
            <span className="text-4xl select-none block mb-3 group-hover:scale-110 transition-transform">
              {template.icon}
            </span>

            {/* 模板名称 */}
            <h3 className="text-base font-semibold text-text mb-2">
              {template.name}
            </h3>

            {/* 适用场景摘要 */}
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
              {template.description}
            </p>
          </div>
        ))}
      </div>

      {/* Modal 预览 */}
      {selectedType && selectedTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedType(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none">{selectedTemplate.icon}</span>
                <h3 className="text-lg font-semibold text-text">
                  {selectedTemplate.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedType(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-text-secondary cursor-pointer"
                aria-label="关闭"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            {/* Modal 内容（可滚动） */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <pre className="whitespace-pre-wrap text-sm text-text leading-relaxed font-sans">
                {selectedContent}
              </pre>
            </div>

            {/* Modal 底部按钮 */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button
                onClick={() => setSelectedType(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-gray-50 transition-colors cursor-pointer"
              >
                关闭
              </button>
              <button
                onClick={handleUseTemplate}
                disabled={projects.length === 0}
                className="
                  px-5 py-2 rounded-lg text-sm font-medium text-white
                  transition-colors cursor-pointer
                  bg-primary hover:bg-primary-dark
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                "
              >
                {projects.length === 0 ? '请先创建一个项目' : '使用此模板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
