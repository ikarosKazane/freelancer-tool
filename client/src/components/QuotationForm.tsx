import type { QuotationItem } from '@/types';
import { formatCurrency } from '@/lib/format';

/**
 * 报价单编辑表单组件
 *
 * 提供报价项列表的增删改功能，每行显示名称、描述、工时、单价和小计。
 * 底部有添加项目按钮和合计金额显示。所有输入使用受控组件。
 */

interface QuotationFormProps {
  items: QuotationItem[];
  onChange: (items: QuotationItem[]) => void;
}

export default function QuotationForm({ items, onChange }: QuotationFormProps) {
  /** 更新单个报价项的字段 */
  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    // 自动重算小计
    item.subtotal = item.hours * item.rate;
    updated[index] = item;
    onChange(updated);
  };

  /** 添加新报价项 */
  const addItem = () => {
    onChange([
      ...items,
      { name: '', description: '', hours: 0, rate: 0, subtotal: 0 },
    ]);
  };

  /** 删除报价项 */
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  /** 合计金额 */
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-center py-8 text-text-secondary text-sm">
          暂无报价项，点击下方按钮添加
        </div>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="bg-surface border border-border rounded-lg p-4 space-y-3"
        >
          {/* 第一行：名称 + 删除 */}
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <label className="block text-xs text-text-secondary mb-1">
                项目名称
              </label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="如：UI 设计"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              onClick={() => removeItem(index)}
              className="mt-6 p-1.5 text-danger hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="删除"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4h9.34Z" />
              </svg>
            </button>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              描述
            </label>
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(index, 'description', e.target.value)}
              placeholder="简要描述此报价项"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* 工时 + 单价 + 小计 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                工时（h）
              </label>
              <input
                type="number"
                min={0}
                value={item.hours || ''}
                onChange={(e) =>
                  updateItem(index, 'hours', Number(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                单价（¥/h）
              </label>
              <input
                type="number"
                min={0}
                value={item.rate || ''}
                onChange={(e) =>
                  updateItem(index, 'rate', Number(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                小计
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-border rounded-lg text-sm font-semibold text-text text-right">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 添加项目 + 合计 */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 px-4 py-2 text-primary text-sm font-medium border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v12M1 7h12" />
          </svg>
          添加项目
        </button>
        <div className="text-sm text-text">
          合计：
          <span className="text-lg font-bold text-primary ml-1">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
