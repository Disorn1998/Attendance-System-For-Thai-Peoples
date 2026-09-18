// src/config/swagger.js
// OpenAPI 3.0 specification configuration.
// All JSDoc comments on route files are picked up automatically.

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Attendance System API',
      version: '1.0.0',
      description: 'REST API สำหรับระบบเช็คชื่อพนักงาน',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server',
      },
      {
        url: 'https://your-domain.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token — ได้รับจาก POST /api/auth/login',
        },
      },
      schemas: {
        // Standard API response wrappers
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'เกิดข้อผิดพลาด' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Pick up JSDoc from all route files
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
