/**
 * 空状态引导组件
 *
 * 用于空列表页面的引导展示，包含图标、标题、描述和可选的操作按钮。
 */

interface EmptyStateProps {
  /** 展示图标（emoji） */
  icon: string;
  /** 标题文字 */
  title: string;
  /** 描述文字 */
  description: string;
  /** 操作按钮文字（可选） */
  actionText?: string;
  /** 操作按钮点击回调（可选） */
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <span className="text-6xl mb-4 select-none">{icon}</span>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
