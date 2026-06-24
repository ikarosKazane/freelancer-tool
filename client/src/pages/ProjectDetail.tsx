import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useQuotationStore } from '@/stores/quotationStore';
import { useContractStore } from '@/stores/contractStore';
import { formatCurrency, formatDate } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import PaymentTracker from '@/components/PaymentTracker';

/**
 * 项目详情页面
 *
 * 顶部区域：返回按钮 + 项目名称 + 状态标签 + 删除按钮。
 * 概览卡片：客户名、联系方式、预算金额、创建/更新时间。
 * Tab 导航：报价单、合同、收款。
 */

type TabKey = 'quotation' | 'contract' | 'payment';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const { currentProject, loading, fetchProject, deleteProject } =
    useProjectStore();
  const { quotations, fetchQuotations } = useQuotationStore();
  const { contracts, fetchContracts } = useContractStore();

  const [activeTab, setActiveTab] = useState<TabKey>('quotation');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchQuotations(projectId);
      fetchContracts(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /** 删除项目 */
  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      navigate('/projects');
    } catch {
      // Store 已处理错误
    }
    setShowDeleteConfirm(false);
  };

  /** 返回列表 */
  const handleBack = () => {
    navigate('/projects');
  };

  /** Tab 配置 */
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'quotation', label: '报价单', icon: '📝' },
    { key: 'contract', label: '合同', icon: '📄' },
    { key: 'payment', label: '收款', icon: '💰' },
  ];

  /** 项目数据加载中 */
  if (loading && !currentProject) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-64 bg-gray-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  /** 项目不存在 */
  if (!currentProject) {
    return (
      <EmptyState
        icon="❌"
        title="项目不存在"
        description="该项目可能已被删除或 ID 不正确。"
        actionText="返回看板"
        onAction={handleBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
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
            返回看板
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-sm text-danger border border-danger/30 rounded-lg hover:bg-danger/5 transition-colors cursor-pointer"
          >
            删除项目
          </button>
        </div>
      </div>

      {/* 项目名称 + 状态 */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-text">{currentProject.name}</h1>
        <StatusBadge status={currentProject.status} />
      </div>

      {/* 概览卡片 */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
          <div>
            <p className="text-xs text-text-secondary mb-0.5">客户名称</p>
            <p className="text-sm font-medium text-text">
              {currentProject.clientName || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">联系方式</p>
            <p className="text-sm font-medium text-text">
              {currentProject.clientContact || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">预算金额</p>
            <p className="text-sm font-semibold text-primary">
              {formatCurrency(currentProject.budget)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">创建时间</p>
            <p className="text-sm font-medium text-text">
              {formatDate(currentProject.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">更新时间</p>
            <p className="text-sm font-medium text-text">
              {formatDate(currentProject.updatedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-0.5">项目描述</p>
            <p className="text-sm text-text line-clamp-2">
              {currentProject.description || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text hover:border-gray-300'
              }`}
            >
              <span className="select-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容 */}
      <div>
        {/* 报价单 Tab */}
        {activeTab === 'quotation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">已保存的报价单</h3>
              <button
                onClick={() => navigate(`/projects/${projectId}/quotation`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 1v12M1 7h12" />
                </svg>
                生成报价单
              </button>
            </div>

            {quotations.length === 0 ? (
              <EmptyState
                icon="📝"
                title="暂无报价单"
                description="点击上方按钮，通过 AI 智能生成专业报价单。"
                actionText="生成报价单"
                onAction={() => navigate(`/projects/${projectId}/quotation`)}
              />
            ) : (
              <div className="space-y-3">
                {quotations.map((q) => (
                  <div
                    key={q.id}
                    className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-text">
                        报价单 #{q.id}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {q.items.length} 项 · 合计{' '}
                        {formatCurrency(q.totalAmount)} ·{' '}
                        <StatusBadge status={q.status} type="project" />
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {formatDate(q.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 合同 Tab */}
        {activeTab === 'contract' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">已保存的合同</h3>
              <button
                onClick={() => navigate(`/projects/${projectId}/contract`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 1v12M1 7h12" />
                </svg>
                生成合同
              </button>
            </div>

            {contracts.length === 0 ? (
              <EmptyState
                icon="📄"
                title="暂无合同"
                description="点击上方按钮，选择行业模板一键生成标准合同。"
                actionText="生成合同"
                onAction={() => navigate(`/projects/${projectId}/contract`)}
              />
            ) : (
              <div className="space-y-3">
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-text">
                        合同 #{c.id}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        模板：{c.templateType} ·{' '}
                        <StatusBadge status={c.status} type="project" />
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 收款 Tab */}
        {activeTab === 'payment' && (
          <PaymentTracker
            projectId={projectId}
            projectAmount={currentProject.budget}
          />
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-text">确认删除</h3>
            <p className="text-sm text-text-secondary">
              确定要删除项目「{currentProject.name}
              」吗？此操作不可恢复，关联的报价单、合同和收款记录将一并删除。
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/90 transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
