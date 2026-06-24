/**
 * AI 模拟路由
 *
 * - POST /api/ai/generate-quotation → 调用 quotationGenerator.generate()
 * - POST /api/ai/generate-contract  → 调用 contractGenerator.generate()
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { successResponse, errorResponse } from '../types.js';
import type { GenerateQuotationRequest, GenerateContractRequest } from '../types.js';
import { generateQuotation } from '../services/quotationGenerator.js';
import { generateContract } from '../services/contractGenerator.js';

const router = Router();

/** POST /api/ai/generate-quotation — AI 模拟生成报价 */
router.post('/generate-quotation', (req: Request, res: Response) => {
  try {
    const body = req.body as GenerateQuotationRequest;

    if (!body.profession) {
      res.status(400).json(errorResponse(400, '职业类型不能为空'));
      return;
    }

    const result = generateQuotation(body);
    res.json(successResponse(result));
  } catch (err) {
    console.error('POST /api/ai/generate-quotation error:', err);
    res.status(500).json(errorResponse(500, 'AI 生成报价失败'));
  }
});

/** POST /api/ai/generate-contract — AI 模拟生成合同 */
router.post('/generate-contract', (req: Request, res: Response) => {
  try {
    const body = req.body as GenerateContractRequest;

    if (!body.templateType) {
      res.status(400).json(errorResponse(400, '合同模板类型不能为空'));
      return;
    }

    if (!body.variables) {
      res.status(400).json(errorResponse(400, '合同变量不能为空'));
      return;
    }

    const result = generateContract(body);
    res.json(successResponse(result));
  } catch (err) {
    console.error('POST /api/ai/generate-contract error:', err);
    res.status(500).json(errorResponse(500, 'AI 生成合同失败'));
  }
});

export default router;
