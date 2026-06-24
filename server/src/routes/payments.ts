/**
 * 收款路由
 *
 * - POST   /api/projects/:projectId/payment  → 创建收款记录
 * - GET    /api/projects/:projectId/payments → 获取项目收款记录
 * - PATCH  /api/payments/:id                 → 更新收款状态
 * - DELETE /api/payments/:id                 → 删除收款记录
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../db.js';
import { successResponse, errorResponse, toCamelCase } from '../types.js';
import type { DbPayment, CreatePaymentRequest, PaymentStatus } from '../types.js';

const router = Router();

/** POST /api/projects/:projectId/payment — 创建收款记录 */
router.post('/:projectId/payment', (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = 1').get(projectId);
    if (!project) {
      res.status(404).json(errorResponse(404, '项目不存在'));
      return;
    }

    const body = req.body as CreatePaymentRequest;

    if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
      res.status(400).json(errorResponse(400, '收款金额必须大于 0'));
      return;
    }

    const result = db.prepare(`
      INSERT INTO payments (project_id, user_id, amount, payment_date, due_date, note)
      VALUES (?, 1, ?, ?, ?, ?)
    `).run(
      projectId,
      body.amount,
      body.paymentDate || null,
      body.dueDate || null,
      body.note || '',
    );

    const newPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid) as DbPayment;
    res.json(successResponse(toCamelCase(newPayment)));
  } catch (err) {
    console.error('POST /api/projects/:projectId/payment error:', err);
    res.status(500).json(errorResponse(500, '创建收款记录失败'));
  }
});

/** GET /api/projects/:projectId/payments — 获取项目收款记录 */
router.get('/:projectId/payments', (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const payments = db.prepare(
      'SELECT * FROM payments WHERE project_id = ? AND user_id = 1 ORDER BY created_at DESC',
    ).all(projectId) as DbPayment[];

    res.json(successResponse(payments.map((p) => toCamelCase(p))));
  } catch (err) {
    console.error('GET /api/projects/:projectId/payments error:', err);
    res.status(500).json(errorResponse(500, '获取收款记录失败'));
  }
});

/** PATCH /api/payments/:id — 更新收款状态 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的收款 ID'));
      return;
    }

    const existing = db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = 1').get(id) as DbPayment | undefined;
    if (!existing) {
      res.status(404).json(errorResponse(404, '收款记录不存在'));
      return;
    }

    const { status } = req.body as { status: PaymentStatus };
    if (!status || !['pending', 'paid'].includes(status)) {
      res.status(400).json(errorResponse(400, '无效的收款状态'));
      return;
    }

    // 更新收款状态
    const paidAtClause = status === 'paid' ? ", payment_date = COALESCE(payment_date, date('now'))" : '';
    db.prepare(
      `UPDATE payments SET status = ?, updated_at = datetime('now')${paidAtClause} WHERE id = ?`,
    ).run(status, id);

    // 若所有付款已付则自动更新项目状态为 'paid'
    if (status === 'paid') {
      const projectId = existing.project_id;

      // 查询该项目下所有收款记录
      const allPayments = db.prepare(
        'SELECT * FROM payments WHERE project_id = ?',
      ).all(projectId) as DbPayment[];

      // 检查是否所有记录都已付款
      const allPaid = allPayments.length > 0 && allPayments.every(
        (p) => (p.id === id) ? status === 'paid' : p.status === 'paid',
      );

      if (allPaid) {
        db.prepare(
          "UPDATE projects SET status = 'paid', updated_at = datetime('now') WHERE id = ?",
        ).run(projectId);
      }
    }

    const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as DbPayment;
    res.json(successResponse(toCamelCase(updated)));
  } catch (err) {
    console.error('PATCH /api/payments/:id error:', err);
    res.status(500).json(errorResponse(500, '更新收款状态失败'));
  }
});

/** DELETE /api/payments/:id — 删除收款记录 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的收款 ID'));
      return;
    }

    const existing = db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = 1').get(id) as DbPayment | undefined;
    if (!existing) {
      res.status(404).json(errorResponse(404, '收款记录不存在'));
      return;
    }

    db.prepare('DELETE FROM payments WHERE id = ?').run(id);
    res.json(successResponse(null));
  } catch (err) {
    console.error('DELETE /api/payments/:id error:', err);
    res.status(500).json(errorResponse(500, '删除收款记录失败'));
  }
});

export default router;
