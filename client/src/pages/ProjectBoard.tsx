import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import type { ProjectStatus } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import EmptyState from '@/components/EmptyState';

/**
 * 项目列表页面（标签筛选 + 状态切换）
 *
 * 顶部状态标签筛选，列表卡片展示，每张卡片可通过下拉切换状态。
 */

/** 筛选标签配置 */
const filterTabs: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '已报价', value: 'quoted' },
  { label: '已签约', value: 'signed' },
  { label: '已收款', value: 'paid' },
  { label: '已完成', value: 'completed' },
];

export default function ProjectBoard() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects, updateProject } = useProjectStore();
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 按筛选条件过滤 */
  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === activeFilter);

  /** 状态切换 */
  const handleStatusChange = (projectId: number, newStatus: ProjectStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  /** 新建项目 */
  const handleNewProject = () => {
    navigate('/projects/new');
  };

  /** 各状态数量统计 */
  const statusCounts: Record<string, number> = { all: projects.length };
  for (const p of projects) {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  }

  return (
    <div className="space-y-5">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">项目列表</h1>
        <button
          onClick={handleNewProject}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" />
          </svg>
          新建项目
        </button>
      </div>

      {/* 状态筛选标签 */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const count = statusCounts[tab.value] || 0;
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`
                flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                whitespace-nowrap transition-colors cursor-pointer
                ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }
              `}
            >
              {tab.label}
              <span
                className={`
                  inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                  rounded-full text-xs font-bold
                  ${isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-text-secondary'}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 加载态 */}
      {loading && projects.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredProjects.length === 0 && (
        <EmptyState
          icon={activeFilter === 'all' ? '📋' : '🔍'}
          title={activeFilter === 'all' ? '还没有项目' : `没有${filterTabs.find((t) => t.value === activeFilter)?.label || ''}状态的项目`}
          description={
            activeFilter === 'all'
              ? '点击上方按钮创建第一个项目，开始你的自由职业之旅。'
              : '尝试切换其他状态标签查看。'
          }
          actionText={activeFilter === 'all' ? '新建项目' : undefined}
          onAction={activeFilter === 'all' ? handleNewProject : undefined}
        />
      )}

      {/* 项目列表 */}
      {filteredProjects.length > 0 && (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
