// src/middlewares/checkWifi.js
// Company WiFi enforcement middleware.
// Checks the client's IP against the CompanyWifiWhitelist table.
// If the IP is not whitelisted, the request is rejected with a 403.
//
// IMPORTANT: This requires app.set('trust proxy', 1) to be configured
// so that req.ip reads from X-Forwarded-For header (set by Nginx).
//
// IP Normalization:
// - ::ffff:127.0.0.1 (IPv4-mapped IPv6) is normalized to 127.0.0.1
// - This ensures whitelist entries in simple IPv4 format work correctly.

import { prisma } from '../config/database.js';
import { getClientIp } from '../utils/ip.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware: Verify that the request originates from a whitelisted company WiFi IP.
 * Attach the detected IP to req.clientIp for downstream use.
 */
export const checkCompanyWifi = async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    req.clientIp = clientIp; // Attach for controllers to use (stored in attendance record)

    // Check against whitelist (case-insensitive for IPv6 edge cases)
    const entry = await prisma.companyWifiWhitelist.findFirst({
      where: {
        ipAddress: clientIp,
      },
    });

    if (!entry) {
      logger.warn(
        { ip: clientIp, requestId: req.id, userId: req.user?.id },
        'Check-in attempt from non-whitelisted IP'
      );
      return res.status(403).json({
        success: false,
        message: `ไม่ได้เชื่อมต่อ WiFi บริษัท ไม่สามารถเช็คอินได้ (IP: ${clientIp})`,
        code: 'WIFI_NOT_ALLOWED',
      });
    }

    logger.info(
      { ip: clientIp, wifiDescription: entry.description, userId: req.user?.id },
      'WiFi check passed'
    );
    next();
  } catch (err) {
    next(err);
  }
};
