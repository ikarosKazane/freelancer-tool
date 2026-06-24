/**
 * 报价单路由
 *
 * - POST /api/projects/:projectId/quotation   → 创建报价单
 * - GET  /api/projects/:projectId/quotations  → 获取项目报价单列表
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../db.js';
import { successResponse, errorResponse, toCamelCase } from '../types.js';
import type { DbQuotation, CreateQuotationRequest, QuotationItem } from '../types.js';

const router = Router();

/** POST /api/projects/:projectId/quotation — 创建报价单 */
router.post('/:projectId/quotation', (req: Request, res: Response) => {
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

    const body = req.body as CreateQuotationRequest;
    const items: QuotationItem[] = body.items || [];
    const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    // items 序列化为 JSON 存入 items_json
    const result = db.prepare(`
      INSERT INTO quotations (project_id, user_id, items_json, total_amount, valid_until, payment_terms, notes)
      VALUES (?, 1, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      JSON.stringify(items),
      totalAmount,
      body.validUntil || null,
      body.paymentTerms || '',
      body.notes || '',
    );

    // 同时更新项目状态为 'quoted'
    db.prepare("UPDATE projects SET status = 'quoted', updated_at = datetime('now') WHERE id = ?").run(projectId);

    const newQuotation = db.prepare('SELECT * FROM quotations WHERE id = ?').get(result.lastInsertRowid) as DbQuotation;

    // 解析 items_json 为 JSON 数组
    const responseQuotation = {
      ...toCamelCase<Record<string, unknown>>(newQuotation),
      items: JSON.parse(newQuotation.items_json),
      totalAmount: newQuotation.total_amount,
    };

    res.json(successResponse(responseQuotation));
  } catch (err) {
    console.error('POST /api/projects/:projectId/quotation error:', err);
    res.status(500).json(errorResponse(500, '创建报价单失败'));
  }
});

/** GET /api/projects/:projectId/quotations — 获取项目报价单列表 */
router.get('/:projectId/quotations', (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const quotations = db.prepare(
      'SELECT * FROM quotations WHERE project_id = ? AND user_id = 1 ORDER BY created_at DESC',
    ).all(projectId) as DbQuotation[];

    const result = quotations.map((q) => ({
      ...toCamelCase<Record<string, unknown>>(q),
      items: JSON.parse(q.items_json),
      totalAmount: q.total_amount,
    }));

    res.json(successResponse(result));
  } catch (err) {
    console.error('GET /api/projects/:projectId/quotations error:', err);
    res.status(500).json(errorResponse(500, '获取报价单列表失败'));
  }
});

export default router;
