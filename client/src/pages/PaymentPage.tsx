import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import PaymentTracker from '@/components/PaymentTracker';
import EmptyState from '@/components/EmptyState';

/**
 * 收款管理页面
 *
 * 加载项目数据后嵌入 PaymentTracker 组件。
 * 显示页面标题和返回按钮。
 */

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = Number(id);

  const { currentProject, loading, fetchProject } = useProjectStore();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /** 加载中 */
  if (loading && !currentProject) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
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
        onAction={() => navigate('/projects')}
      />
    );
  }

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
        <h2 className="text-lg font-semibold text-text">收款管理</h2>
      </div>

      {/* 收款追踪器 */}
      <PaymentTracker
        projectId={projectId}
        projectAmount={currentProject.budget}
      />
    </div>
  );
}
