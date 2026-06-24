/**
 * 项目 CRUD 路由
 *
 * - POST   /api/projects       → 创建项目
 * - GET    /api/projects       → 获取项目列表（支持 ?status= 过滤）
 * - GET    /api/projects/:id   → 获取项目详情
 * - PATCH  /api/projects/:id   → 更新项目
 * - DELETE /api/projects/:id   → 删除项目
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../db.js';
import { successResponse, errorResponse, toCamelCase, toSnakeCase } from '../types.js';
import type { DbProject, CreateProjectRequest, UpdateProjectRequest } from '../types.js';

const router = Router();

/** POST /api/projects — 创建项目 */
router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateProjectRequest;

    if (!body.name || typeof body.name !== 'string') {
      res.status(400).json(errorResponse(400, '项目名称不能为空'));
      return;
    }

    const snakeData = toSnakeCase<Record<string, unknown>>(body);

    const result = db.prepare(`
      INSERT INTO projects (user_id, name, client_name, client_contact, description, budget)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(
      body.name,
      snakeData.client_name ?? '',
      snakeData.client_contact ?? '',
      snakeData.description ?? '',
      snakeData.budget ?? 0,
    );

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid) as DbProject;
    res.json(successResponse(toCamelCase(newProject)));
  } catch (err) {
    console.error('POST /api/projects error:', err);
    res.status(500).json(errorResponse(500, '创建项目失败'));
  }
});

/** GET /api/projects — 获取项目列表 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let projects: DbProject[];
    if (status && typeof status === 'string') {
      projects = db.prepare(
        'SELECT * FROM projects WHERE user_id = 1 AND status = ? ORDER BY updated_at DESC',
      ).all(status) as DbProject[];
    } else {
      projects = db.prepare(
        'SELECT * FROM projects WHERE user_id = 1 ORDER BY updated_at DESC',
      ).all() as DbProject[];
    }

    res.json(successResponse(projects.map((p) => toCamelCase(p))));
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json(errorResponse(500, '获取项目列表失败'));
  }
});

/** GET /api/projects/:id — 获取项目详情 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = 1').get(id) as DbProject | undefined;
    if (!project) {
      res.status(404).json(errorResponse(404, '项目不存在'));
      return;
    }

    res.json(successResponse(toCamelCase(project)));
  } catch (err) {
    console.error('GET /api/projects/:id error:', err);
    res.status(500).json(errorResponse(500, '获取项目详情失败'));
  }
});

/** PATCH /api/projects/:id — 更新项目 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const existing = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = 1').get(id) as DbProject | undefined;
    if (!existing) {
      res.status(404).json(errorResponse(404, '项目不存在'));
      return;
    }

    const body = req.body as UpdateProjectRequest;
    const snakeData = toSnakeCase<Record<string, unknown>>(body);

    // 构建动态 SET 子句
    const allowedFields = ['name', 'client_name', 'client_contact', 'description', 'budget', 'status'];
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

    // 自动更新 updated_at
    setClauses.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE projects SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as DbProject;
    res.json(successResponse(toCamelCase(updated)));
  } catch (err) {
    console.error('PATCH /api/projects/:id error:', err);
    res.status(500).json(errorResponse(500, '更新项目失败'));
  }
});

/** DELETE /api/projects/:id — 删除项目 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的项目 ID'));
      return;
    }

    const existing = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = 1').get(id) as DbProject | undefined;
    if (!existing) {
      res.status(404).json(errorResponse(404, '项目不存在'));
      return;
    }

    // 级联删除由数据库 ON DELETE CASCADE 处理
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    res.json(successResponse(null));
  } catch (err) {
    console.error('DELETE /api/projects/:id error:', err);
    res.status(500).json(errorResponse(500, '删除项目失败'));
  }
});

export default router;
