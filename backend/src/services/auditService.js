// src/services/auditService.js
// Utility to record audit logs for critical actions.

import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Log an action to the AuditLog table.
 * @param {object} params
 * @param {number} params.userId - Employee ID who performed the action
 * @param {string} params.action - CREATE, UPDATE, DELETE, etc.
 * @param {string} params.entity - Entity name (e.g., Employee, WorkShift)
 * @param {number} [params.entityId] - Target entity ID
 * @param {object} [params.details] - JSON containing { before, after } or other details
 * @param {string} [params.ipAddress] - Client IP address
 */
export const logAction = async ({ userId, action, entity, entityId, details, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details || {},
        ipAddress,
      },
    });
  } catch (err) {
    // We don't want an audit log failure to break the main transaction,
    // so we just log the error to our system logger.
    logger.error(
      { error: err.message, userId, action, entity, entityId },
      'Failed to record audit log'
    );
  }
};
