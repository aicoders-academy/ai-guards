/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true
      }
    ]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
    '!src/**/*.d.ts'
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  // Skip tests that have issues with process.exit
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ]
}; 