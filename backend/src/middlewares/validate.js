// src/middlewares/validate.js
// Zod validation middleware factory.
// Validates request body, query parameters, and route params.
// Returns 400 with field-level error details on validation failure.

import { ZodError } from 'zod';

/**
 * @typedef {'body' | 'query' | 'params'} ValidateTarget
 */

/**
 * Create a validation middleware for a given Zod schema and target
 * @param {import('zod').ZodSchema} schema
 * @param {ValidateTarget} [target='body']
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace with parsed/transformed values (strips unknown fields)
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
          code: 'VALIDATION_ERROR',
          errors,
        });
      }
      next(err);
    }
  };
};
