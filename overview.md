# 自由职业者报价+合同+收款一体化工具 — 开发完成

## 交付概述

| 项目 | 状态 |
|------|------|
| 开发状态 | ✅ 全部完成 |
| TypeScript 编译 | ✅ 前后端 0 错误 |
| Vite 生产构建 | ✅ 构建成功 |
| API 测试 | ✅ 全部端点通过 |
| 文件完整性 | ✅ 60+ 源文件齐全 |

## 技术栈

- **前端**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + React Router v6
- **后端**: Node.js + TypeScript + Express + SQLite (better-sqlite3)
- **状态管理**: Zustand 5
- **看板拖拽**: @dnd-kit/core + @dnd-kit/sortable
- **PDF 导出**: html2pdf.js
- **AI 模拟**: 基于行业模板的预设报价/合同生成

## 核心功能

1. **智能报价单** — 输入项目描述 → AI 模拟生成报价项列表 → 用户微调 → 预览 → 导出 PDF
2. **标准合同生成** — 4 种模板（设计/开发/撰稿/咨询）→ 填写变量 → AI 生成完整合同 → 预览/导出
3. **收款追踪** — 手动添加收款记录 → 追踪付款状态（pending/paid）→ 催款文案一键复制
4. **项目看板** — 5 列拖拽看板（草稿→已报价→已签约→已收款→已完成）
5. **仪表盘** — 数据统计（本月收入/进行中项目/收款率）+ 快捷操作
6. **个人中心** — 用户信息和品牌设置管理

## 启动方式

```bash
# 1. 安装依赖（如果未安装）
cd freelancer-tool/server && npm install
cd freelancer-tool/client && npm install

# 2. 同时启动前后端
cd freelancer-tool && npm run dev

# 或者分别启动：
cd freelancer-tool/server && npm run dev    # 后端 :3001
cd freelancer-tool/client && npm run dev    # 前端 :5173
```

## 项目结构

```
freelancer-tool/
├── client/src/
│   ├── pages/          (10 个页面)
│   ├── components/     (10 个共享组件)
│   ├── stores/         (5 个 Zustand store)
│   ├── data/           (模板数据)
│   ├── lib/            (API/PDF/格式化工具)
│   └── types/          (TypeScript 类型)
├── server/src/
│   ├── routes/         (7 个路由模块)
│   ├── services/       (报价/合同生成器)
│   ├── data/           (合同/报价模板数据)
│   ├── db.ts           (SQLite 初始化)
│   └── types.ts        (类型 + 转换工具)
└── docs/
    ├── PRD.md
    └── ARCHITECTURE.md
```

## 已知限制（MVP 范围）

- 用户系统：无注册/登录，默认单用户
- 支付：模拟手动标记，未对接真实支付
- AI：模板匹配模拟，未对接真实 LLM
- 合同模板：硬编码在代码中，不支持动态管理
- 分享链接：仅支持 PDF 导出，无在线分享
