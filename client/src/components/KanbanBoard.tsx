import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Project, ProjectStatus } from '@/types';
import ProjectCard from './ProjectCard';

/**
 * 看板组件
 *
 * 使用 @dnd-kit 实现 5 列（草稿/已报价/已签约/已收款/已完成）拖拽看板。
 * 桌面端横向排列，移动端竖向堆叠为列表视图。
 */

interface KanbanBoardProps {
  projects: Project[];
  onStatusChange: (projectId: number, newStatus: ProjectStatus) => void;
}

/** 列定义 */
const columns: {
  status: ProjectStatus;
  label: string;
  headerBg: string;
  headerText: string;
}[] = [
  {
    status: 'draft',
    label: '草稿',
    headerBg: 'bg-gray-100',
    headerText: 'text-gray-700',
  },
  {
    status: 'quoted',
    label: '已报价',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
  },
  {
    status: 'signed',
    label: '已签约',
    headerBg: 'bg-purple-50',
    headerText: 'text-purple-700',
  },
  {
    status: 'paid',
    label: '已收款',
    headerBg: 'bg-emerald-50',
    headerText: 'text-emerald-700',
  },
  {
    status: 'completed',
    label: '已完成',
    headerBg: 'bg-green-50',
    headerText: 'text-green-800',
  },
];

export default function KanbanBoard({ projects, onStatusChange }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** 拖拽结束回调：更新项目状态 */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as number;
    const overId = over.id;

    // 查找目标列（列 id 为 status 字符串，卡片 id 为 number）
    let newStatus: ProjectStatus | null = null;

    if (typeof overId === 'string') {
      // 拖放到列容器上
      newStatus = overId as ProjectStatus;
    } else {
      // 拖放到另一张卡片上，找到该卡片所在的列
      const overProject = projects.find((p) => p.id === overId);
      if (overProject) {
        newStatus = overProject.status;
      }
    }

    if (newStatus) {
      const project = projects.find((p) => p.id === projectId);
      if (project && project.status !== newStatus) {
        onStatusChange(projectId, newStatus);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* 桌面端：横向 5 列 */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const columnProjects = projects.filter((p) => p.status === col.status);
          return (
            <div
              key={col.status}
              className="flex-1 min-w-[220px] bg-bg rounded-lg flex flex-col"
            >
              {/* 列头 */}
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg ${col.headerBg}`}
              >
                <span className={`text-sm font-semibold ${col.headerText}`}>
                  {col.label}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${col.headerBg} ${col.headerText} border border-current/20`}
                >
                  {columnProjects.length}
                </span>
              </div>

              {/* 卡片列表（作为 droppable 区域） */}
              <SortableContext
                id={col.status}
                items={columnProjects.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  id={col.status}
                  className="flex-1 p-2 space-y-2 min-h-[120px]"
                >
                  {columnProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {columnProjects.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-text-secondary border-2 border-dashed border-border rounded-lg">
                      拖放项目到这里
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* 移动端：竖向列表视图 */}
      <div className="md:hidden space-y-4">
        {columns.map((col) => {
          const columnProjects = projects.filter((p) => p.status === col.status);
          return (
            <div key={col.status}>
              {/* 折叠标题 */}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${col.headerBg} mb-2`}
              >
                <span className={`text-sm font-semibold ${col.headerText}`}>
                  {col.label}
                </span>
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${col.headerBg} ${col.headerText} border border-current/20`}
                >
                  {columnProjects.length}
                </span>
              </div>

              <SortableContext
                id={col.status}
                items={columnProjects.map((p) => p.id)}
                strategy={rectSortingStrategy}
              >
                <div id={col.status} className="space-y-2 mb-4">
                  {columnProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {columnProjects.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-xs text-text-secondary border-2 border-dashed border-border rounded-lg">
                      暂无项目
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
