import { useRef, useState } from 'react';
import type { ContractVariables } from '@/types';
import { exportToPdf } from '@/lib/pdf';

/**
 * 合同预览组件
 *
 * A4 排版预览容器，渲染合同全文并将变量替换后的值用蓝色 <mark> 高亮。
 * 提供 ref 用于 PDF 导出，包含「导出 PDF」按钮。
 */

interface ContractPreviewProps {
  /** 合同全文内容（已替换变量后的文本） */
  content: string;
  /** 变量对象（用于高亮匹配） */
  variables: ContractVariables;
  /** 项目名称（用于导出文件名） */
  projectName?: string;
}

/**
 * 渲染合同内容，将变量值用 <mark> 高亮
 * 逐段处理文本，对每行中的变量值做正则匹配和高亮替换
 */
function renderHighlightedContent(
  content: string,
  variables: ContractVariables,
): React.ReactNode[] {
  // 收集所有需要高亮的变量值（过滤空值和数字 0）
  const highlightValues: string[] = [];
  const varEntries = Object.entries(variables);

  for (const [, value] of varEntries) {
    if (typeof value === 'string' && value.trim().length > 0) {
      highlightValues.push(value.trim());
    } else if (typeof value === 'number' && value > 0) {
      highlightValues.push(String(value));
    }
  }

  // 按长度降序排序，优先匹配更长的值（避免子串被先匹配）
  highlightValues.sort((a, b) => b.length - a.length);

  if (highlightValues.length === 0) {
    return content.split('\n').map((line, i) => (
      <p key={i} className="mb-1 leading-relaxed">
        {line || <br />}
      </p>
    ));
  }

  // 构造正则（转义特殊字符）
  const escapedValues = highlightValues.map((v) =>
    v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const regex = new RegExp(`(${escapedValues.join('|')})`, 'g');

  return content.split('\n').map((line, lineIdx) => {
    if (!line.trim()) {
      return <br key={lineIdx} />;
    }

    const parts = line.split(regex);
    return (
      <p key={lineIdx} className="mb-1 leading-relaxed">
        {parts.map((part, partIdx) =>
          highlightValues.includes(part.trim()) ? (
            <mark
              key={partIdx}
              className="bg-blue-100 text-blue-800 px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={partIdx}>{part}</span>
          ),
        )}
      </p>
    );
  });
}

export default function ContractPreview({
  content,
  variables,
  projectName = '合同',
}: ContractPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  /** 导出为 PDF（带错误处理） */
  const handleExportPdf = async () => {
    if (!previewRef.current) return;
    setPdfError(null);
    setExporting(true);
    try {
      const filename = `合同-${projectName}-${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportToPdf(previewRef.current, filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[ContractPreview] PDF 导出失败:', err);
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
        {/* 合同标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-1">合同</h1>
          <div className="w-16 h-0.5 bg-primary mx-auto" />
        </div>

        {/* 合同正文（高亮变量值） */}
        <div className="text-sm text-text whitespace-pre-wrap">
          {renderHighlightedContent(content, variables)}
        </div>
      </div>
    </div>
  );
}
