/**
 * 合同路由
 *
 * - POST /api/projects/:projectId/contract   → 创建合同
 * - GET  /api/projects/:projectId/contracts  → 获取项目合同列表
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../db.js';
import { successResponse, errorResponse, toCamelCase } from '../types.js';
import type { DbContract, CreateContractRequest, ContractVariables } from '../types.js';

const router = Router();

/** POST /api/projects/:projectId/contract — 创建合同 */
router.post('/:projectId/contract', (req: Request, res: Response) => {
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

    const body = req.body as CreateContractRequest;
    const variables: ContractVariables = body.variables;

    // variables 序列化为 JSON
    const result = db.prepare(`
      INSERT INTO contracts (project_id, user_id, template_type, variables_json, content)
      VALUES (?, 1, ?, ?, ?)
    `).run(
      projectId,
      body.templateType,
      JSON.stringify(variables),
      '', // content 初始为空，后续可由 AI 生成填充
    );

    // 同时更新项目状态为 'signed'
    db.prepare("UPDATE projects SET status = 'signed', updated_at = datetime('now') WHERE id = ?").run(projectId);

    const newContract = db.prepare('SELECT * FROM contracts WHERE id = ?').get(result.lastInsertRowid) as DbContract;

    const responseContract = {
      ...toCamelCase<Record<string, unknown>>(newContract),
      variables: JSON.parse(newContract.variables_json),
    };

    res.json(successResponse(responseContract));
  } catch (err) {
    console.error('POST /api/projects/:projectId/contract error:', err);
    res.status(500).json(errorResponse(500, '创建合同失败'));
  }
});

/** GET /api/projects/:projectId/contracts — 获取项目合同列表 */
router.get('/:projectId/contracts', (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const contracts = db.prepare(
      'SELECT * FROM contracts WHERE project_id = ? AND user_id = 1 ORDER BY created_at DESC',
    ).all(projectId) as DbContract[];

    const result = contracts.map((c) => ({
      ...toCamelCase<Record<string, unknown>>(c),
      variables: JSON.parse(c.variables_json),
    }));

    res.json(successResponse(result));
  } catch (err) {
    console.error('GET /api/projects/:projectId/contracts error:', err);
    res.status(500).json(errorResponse(500, '获取合同列表失败'));
  }
});

export default router;
