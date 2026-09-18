// backend/jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/helpers/setup.js'],
  // Transform ESM modules — required for dayjs plugins and other ESM packages
  transform: {},
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/swagger.js',
  ],
  coverageReporters: ['text', 'lcov'],
  // Increase timeout for integration tests (DB operations)
  testTimeout: 30000,
};
