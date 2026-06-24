/**
 * 状态标签组件
 *
 * 根据状态值和类型渲染不同颜色的圆角标签。
 * 支持项目状态（5 种）和收款状态（2 种）两套配色方案。
 */

interface StatusBadgeProps {
  /** 状态值 */
  status: string;
  /** 状态类型：项目状态或收款状态 */
  type?: 'project' | 'payment';
}

/** 项目状态配色映射 */
const projectStatusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  draft: { label: '草稿', bg: 'bg-gray-100', text: 'text-gray-600' },
  quoted: { label: '已报价', bg: 'bg-blue-100', text: 'text-blue-700' },
  signed: { label: '已签约', bg: 'bg-purple-100', text: 'text-purple-700' },
  paid: { label: '已收款', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-800' },
};

/** 收款状态配色映射 */
const paymentStatusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pending: { label: '待收款', bg: 'bg-amber-100', text: 'text-amber-700' },
  paid: { label: '已收款', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export default function StatusBadge({ status, type = 'project' }: StatusBadgeProps) {
  const configMap = type === 'payment' ? paymentStatusConfig : projectStatusConfig;
  const config = configMap[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
