// src/utils/ip.js
// Extract the real client IP address from the request.
// When behind Nginx reverse proxy, the real IP is in X-Forwarded-For header.
// app.set('trust proxy', 1) must be enabled for req.ip to work correctly.

/**
 * Get the client's real IP address.
 * Handles IPv4-mapped IPv6 addresses (::ffff:127.0.0.1 → 127.0.0.1)
 * @param {import('express').Request} req
 * @returns {string}
 */
export const getClientIp = (req) => {
  // With trust proxy enabled, req.ip contains the real client IP
  const ip = req.ip || req.socket?.remoteAddress || '0.0.0.0';

  // Normalize IPv4-mapped IPv6 addresses
  // ::ffff:192.168.1.1 → 192.168.1.1
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  return ip;
};
