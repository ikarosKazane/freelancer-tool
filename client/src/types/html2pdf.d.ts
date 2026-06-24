/**
 * html2pdf.js 类型声明
 *
 * html2pdf.js 没有官方 TypeScript 声明，此处提供最小化类型定义
 * 以支持静态 import 和 TypeScript 编译。
 */
declare module 'html2pdf.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf: any;
  export default html2pdf;
}
