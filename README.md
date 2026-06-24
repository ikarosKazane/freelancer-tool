# Freelancer Tool — 自由职业者一体化工作台

智能报价 → 标准合同 → 收款追踪，全链路轻量管理工具。

## 功能特性

- **智能报价单** — 输入项目描述，AI 模拟生成报价项列表，支持编辑微调、预览、导出 PDF
- **标准合同生成** — 4 种行业模板（设计/开发/撰稿/咨询），填写变量后生成完整合同
- **收款追踪** — 添加收款记录、追踪付款状态、逾期提醒、一键生成催款文案
- **项目管理** — 状态标签筛选 + 列表视图，快速切换项目状态
- **仪表盘** — 本月收入、进行中项目数、收款率统计
- **个人中心** — 用户信息和品牌设置管理
- **合同模板库** — 浏览 4 种合同模板，预览完整条款

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式方案 | Tailwind CSS 4 |
| 路由 | React Router v6 |
| 状态管理 | Zustand 5 |
| 看板拖拽 | ~~@dnd-kit~~ (已改为列表视图) |
| PDF 导出 | 浏览器原生 window.print() |
| 后端框架 | Express + TypeScript |
| 数据库 | SQLite (better-sqlite3) |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
cd freelancer-tool

# 后端依赖
cd server && npm install && cd ..

# 前端依赖
cd client && npm install && cd ..
```

### 启动开发服务器

```bash
# 同时启动前后端
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001

### 分别启动（可选）

```bash
# 仅后端
cd server && npm run dev

# 仅前端
cd client && npm run dev
```

### 生产构建

```bash
cd client && npm run build
```

构建产物在 `client/dist/` 目录，可通过 Express 静态服务部署。

## 项目结构

```
freelancer-tool/
├── client/                          # React 前端
│   ├── src/
│   │   ├── App.tsx                  # 路由配置
│   │   ├── main.tsx                 # 入口文件
│   │   ├── components/              # 共享组件
│   │   │   ├── Layout.tsx           # 全局布局（侧边栏+导航）
│   │   │   ├── ProjectCard.tsx      # 项目卡片（状态切换下拉）
│   │   │   ├── QuotationForm.tsx    # 报价项编辑表单
│   │   │   ├── QuotationPreview.tsx # 报价单预览 + PDF 导出
│   │   │   ├── ContractForm.tsx     # 合同变量填写表单
│   │   │   ├── ContractPreview.tsx  # 合同预览（变量高亮）
│   │   │   ├── PaymentTracker.tsx   # 收款追踪面板
│   │   │   ├── StatusBadge.tsx      # 状态标签
│   │   │   └── EmptyState.tsx       # 空状态引导
│   │   ├── pages/                   # 页面组件
│   │   │   ├── Landing.tsx          # 首页
│   │   │   ├── Dashboard.tsx        # 仪表盘
│   │   │   ├── ProjectBoard.tsx     # 项目列表（标签筛选）
│   │   │   ├── ProjectNew.tsx       # 新建项目
│   │   │   ├── ProjectDetail.tsx    # 项目详情
│   │   │   ├── QuotationPage.tsx    # 报价生成（三步向导）
│   │   │   ├── ContractPage.tsx     # 合同生成（三步向导）
│   │   │   ├── PaymentPage.tsx      # 收款管理
│   │   │   ├── TemplateLibrary.tsx  # 合同模板库
│   │   │   └── Profile.tsx          # 个人中心
│   │   ├── stores/                  # Zustand 状态管理
│   │   ├── lib/                     # 工具函数（API/PDF/格式化）
│   │   ├── types/                   # TypeScript 类型定义
│   │   └── data/                    # 前端模板数据
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                          # Node.js 后端
│   ├── src/
│   │   ├── index.ts                 # Express 入口
│   │   ├── db.ts                    # SQLite 初始化
│   │   ├── routes/                  # API 路由（7个模块）
│   │   ├── services/                # 报价/合同生成服务
│   │   ├── data/                    # 合同/报价模板数据
│   │   └── types.ts                 # 类型 + 数据转换工具
│   └── package.json
└── docs/                            # 设计文档
    ├── PRD.md                       # 产品需求文档
    └── ARCHITECTURE.md              # 系统架构设计
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/projects | 创建项目 |
| GET | /api/projects | 获取项目列表 |
| GET | /api/projects/:id | 获取项目详情 |
| PATCH | /api/projects/:id | 更新项目 |
| POST | /api/projects/:id/quotation | 创建报价单 |
| POST | /api/projects/:id/contract | 创建合同 |
| POST | /api/projects/:id/payment | 创建收款记录 |
| PATCH | /api/payments/:id | 更新收款状态 |
| POST | /api/ai/generate-quotation | AI 生成报价（模拟） |
| POST | /api/ai/generate-contract | AI 生成合同（模拟） |
| GET | /api/templates | 合同模板列表 |
| GET | /api/user | 获取用户信息 |
| GET | /api/user/stats | 用户统计数据 |

## MVP 说明

当前为 MVP 版本，以下功能已简化或暂未实现：

- **用户系统** — 无注册/登录，默认单用户（id=1）
- **AI 生成** — 基于模板的模拟生成，未对接真实 LLM API
- **支付** — 手动标记已付/未付，未对接微信支付/支付宝
- **合同签署** — 无电子签章集成
- **在线分享** — 仅支持 PDF 导出，无在线分享链接

## 后续迭代方向

- [ ] 微信小程序版本
- [ ] 对接真实 AI（通义千问/Claude API）
- [ ] 微信支付/支付宝集成
- [ ] 电子签章（法大大/上上签）
- [ ] 发票管理
- [ ] 客户 CRM
- [ ] 多用户支持

## License

MIT
