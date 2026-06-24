/**
 * PDF 导出封装（纯原生方案，零依赖）
 *
 * 原理：创建隐藏 iframe → 注入目标 HTML + 内联样式 → iframe.print()
 * 用户在打印对话框中选择「另存为 PDF」即可下载。
 */

/**
 * 提取页面中所有可用的 CSS 规则（仅同源样式表）
 */
function collectPageStyles(): string {
  let css = '';
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        // 跳过跨域样式表（如 CDN）
        if (sheet.href && !sheet.href.startsWith(location.origin)) continue;
        for (const rule of Array.from(sheet.cssRules)) {
          css += rule.cssText + '\n';
        }
      } catch {
        // 跨域 sheet 访问 cssRules 会抛 SecurityError，跳过
      }
    }
  } catch {
    // 兜底：不注入任何样式
  }
  return css;
}

/**
 * 将指定 DOM 元素导出为 PDF
 *
 * @param element - 要导出的 HTML 元素
 * @param filename - 输出文件名（显示在打印对话框标题中）
 */
export async function exportToPdf(element: HTMLElement, filename: string): Promise<void> {
  console.log('[pdf] Starting export:', filename);

  // 1. 收集当前页面的 CSS（Tailwind 编译后的样式）
  const pageCSS = collectPageStyles();
  console.log('[pdf] Collected', pageCSS.length, 'chars of CSS');

  // 2. 克隆目标元素并清理不适合打印的样式
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.minHeight = 'auto';
  clone.style.maxWidth = '100%';
  clone.style.margin = '0';

  // 3. 创建隐藏 iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const iDoc = iframe.contentDocument;
  if (!iDoc) {
    document.body.removeChild(iframe);
    throw new Error('无法创建打印窗口');
  }

  // 4. 写入完整 HTML 文档
  const printTitle = filename.replace(/\.pdf$/i, '');
  iDoc.open();
  iDoc.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${printTitle}</title>
<style>
${pageCSS}
</style>
<style>
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #1f2937;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 12px; }
  mark { background: #dbeafe; color: #2563eb; padding: 1px 4px; border-radius: 2px; }
</style>
</head>
<body>${clone.outerHTML}</body>
</html>`);
  iDoc.close();

  // 5. 等待 iframe 内容渲染完成
  await new Promise<void>(resolve => {
    const check = () => {
      try {
        if (iDoc.readyState === 'complete') {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      } catch {
        resolve();
      }
    };
    setTimeout(check, 200);
  });

  // 额外等待确保图片等加载
  await new Promise(resolve => setTimeout(resolve, 300));

  // 6. 调用 iframe 的打印功能
  console.log('[pdf] Triggering print...');
  try {
    const iWin = iframe.contentWindow;
    if (iWin && typeof iWin.print === 'function') {
      iWin.focus();
      iWin.print();
    } else if (typeof window.print === 'function') {
      // 降级：打印主窗口（通过 CSS 隐藏非目标内容）
      window.print();
    } else {
      throw new Error('当前浏览器不支持打印功能');
    }
  } catch (err) {
    console.warn('[pdf] iframe.print() failed, falling back to window.print():', err);
    try {
      window.print();
    } catch {
      throw new Error('打印功能被浏览器阻止，请尝试在新窗口中打开页面后导出');
    }
  }

  // 7. 延迟清理 iframe（等打印对话框关闭）
  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch { /* already removed */ }
    console.log('[pdf] Export complete');
  }, 2000);
}
