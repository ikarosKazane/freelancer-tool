import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, ProjectStatus } from '@/types';
import { formatCurrency, formatDateShort } from '@/lib/format';
import StatusBadge from './StatusBadge';

/**
 * 项目卡片组件（列表视图）
 *
 * 横向卡片布局，显示项目概要信息。
 * 右侧状态下拉框可快速切换项目状态。
 */

/** 状态选项配置 */
const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'draft', label: '草稿', color: '#6B7280' },
  { value: 'quoted', label: '已报价', color: '#2563EB' },
  { value: 'signed', label: '已签约', color: '#7C3AED' },
  { value: 'paid', label: '已收款', color: '#059669' },
  { value: 'completed', label: '已完成', color: '#166534' },
];

interface ProjectCardProps {
  project: Project;
  onStatusChange?: (projectId: number, newStatus: ProjectStatus) => void;
}

export default function ProjectCard({ project, onStatusChange }: ProjectCardProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleCardClick = (e: React.MouseEvent) => {
    // 点击下拉区域时不触发导航
    if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  const handleStatusSelect = (e: React.MouseEvent, newStatus: ProjectStatus) => {
    e.stopPropagation();
    setShowDropdown(false);
    if (newStatus !== project.status && onStatusChange) {
      onStatusChange(project.id, newStatus);
    }
  };

  return (
    <div
      className="
        bg-surface rounded-xl border border-border
        hover:shadow-md hover:border-primary/20 transition-all
        cursor-pointer
      "
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* 左侧：项目信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-text truncate">
                {project.name}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="truncate max-w-[160px]">
                {project.clientName || '暂无客户'}
              </span>
              <span className="text-primary font-semibold">
                {formatCurrency(project.budget)}
              </span>
              <span>{formatDateShort(project.updatedAt)}</span>
            </div>
          </div>

          {/* 右侧：状态切换下拉 */}
          <div ref={dropdownRef} className="relative ml-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="
                flex items-center gap-1 px-2.5 py-1.5
                text-xs font-medium text-text-secondary
                bg-gray-50 hover:bg-gray-100 border border-border
                rounded-lg transition-colors cursor-pointer
              "
              title="切换状态"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 4.5L6 7.5L9 4.5" />
              </svg>
              状态
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-border rounded-lg shadow-lg z-50 py-1">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => handleStatusSelect(e, opt.value)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-1.5 text-xs
                      hover:bg-gray-50 transition-colors cursor-pointer
                      ${opt.value === project.status ? 'bg-gray-50 font-medium' : ''}
                    `}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span className={opt.value === project.status ? 'text-text' : 'text-text-secondary'}>
                      {opt.label}
                    </span>
                    {opt.value === project.status && (
                      <svg className="ml-auto w-3.5 h-3.5 text-primary" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 7l3.5 3.5L12 3" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
