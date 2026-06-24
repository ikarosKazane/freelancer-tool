import { useRef, useState } from 'react';
import type { QuotationItem } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { exportToPdf } from '@/lib/pdf';

/**
 * 报价单预览组件
 *
 * A4 排版预览容器，展示完整报价单信息（头部、明细表格、合计金额）。
 * 提供 ref 用于 PDF 导出，包含「导出 PDF」按钮。
 */

interface QuotationPreviewProps {
  /** 报价项列表 */
  items: QuotationItem[];
  /** 项目名称 */
  projectName: string;
  /** 客户名称 */
  clientName: string;
  /** 报价单编号（可选） */
  quotationNumber?: string;
  /** 报价日期 */
  date?: string;
  /** 有效期 */
  validUntil?: string;
  /** 付款条件 */
  paymentTerms?: string;
  /** 备注 */
  notes?: string;
}

export default function QuotationPreview({
  items,
  projectName,
  clientName,
  quotationNumber = '',
  date = new Date().toISOString(),
  validUntil = '',
  paymentTerms = '',
  notes = '',
}: QuotationPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  /** 导出为 PDF（带错误处理） */
  const handleExportPdf = async () => {
    if (!previewRef.current) return;
    setPdfError(null);
    setExporting(true);
    try {
      const filename = `报价单-${projectName}-${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportToPdf(previewRef.current, filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[QuotationPreview] PDF 导出失败:', err);
      setPdfError('PDF导出失败: ' + msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 操作栏 */}
      <div className="w-full max-w-[800px] flex justify-end items-center gap-3 mb-4">
        {pdfError && (
          <span className="text-sm text-red-600">{pdfError}</span>
        )}
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 1v8M3 6l4 4 4-4M1 11v2h12v-2" />
          </svg>
          {exporting ? '导出中...' : '导出 PDF'}
        </button>
      </div>

      {/* A4 预览容器 */}
      <div
        ref={previewRef}
        className="bg-surface w-full max-w-[800px] shadow-lg rounded-lg p-10"
        style={{ minHeight: '900px' }}
      >
        {/* 头部 */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-1">报价单</h1>
            {quotationNumber && (
              <p className="text-xs text-text-secondary">
                编号：{quotationNumber}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-text-secondary space-y-0.5">
            <p>日期：{formatDate(date)}</p>
            {validUntil && <p>有效期至：{formatDate(validUntil)}</p>}
          </div>
        </div>

        {/* 客户信息 */}
        <div className="mb-6 pb-4 border-b border-border">
          <p className="text-sm text-text-secondary mb-0.5">客户</p>
          <p className="text-sm font-semibold text-text">{clientName || '—'}</p>
          <p className="text-sm text-text-secondary mt-2">{projectName}</p>
        </div>

        {/* 明细表格 */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="text-left py-2.5 px-2 font-semibold text-text">
                服务项目
              </th>
              <th className="text-left py-2.5 px-2 font-semibold text-text">
                描述
              </th>
              <th className="text-right py-2.5 px-2 font-semibold text-text w-16">
                工时
              </th>
              <th className="text-right py-2.5 px-2 font-semibold text-text w-24">
                单价
              </th>
              <th className="text-right py-2.5 px-2 font-semibold text-text w-24">
                金额
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-border/60">
                <td className="py-2.5 px-2 text-text">{item.name}</td>
                <td className="py-2.5 px-2 text-text-secondary">
                  {item.description}
                </td>
                <td className="py-2.5 px-2 text-right text-text">
                  {item.hours}h
                </td>
                <td className="py-2.5 px-2 text-right text-text">
                  {formatCurrency(item.rate)}
                </td>
                <td className="py-2.5 px-2 text-right font-medium text-text">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 合计金额 */}
        <div className="flex justify-end mb-6">
          <div className="w-48 text-right">
            <div className="flex justify-between py-2 border-t-2 border-primary">
              <span className="text-sm font-semibold text-text">合计</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* 付款条件 */}
        {paymentTerms && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-text-secondary mb-1">
              付款条件
            </h3>
            <p className="text-sm text-text">{paymentTerms}</p>
          </div>
        )}

        {/* 备注 */}
        {notes && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-text-secondary mb-1">
              备注
            </h3>
            <p className="text-sm text-text text-text-secondary">{notes}</p>
          </div>
        )}

        {/* 底部声明 */}
        <div className="mt-8 pt-4 border-t border-border text-center">
          <p className="text-xs text-text-secondary">
            本报价单在有效期内有效，超过有效期需重新报价
          </p>
        </div>
      </div>
    </div>
  );
}
