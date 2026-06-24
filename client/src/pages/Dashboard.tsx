import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useProjectStore } from '@/stores/projectStore';
import type { UserStats, Project } from '@/types';
import { get } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

/**
 * 仪表盘页面
 *
 * 展示欢迎语、统计卡片（本月收入/进行中项目/收款率）、
 * 进行中项目列表和待收款项目列表。
 */

/** 骨架屏占位块 */
function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  /** 加载统计数据 */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await get<UserStats>('/api/user/stats');
        setStats(data);
      } catch {
        // 统计数据获取失败时保持 null，页面仍可展示项目列表
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  /** 加载项目列表 */
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loading = statsLoading || projectsLoading;

  /** 进行中项目（非 completed 状态），最多 5 条 */
  const activeProjects = projects
    .filter((p: Project) => p.status !== 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  /** 计算收款率 */
  const collectionRate = stats
    ? stats.totalIncome > 0
      ? Math.round(((stats.totalIncome - stats.pendingAmount) / stats.totalIncome) * 100)
      : 0
    : 0;

  /** 今日日期 */
  const today = formatDate(new Date());

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        {/* 欢迎语骨架 */}
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-64" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
        {/* 统计卡片骨架 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        {/* 列表骨架 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 欢迎语 + 日期 */}
      <div>
        <h2 className="text-2xl font-bold text-text">
          你好，{user?.name || '用户'} 👋
        </h2>
        <p className="text-sm text-text-secondary mt-1">{today}</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 本月收入 */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <span className="text-lg select-none">💰</span>
            <span>本月收入</span>
          </div>
          <p className="text-2xl font-bold text-text">
            {stats ? formatCurrency(stats.monthlyIncome) : '—'}
          </p>
        </div>

        {/* 进行中项目 */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <span className="text-lg select-none">📋</span>
            <span>进行中项目</span>
          </div>
          <p className="text-2xl font-bold text-text">
            {stats ? `${stats.monthlyProjects} 个` : '—'}
          </p>
        </div>

        {/* 收款率 */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <span className="text-lg select-none">📊</span>
            <span>收款率</span>
          </div>
          <p className="text-2xl font-bold text-text">
            {stats ? `${collectionRate}%` : '—'}
          </p>
        </div>
      </div>

      {/* 新建项目快捷按钮 */}
      <button
        onClick={() => navigate('/projects/new')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
      >
        <span>+</span>
        <span>新建项目</span>
      </button>

      {/* 项目列表：无项目时展示空状态 */}
      {projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="还没有项目"
          description="创建你的第一个项目，开始报价、签约和收款之旅吧！"
          actionText="创建项目"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        /* 下方两列布局 */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左列：进行中项目 */}
          <div className="bg-surface rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-text">进行中项目</h3>
            </div>
            <div className="divide-y divide-border">
              {activeProjects.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-text-secondary">
                  暂无进行中的项目
                </div>
              ) : (
                activeProjects.map((project: Project) => (
                  <div
                    key={project.id}
                    className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        {project.clientName || '暂无客户'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(project.budget)}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 右列：待收款项目 */}
          <div className="bg-surface rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-text">待收款项目</h3>
            </div>
            <div className="divide-y divide-border">
              {activeProjects.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-text-secondary">
                  暂无待收款项目
                </div>
              ) : (
                activeProjects
                  .filter((p: Project) => p.status !== 'paid' && p.status !== 'completed')
                  .map((project: Project) => (
                    <div
                      key={project.id}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}/payment`)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {project.clientName || '暂无客户'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-sm font-semibold text-warning">
                          {formatCurrency(project.budget)}
                        </span>
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
