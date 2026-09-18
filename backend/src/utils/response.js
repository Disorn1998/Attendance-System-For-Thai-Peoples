// src/utils/response.js
// Standardized API response helpers.
// All controllers must use these helpers to ensure consistent response format.

/**
 * Send a successful response
 * @param {import('express').Response} res
 * @param {*} data - Response payload
 * @param {number} [statusCode=200]
 * @param {object} [pagination] - Pagination metadata
 */
export const sendSuccess = (res, data, statusCode = 200, pagination = undefined) => {
  const body = { success: true, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
};

/**
 * Send an error response
 * @param {import('express').Response} res
 * @param {string} message - Human-readable error message (Thai for client-facing)
 * @param {number} [statusCode=500]
 * @param {string} [code='INTERNAL_ERROR'] - Machine-readable error code
 * @param {*} [details] - Additional error details (dev only)
 */
export const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) => {
  const body = { success: false, message, code };
  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }
  return res.status(statusCode).json(body);
};

/**
 * Build pagination metadata object
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {{ page: number, limit: number, total: number, totalPages: number }}
 */
export const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

/**
 * Parse and validate pagination query parameters
 * @param {object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
