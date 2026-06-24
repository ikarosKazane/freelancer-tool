/**
 * 合同模板路由
 *
 * - GET /api/templates       → 返回模板列表（名称+类型+摘要描述）
 * - GET /api/templates/:type → 返回指定类型的完整模板文本
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { successResponse, errorResponse } from '../types.js';
import type { ContractTemplateType } from '../types.js';
import { getContractTemplateList, getContractTemplate } from '../data/contractTemplates.js';

const router = Router();

const VALID_TEMPLATE_TYPES: ContractTemplateType[] = ['design', 'development', 'writing', 'consulting'];

/** GET /api/templates — 返回模板列表 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const templates = getContractTemplateList();
    res.json(successResponse(templates));
  } catch (err) {
    console.error('GET /api/templates error:', err);
    res.status(500).json(errorResponse(500, '获取模板列表失败'));
  }
});

/** GET /api/templates/:type — 返回指定类型的完整模板文本 */
router.get('/:type', (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContractTemplateType;

    if (!VALID_TEMPLATE_TYPES.includes(type)) {
      res.status(400).json(errorResponse(400, `无效的模板类型，支持: ${VALID_TEMPLATE_TYPES.join(', ')}`));
      return;
    }

    const template = getContractTemplate(type);

    if (!template) {
      res.status(404).json(errorResponse(404, '模板不存在'));
      return;
    }

    res.json(successResponse({
      type: template.type,
      name: template.name,
      summary: template.summary,
      content: template.content,
    }));
  } catch (err) {
    console.error('GET /api/templates/:type error:', err);
    res.status(500).json(errorResponse(500, '获取模板详情失败'));
  }
});

export default router;
