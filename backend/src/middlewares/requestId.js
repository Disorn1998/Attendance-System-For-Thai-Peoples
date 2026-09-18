// src/middlewares/requestId.js
// Assigns a unique ID to every incoming request.
// The ID is attached to req.id and sent back as X-Request-ID response header.
// This allows tracing a specific request through logs.

import { v4 as uuidv4 } from 'uuid';

export const requestId = (req, res, next) => {
  // Use client-provided ID if present, otherwise generate one
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};
