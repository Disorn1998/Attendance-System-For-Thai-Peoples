// src/middlewares/authorize.js
// Role-based access control middleware.
// Must be used AFTER authenticateJWT (requires req.user to be set).

/**
 * Middleware factory: restrict route to specific roles.
 * @param {string[]} roles - Allowed roles e.g. ['ADMIN']
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/employees', authenticateJWT, authorizeRole(['ADMIN']), createEmployee)
 */
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        code: 'UNAUTHORIZED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
};
