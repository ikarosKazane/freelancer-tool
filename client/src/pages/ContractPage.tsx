import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useQuotationStore } from '@/stores/quotationStore';
import { useContractStore } from '@/stores/contractStore';
import { useUserStore } from '@/stores/userStore';
import type { ContractTemplateType, ContractVariables } from '@/types';
import ContractForm from '@/components/ContractForm';
import ContractPreview from '@/components/ContractPreview';

/**
 * 合同生成页面（三步向导）
 *
 * Step 1: 选择合同模板（设计/开发/撰稿/咨询）
 * Step 2: 填写合同变量（ContractForm）
 * Step 3: 预览导出（ContractPreview）
 */

/** 模板卡片配置 */
const templateOptions: {
  type: ContractTemplateType;
  icon: string;
  name: string;
  description: string;
}[] = [
  {
    type: 'design',
    icon: '🎨',
    name: '设计服务合同',
    description: '适用于 UI/UX 设计、品牌设计、插画等设计类项目。',
  },
  {
    type: 'development',
    icon: '💻',
    name: '软件开发合同',
    description: '适用于网站开发、App 开发、小程序等软件开发项目。',
  },
  {
    type: 'writing',
    icon: '✍️',
    name: '内容撰稿合同',
    description: '适用于文案撰写、内容营销、翻译等文字类项目。',
  },
  {
    type: 'consulting',
    icon: '📊',
    name: '咨询服务合同',
    description: '适用于技术咨询、运营顾问、管理咨询等服务类项目。',
  },
];

/** Stepper 步骤配置 */
const steps = [
  { num: 1, label: '选择模板' },
  { num: 2, label: '填写信息' },
  { num: 3, label: '预览导出' },
];

/** 默认合同变量 */
function getDefaultVariables(): ContractVariables {
  return {
    partyA: '',
    partyB: '',
    projectName: '',
    amount: 0,
    paymentTerms: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    specialRequirements: '',
  };
}

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const { currentProject, fetchProject } = useProjectStore();
  const { quotations, fetchQuotations } = useQuotationStore();
  const { generatedContent, loading, generateContract, createContract } =
    useContractStore();
  const { user, fetchUser } = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [templateType, setTemplateType] = useState<ContractTemplateType>('development');
  const [variables, setVariables] = useState<ContractVariables>(getDefaultVariables());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchQuotations(projectId);
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /** 项目和用户数据加载后预填变量 */
  useEffect(() => {
    if (currentProject && user) {
      // 获取最新报价单的总金额
      const latestQuotation = quotations.length > 0 ? quotations[0] : null;
      const amount = latestQuotation?.totalAmount || currentProject.budget;

      setVariables((prev) => ({
        ...prev,
        partyA: currentProject.clientName || '',
        partyB: user.name || '',
        projectName: currentProject.name || '',
        amount,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, user, quotations]);

  /** Step 1: 选择模板后自动进入 Step 2 */
  const handleSelectTemplate = (type: ContractTemplateType) => {
    setTemplateType(type);
    setCurrentStep(2);
  };

  /** Step 2: 变量变更 */
  const handleVariablesChange = (vars: ContractVariables) => {
    setVariables(vars);
  };

  /** Step 2: 生成合同 */
  const handleGenerateContract = async () => {
    await generateContract({
      templateType,
      variables,
    });
    setCurrentStep(3);
  };

  /** Step 3: 保存合同 */
  const handleSave = async () => {
    setSaving(true);
    try {
      await createContract(projectId, {
        templateType,
        variables,
      });
      navigate(`/projects/${projectId}`);
    } catch {
      // Store 已处理错误
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 2L4 8l6 6" />
          </svg>
          返回项目
        </button>
        <h2 className="text-lg font-semibold text-text">合同生成</h2>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep >= step.num
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.num}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep >= step.num ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-3 ${
                  currentStep > step.num ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: 选择模板 */}
      {currentStep === 1 && (
        <div className="max-w-3xl mx-auto">
          <h3 className="text-base font-semibold text-text text-center mb-6">
            选择合同模板
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templateOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleSelectTemplate(option.type)}
                className={`bg-surface border-2 rounded-xl p-6 text-left transition-all hover:shadow-md cursor-pointer ${
                  templateType === option.type
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-3xl block mb-3 select-none">
                  {option.icon}
                </span>
                <h4 className="text-sm font-semibold text-text mb-1">
                  {option.name}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: 填写信息 */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="bg-surface border border-border rounded-xl p-5 max-w-[640px] mx-auto">
            <h3 className="text-base font-semibold text-text mb-4">
              填写合同信息
            </h3>
            <ContractForm
              templateType={templateType}
              variables={variables}
              onChange={handleVariablesChange}
            />
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between max-w-[640px] mx-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              上一步
            </button>
            <button
              onClick={handleGenerateContract}
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  生成合同中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  生成合同
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 预览导出 */}
      {currentStep === 3 && (
        <div className="space-y-5">
          {generatedContent ? (
            <>
              <ContractPreview
                content={generatedContent}
                variables={variables}
                projectName={currentProject?.name || ''}
              />

              {/* 底部操作栏 */}
              <div className="flex items-center justify-between max-w-[800px] mx-auto">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  上一步
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? '保存中...' : '保存合同'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-text-secondary">
              <p className="text-sm">合同内容生成失败，请返回重试。</p>
              <button
                onClick={() => setCurrentStep(2)}
                className="mt-4 px-5 py-2.5 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
              >
                返回上一步
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
