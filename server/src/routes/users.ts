/**
 * 用户路由
 *
 * - GET   /api/user        → 获取当前用户（id=1）
 * - PATCH /api/user        → 更新用户信息
 * - GET   /api/user/stats  → 获取用户统计数据
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../db.js';
import { successResponse, errorResponse, toCamelCase, toSnakeCase } from '../types.js';
import type { DbUser, DbProject, DbPayment, UserStats } from '../types.js';

const router = Router();

/** GET /api/user — 返回 id=1 的用户 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = 1').get() as DbUser | undefined;
    if (!user) {
      res.status(404).json(errorResponse(404, '用户不存在'));
      return;
    }
    res.json(successResponse(toCamelCase(user)));
  } catch (err) {
    console.error('GET /api/user error:', err);
    res.status(500).json(errorResponse(500, '获取用户信息失败'));
  }
});

/** PATCH /api/user — 更新用户信息 */
router.patch('/', (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const snakeData = toSnakeCase<Record<string, unknown>>(body);

    const allowedFields = [
      'name', 'email', 'phone', 'avatar_url', 'profession',
      'brand_name', 'brand_logo_url', 'brand_address',
    ];

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (snakeData[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(snakeData[field]);
      }
    }

    if (setClauses.length === 0) {
      res.status(400).json(errorResponse(400, '没有可更新的字段'));
      return;
    }

    setClauses.push("updated_at = datetime('now')");
    values.push(1);

    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM users WHERE id = 1').get() as DbUser;
    res.json(successResponse(toCamelCase(updated)));
  } catch (err) {
    console.error('PATCH /api/user error:', err);
    res.status(500).json(errorResponse(500, '更新用户信息失败'));
  }
});

/** GET /api/user/stats — 聚合查询用户统计数据 */
router.get('/stats', (_req: Request, res: Response) => {
  try {
    // totalProjects: 项目总数
    const totalProjectsRow = db.prepare(
      'SELECT COUNT(*) as count FROM projects WHERE user_id = 1',
    ).get() as { count: number };
    const totalProjects = totalProjectsRow.count;

    // monthlyProjects: 本月新增项目数
    const monthlyProjectsRow = db.prepare(`
      SELECT COUNT(*) as count FROM projects
      WHERE user_id = 1 AND created_at >= date('now', 'start of month')
    `).get() as { count: number };
    const monthlyProjects = monthlyProjectsRow.count;

    // totalIncome: 总收入（已付收款合计）
    const totalIncomeRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments WHERE user_id = 1 AND status = 'paid'
    `).get() as { total: number };
    const totalIncome = totalIncomeRow.total;

    // monthlyIncome: 本月收入（已付且 payment_date 在本月）
    const monthlyIncomeRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE user_id = 1 AND status = 'paid'
        AND payment_date >= date('now', 'start of month')
    `).get() as { total: number };
    const monthlyIncome = monthlyIncomeRow.total;

    // pendingAmount: 待收金额（未付收款合计）
    const pendingAmountRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments WHERE user_id = 1 AND status = 'pending'
    `).get() as { total: number };
    const pendingAmount = pendingAmountRow.total;

    // monthlyTrend: 近 6 个月每月的已付金额
    const monthlyTrendRows = db.prepare(`
      SELECT strftime('%Y-%m', payment_date) as month, COALESCE(SUM(amount), 0) as income
      FROM payments
      WHERE user_id = 1 AND status = 'paid'
        AND payment_date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', payment_date)
      ORDER BY month ASC
    `).all() as { month: string; income: number }[];

    const monthlyTrend = monthlyTrendRows.map((row) => ({
      month: row.month,
      income: row.income,
    }));

    const stats: UserStats = {
      totalProjects,
      monthlyProjects,
      totalIncome,
      monthlyIncome,
      pendingAmount,
      monthlyTrend,
    };

    res.json(successResponse(stats));
  } catch (err) {
    console.error('GET /api/user/stats error:', err);
    res.status(500).json(errorResponse(500, '获取用户统计数据失败'));
  }
});

export default router;
