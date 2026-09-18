// src/utils/password.js
// bcrypt password hashing utilities.
// salt rounds come from environment variable (default 12).

import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

/**
 * Hash a plaintext password
 * @param {string} password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

/**
 * Compare plaintext password with hash
 * @param {string} password - Plaintext password
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Validate password policy:
 * - Minimum 8 characters
 * - At least one letter
 * - At least one number
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export const validatePasswordPolicy = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
  }
  return { valid: true };
};
