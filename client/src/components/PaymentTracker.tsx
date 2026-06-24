import { useState, useEffect } from 'react';
import type { CreatePaymentRequest } from '@/types';
import { usePaymentStore } from '@/stores/paymentStore';
import { formatCurrency, formatDateShort } from '@/lib/format';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

/**
 * 收款追踪面板组件
 *
 * 顶部汇总条（总额/已收/待收 + 进度条）+ 收款记录表格。
 * 支持添加收款记录、切换状态、删除记录、生成催款文案。
 */

interface PaymentTrackerProps {
  projectId: number;
  projectAmount: number;
}

export default function PaymentTracker({
  projectId,
  projectAmount,
}: PaymentTrackerProps) {
  const {
    payments,
    loading,
    totalPaid,
    fetchPayments,
    createPayment,
    togglePaymentStatus,
    deletePayment,
  } = usePaymentStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showCollectionText, setShowCollectionText] = useState(false);
  const [collectionTarget, setCollectionTarget] = useState<{
    name: string;
    amount: number;
    days: number;
  } | null>(null);

  // 新收款记录表单
  const [formAmount, setFormAmount] = useState(0);
  const [formPaymentDate, setFormPaymentDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    fetchPayments(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /** 收款进度百分比 */
  const progressPercent =
    projectAmount > 0 ? Math.min((totalPaid / projectAmount) * 100, 100) : 0;

  /** 待收金额（总额 - 已收） */
  const remaining = Math.max(projectAmount - totalPaid, 0);

  /** 提交新收款记录 */
  const handleCreatePayment = async () => {
    if (formAmount <= 0) return;
    const data: CreatePaymentRequest = {
      amount: formAmount,
      paymentDate: formPaymentDate || new Date().toISOString().slice(0, 10),
      dueDate: formDueDate || new Date().toISOString().slice(0, 10),
      note: formNote,
    };
    await createPayment(projectId, data);
    // 重置表单
    setFormAmount(0);
    setFormPaymentDate('');
    setFormDueDate('');
    setFormNote('');
    setShowAddForm(false);
  };

  /** 判断是否逾期（pending 且到期日已过） */
  const isOverdue = (dueDate: string, status: string): boolean => {
    if (status !== 'pending') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  /** 计算逾期天数 */
  const getOverdueDays = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return Math.max(
      Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
      0,
    );
  };

  /** 打开催款文案弹窗 */
  const openCollectionText = (payment: (typeof payments)[0]) => {
    const days = getOverdueDays(payment.dueDate);
    setCollectionTarget({
      name: '', // 项目名需要从外部获取，此处留空
      amount: payment.amount,
      days,
    });
    setShowCollectionText(true);
  };

  /** 生成催款文案文本 */
  const getCollectionText = (): string => {
    if (!collectionTarget) return '';
    return [
      '【收款通知】',
      `项目金额：${formatCurrency(collectionTarget.amount)}`,
      `已逾期${collectionTarget.days}天，请尽快完成支付，谢谢！`,
      '',
      '如有疑问请随时联系我，期待继续合作。',
    ].join('\n');
  };

  /** 复制催款文案到剪贴板 */
  const copyCollectionText = async () => {
    try {
      await navigator.clipboard.writeText(getCollectionText());
    } catch {
      // 降级处理
      const textarea = document.createElement('textarea');
      textarea.value = getCollectionText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="space-y-5">
      {/* 汇总条 */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-text-secondary mb-1">项目总额</p>
            <p className="text-lg font-bold text-text">
              {formatCurrency(projectAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">已收金额</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">待收金额</p>
            <p className="text-lg font-bold text-warning">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-success h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary mt-1.5 text-right">
          收款进度 {progressPercent.toFixed(1)}%
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">收款记录</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" />
          </svg>
          添加收款记录
        </button>
      </div>

      {/* 添加表单弹窗 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-text">
              添加收款记录
            </h3>
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                金额（¥）
              </label>
              <input
                type="number"
                min={0}
                value={formAmount || ''}
                onChange={(e) =>
                  setFormAmount(Number(e.target.value) || 0)
                }
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  收款日期
                </label>
                <input
                  type="date"
                  value={formPaymentDate}
                  onChange={(e) => setFormPaymentDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  到期日
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                备注
              </label>
              <input
                type="text"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="选填"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreatePayment}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 催款文案弹窗 */}
      {showCollectionText && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-text">催款文案</h3>
            <textarea
              readOnly
              value={getCollectionText()}
              rows={6}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-gray-50 text-text resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCollectionText(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                关闭
              </button>
              <button
                onClick={copyCollectionText}
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
              >
                复制文案
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 收款记录列表 */}
      {loading ? (
        <div className="text-center py-10 text-text-secondary text-sm">
          加载中...
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon="💰"
          title="暂无收款记录"
          description="点击上方按钮添加第一笔收款记录，追踪项目收款进度。"
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  金额
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  收款日期
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  到期日
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  状态
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  备注
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const overdue = isOverdue(payment.dueDate, payment.status);
                return (
                  <tr
                    key={payment.id}
                    className={`border-b border-border/50 last:border-0 ${
                      overdue ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-text">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDateShort(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatDateShort(payment.dueDate)}
                      {overdue && (
                        <span className="ml-1.5 text-danger text-xs font-medium">
                          逾期{getOverdueDays(payment.dueDate)}天
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={payment.status} type="payment" />
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs max-w-[120px] truncate">
                      {payment.note || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            togglePaymentStatus(payment.id, payment.status)
                          }
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                            payment.status === 'pending'
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                          }`}
                        >
                          {payment.status === 'pending' ? '标记已付' : '标记未付'}
                        </button>
                        {overdue && (
                          <button
                            onClick={() => openCollectionText(payment)}
                            className="px-2.5 py-1 text-xs font-medium bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors cursor-pointer"
                          >
                            催款
                          </button>
                        )}
                        <button
                          onClick={() => deletePayment(payment.id)}
                          className="p-1 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                          title="删除"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M1.75 3.5h10.5M4.67 3.5V2.33a1.17 1.17 0 0 1 1.16-1.16h2.34a1.17 1.17 0 0 1 1.16 1.16v1.17m1.75 0v8.17a1.17 1.17 0 0 1-1.16 1.16H4.08a1.17 1.17 0 0 1-1.16-1.16V3.5h8.16Z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
