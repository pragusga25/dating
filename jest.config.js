/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },

  // Collect coverage only from service.ts and route.ts files
  collectCoverageFrom: [
    './src/**/*.(service|route).ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
}
