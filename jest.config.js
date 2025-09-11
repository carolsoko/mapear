/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  modulePaths: ['<rootDir>/src'],
  moduleNameMapper: {
    '^generated/(.*)$': '<rootDir>/generated/$1',
  },
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  clearMocks: true,
};

