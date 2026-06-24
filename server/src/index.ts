/**
 * Express 应用入口
 *
 * - 创建 Express app
 * - 注册 cors()、express.json() 中间件
 * - 挂载所有 7 个路由模块
 * - 统一错误处理中间件
 * - 监听端口 3001
 * - 在启动时调用 db.ts 确保数据库初始化
 */

import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

// 导入 db 确保数据库初始化
import './db.js';

// 导入路由
import projectsRouter from './routes/projects.js';
import quotationsRouter from './routes/quotations.js';
import contractsRouter from './routes/contracts.js';
import paymentsRouter from './routes/payments.js';
import usersRouter from './routes/users.js';
import aiRouter from './routes/ai.js';
import templatesRouter from './routes/templates.js';

const app = express();
const PORT = 3001;

// ===== 中间件 =====
app.use(cors());

// 确保请求体按 UTF-8 解析（Windows 环境下 Git Bash 可能发送 GBK 编码）
app.use((req, _res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('json')) {
    if (!req.headers['content-type'].includes('charset')) {
      req.headers['content-type'] = req.headers['content-type'] + '; charset=utf-8';
    }
  }
  next();
});
app.use(express.json());

// 确保所有响应使用 UTF-8
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ===== 路由挂载 =====
app.use('/api/projects', projectsRouter);
app.use('/api/projects', quotationsRouter);
app.use('/api/projects', contractsRouter);
app.use('/api/projects', paymentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/user', usersRouter);
app.use('/api/ai', aiRouter);
app.use('/api/templates', templatesRouter);

// ===== 健康检查 =====
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ code: 0, data: { status: 'ok' }, message: 'Server is running' });
});

// ===== 统一错误处理中间件 =====
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    code: 500,
    data: null,
    message: err.message || '服务器内部错误',
  });
});

// ===== 启动服务器 =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
