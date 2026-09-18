// backend/tests/helpers/setup.js
// Jest test setup file — runs before all tests.
// Sets up a test database connection and provides helper functions.

import { prisma } from '../../src/config/database.js';

// Ensure test environment is set
process.env.NODE_ENV = 'test';

// Clean up database connection after all tests complete
afterAll(async () => {
  await prisma.$disconnect();
});
