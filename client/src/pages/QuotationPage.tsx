import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useQuotationStore } from '@/stores/quotationStore';
import { useUserStore } from '@/stores/userStore';
import type { QuotationItem } from '@/types';
import QuotationForm from '@/components/QuotationForm';
import QuotationPreview from '@/components/QuotationPreview';

/**
 * 报价生成页面（三步向导）
 *
 * Step 1: 项目描述 → AI 智能生成
 * Step 2: 编辑报价项（QuotationForm）
 * Step 3: 预览导出（QuotationPreview）
 */

/** Stepper 步骤配置 */
const steps = [
  { num: 1, label: '项目描述' },
  { num: 2, label: '编辑报价' },
  { num: 3, label: '预览导出' },
];

export default function QuotationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const { currentProject, fetchProject } = useProjectStore();
  const {
    generatedItems,
    suggestedPaymentTerms,
    loading,
    generateQuotation,
    createQuotation,
    setGeneratedItems,
  } = useQuotationStore();
  const { user, fetchUser } = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /** 项目加载后预填描述 */
  useEffect(() => {
    if (currentProject) {
      setDescription(currentProject.description || '');
    }
  }, [currentProject]);

  /** AI 生成完成后进入 Step 2 */
  useEffect(() => {
    if (generatedItems.length > 0 && currentStep === 1) {
      setItems(generatedItems);
      setCurrentStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedItems]);

  /** Step 1: AI 智能生成 */
  const handleGenerate = async () => {
    if (!currentProject || !description.trim()) return;
    await generateQuotation({
      projectName: currentProject.name,
      description: description.trim(),
      budgetHint: currentProject.budget,
      profession: user?.profession || 'developer',
    });
  };

  /** Step 2: 报价项变更 */
  const handleItemsChange = (updatedItems: QuotationItem[]) => {
    setItems(updatedItems);
    setGeneratedItems(updatedItems);
  };

  /** Step 2 → Step 3 */
  const handleNextToPreview = () => {
    if (items.length === 0) return;
    setCurrentStep(3);
  };

  /** Step 3: 保存报价单 */
  const handleSave = async () => {
    if (!currentProject) return;
    setSaving(true);
    try {
      const validDays = 30;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);

      await createQuotation(projectId, {
        items,
        validUntil: validUntil.toISOString().slice(0, 10),
        paymentTerms: suggestedPaymentTerms || '按月支付',
        notes: '',
      });
      navigate(`/projects/${projectId}`);
    } catch {
      // Store 已处理错误
    } finally {
      setSaving(false);
    }
  };

  /** 合计金额 */
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

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
        <h2 className="text-lg font-semibold text-text">报价生成</h2>
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

      {/* Step 1: 项目描述 */}
      {currentStep === 1 && (
        <div className="max-w-[640px] mx-auto space-y-5">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-text">
              描述你的项目
            </h3>
            <p className="text-sm text-text-secondary">
              请详细描述项目需求，AI 将根据描述自动生成报价项。
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="如：为企业设计一套完整的品牌视觉系统，包括 Logo、名片、宣传册等..."
              rows={6}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  AI 正在生成报价...
                </>
              ) : (
                <>
                  <span>✨</span>
                  AI 智能生成报价
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 编辑报价 */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-base font-semibold text-text mb-4">
              编辑报价项
            </h3>
            <QuotationForm items={items} onChange={handleItemsChange} />
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              上一步
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text">
                合计：
                <span className="text-lg font-bold text-primary ml-1">
                  ¥{total.toFixed(2)}
                </span>
              </span>
              <button
                onClick={handleNextToPreview}
                disabled={items.length === 0}
                className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                下一步：预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 预览导出 */}
      {currentStep === 3 && (
        <div className="space-y-5">
          <QuotationPreview
            items={items}
            projectName={currentProject?.name || ''}
            clientName={currentProject?.clientName || ''}
            date={new Date().toISOString()}
            validUntil={
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10)
            }
            paymentTerms={suggestedPaymentTerms || '按月支付'}
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
              {saving ? '保存中...' : '保存报价单'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
