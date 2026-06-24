import type { ContractTemplateType, ContractVariables } from '@/types';

/**
 * 合同变量填写表单组件
 *
 * 根据所选合同模板类型渲染变量输入框，用于填写甲乙双方信息、
 * 项目名称、金额、付款方式、日期范围和特殊要求。
 */

interface ContractFormProps {
  templateType: ContractTemplateType;
  variables: ContractVariables;
  onChange: (vars: ContractVariables) => void;
}

/** 付款方式选项 */
const paymentMethodOptions: string[] = [
  '按月支付',
  '按里程碑支付',
  '一次性支付',
  '分期付款（50%预付 + 50%验收）',
  '分期付款（30%预付 + 70%验收）',
];

/** 模板类型中文名称映射 */
const templateTypeLabel: Record<ContractTemplateType, string> = {
  design: '设计服务',
  development: '软件开发',
  writing: '内容撰稿',
  consulting: '咨询服务',
};

export default function ContractForm({
  templateType,
  variables,
  onChange,
}: ContractFormProps) {
  /** 更新单个变量字段 */
  const updateField = (field: keyof ContractVariables, value: string | number) => {
    onChange({ ...variables, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div className="text-sm text-text-secondary bg-blue-50 border border-blue-100 rounded-lg p-3">
        当前模板：
        <span className="font-medium text-blue-700">
          {templateTypeLabel[templateType]}
        </span>
        合同，请填写以下变量信息。
      </div>

      {/* 甲方名称 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          甲方名称（客户） <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={variables.partyA}
          onChange={(e) => updateField('partyA', e.target.value)}
          placeholder="填写客户公司或个人名称"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 乙方名称 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          乙方名称（服务方） <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={variables.partyB}
          onChange={(e) => updateField('partyB', e.target.value)}
          placeholder="填写您的姓名或公司名称"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 项目名称 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          项目名称 <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          value={variables.projectName}
          onChange={(e) => updateField('projectName', e.target.value)}
          placeholder="填写合同对应的项目名称"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 合同金额 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          合同金额 <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
            ¥
          </span>
          <input
            type="number"
            min={0}
            value={variables.amount || ''}
            onChange={(e) =>
              updateField('amount', Number(e.target.value) || 0)
            }
            placeholder="0.00"
            className="w-full pl-8 pr-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* 付款方式 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          付款方式
        </label>
        <select
          value={variables.paymentTerms}
          onChange={(e) => updateField('paymentTerms', e.target.value)}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">请选择付款方式</option>
          {paymentMethodOptions.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      {/* 日期范围 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            开始日期
          </label>
          <input
            type="date"
            value={variables.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            结束日期
          </label>
          <input
            type="date"
            value={variables.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* 特殊要求 */}
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          特殊要求
        </label>
        <textarea
          value={variables.specialRequirements}
          onChange={(e) => updateField('specialRequirements', e.target.value)}
          placeholder="填写特殊条款、附加要求或备注（选填）"
          rows={4}
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
        />
      </div>
    </div>
  );
}
